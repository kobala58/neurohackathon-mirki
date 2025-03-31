import brainaccess_board as bb
import time
import numpy as np
import threading
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq
from scipy.signal import welch
from scipy.integrate import simpson
import scipy
from scipy.fft import fft, fftfreq
import pandas as pd
import psycopg2
from datetime import datetime

# Konfiguracja połączenia z bazą danych
conn = psycopg2.connect(
    dbname="braindata",
    user="user",
    password="password",
    host="156.17.72.113",
    port="5432"
)

cur = conn.cursor()

# Funkcja do zapisywania danych do bazy
def save_to_database(eng_data, final_data):
    try:
        # Wstawianie danych do tabeli engagement
        cur.execute("""
            INSERT INTO engagement (timestamp, coef_min, coef_max, coef_avg, is_focused)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (datetime.fromtimestamp(eng_data["timestamp"] / 1000.0), float(eng_data["coeff_min"]), float(eng_data["coeff_max"]),
              float(eng_data["coeff_avg"]), eng_data["is_focused"]))
        engagement_id = cur.fetchone()[0]
        print(f"Inserted engagement record with id: {engagement_id}")

        # Wstawianie danych do tabeli raw_data
        cur.execute("""
            INSERT INTO raw_data (timestamp, f4, f3, c4, c3, p4, p3, o1, o2)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (datetime.fromtimestamp(final_data["timestamp"] / 1000.0),float(final_data["F4"][-1]),float(final_data["F3"][-1]),float(final_data["C4"][-1]),float(final_data["C3"][-1]),float(final_data["P4"][-1]),float(final_data["P3"][-1]),float(final_data["O1"][-1]),float(final_data["O2"][-1])))
        raw_data_id = cur.fetchone()[0]
        print(f"Inserted raw data record with id: {raw_data_id}")

        # Zatwierdzanie transakcji
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    # finally:
    #     cur.close()
    #     conn.close()

run_flag = True
not_connected = True
final_data = dict()
alfa = 10
db, status = bb.db_connect()

def worker_thread():
    global final_data
    global not_connected
    global db, status
    print("Worker thread started")

    if status:
        data = db.get_mne()
        data_field_value = "Empty"

    data_array = list()

    while run_flag:
        if not data:
            data_field_value = "No data available, please connect the device in the board configuration"
        devices = list(data.keys())
        for device in devices:
            temp = data[device].get_data()
        final_data = {"F4": (temp[0]*1000)[-250*alfa:],
                      "F3": (temp[1]*1000)[-250*alfa:],
                      "C4": (temp[2]*1000)[-250*alfa:],
                      "C3": (temp[3]*1000)[-250*alfa:],
                      "P4": (temp[4]*1000)[-250*alfa:],
                      "P3": (temp[5]*1000)[-250*alfa:],
                      "O1": (temp[6]*1000)[-250*alfa:],
                      "O2": (temp[7]*1000)[-250*alfa:],}
    print("Worker thread stopped")

def stop_thread():
    global run_flag
    global alfa
    indeks = 1
    for _ in range(alfa):
        time.sleep(1)
        print(f"Timer: {indeks}")
        indeks += 1
    run_flag = False


if __name__ == "__main__":

    engamenent_df = pd.DataFrame(columns=[
                      "coeff_min",
                      "coeff_max",
                      "coeff_avg",
                      "is_focused",
                      "timestamp"])

    signals_df = pd.DataFrame(columns=["F4",
                               "F3",
                               "C4",
                               "C3",
                               "P4",
                               "P3",
                               "O1",
                               "O2",
                               "timestamp"])

    amp_signals_dict = {"F4": [],
                        "F3": [],
                        "C4": [],
                        "C3": [],
                        "P4": [],
                        "P3": [],
                        "O1": [],
                        "O2": [],
                        "timestamp": []}

    for _ in range(20):

        timestamp = time.time()*1000
        eng_data = dict()

        worker = threading.Thread(target=worker_thread)
        worker.start()

        run_flag = True

        stopper = threading.Thread(target=stop_thread)
        stopper.start()

        worker.join()
        print("While loop thread has completed.")

        array_measure = []

        to_append = []

        for key in final_data.keys():
            signal = final_data[key]
            to_append.append(signal)

            fs = 250
            N = len(signal)

            yf = fft(signal)
            xf = fftfreq(N, 1 / fs)

            amplitude = 2.0 / N * np.abs(yf[:N // 2])
            freq = xf[:N // 2]

            amp_signals_dict[key].append(amplitude)

            bands = {
                'Theta': (4, 8),
                'Alpha': (8, 13),
                'Beta': (13, 32),
            }

            def get_band_power(freq, amplitude, band):
                mask = (freq >= band[0]) & (freq <= band[1])
                return simpson(y=amplitude[mask] ** 2, x=freq[mask])


            total_power = get_band_power(freq, amplitude, (4, 32))

            for band_name, band_range in bands.items():
                band_power = get_band_power(freq, amplitude, band_range)
                power_ratio = (band_power / total_power) * 100


            measure_std = (get_band_power(freq, amplitude, (13, 32))) / (
                        (get_band_power(freq, amplitude, (8, 13))) + (
                            get_band_power(freq, amplitude, (4, 8))))  # engagement index
            array_measure.append(measure_std)


        eng_data["coeff_min"] = min(array_measure)
        eng_data["coeff_max"] = max(array_measure)
        eng_data["coeff_avg"] = sum(array_measure) / len(array_measure)
        ifek = sum(array_measure) / len(array_measure)
        if float(ifek) > 0.26:
            eng_data["is_focused"] = True
        else:
            eng_data["is_focused"] = False
        eng_data["timestamp"] = timestamp
        print("eng data", eng_data)
        final_data["timestamp"] = timestamp
        amp_signals_dict["timestamp"] = timestamp

        engamenent_df.loc[len(engamenent_df)] = eng_data
        signals_df.loc[len(signals_df)] = final_data

        save_to_database(eng_data, final_data)

    pd.DataFrame(amp_signals_dict).to_csv("emp_signals")
    engamenent_df.to_csv("enga.csv")
    signals_df.to_csv("sign.csv")
