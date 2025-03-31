import time

import psycopg2
from psycopg2 import Error


def wait_for_db(max_attempts=30, delay_seconds=1):
    """Wait for database to become available"""
    attempt = 0
    while attempt < max_attempts:
        try:
            conn = psycopg2.connect(
                host="localhost",
                database="braindata",
                user="user",
                password="password",
                port="5432",
            )
            conn.close()
            print("Database is ready!")
            return True
        except Error:
            attempt += 1
            print(f"Waiting for database... Attempt {attempt}/{max_attempts}")
            time.sleep(delay_seconds)
    return False


def initialize_database():
    """Initialize database with required tables"""
    try:
        # Connect to database
        conn = psycopg2.connect(
            host="localhost",
            database="braindata",
            user="user",
            password="password",
            port="5432",
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Create tables
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS engagement (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP NOT NULL,
                coef_min FLOAT NOT NULL,
                coef_max FLOAT NOT NULL,
                coef_avg FLOAT NOT NULL,
                is_focused BOOLEAN NOT NULL
            );

            CREATE TABLE IF NOT EXISTS raw_data (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP NOT NULL,
                f4 FLOAT NOT NULL,
                f3 FLOAT NOT NULL,
                c4 FLOAT NOT NULL,
                c3 FLOAT NOT NULL,
                p4 FLOAT NOT NULL,
                p3 FLOAT NOT NULL,
                o1 FLOAT NOT NULL,
                o2 FLOAT NOT NULL
            );
        """
        )

        print("Tables created successfully!")

    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()
            print("Database connection closed.")


if __name__ == "__main__":
    if wait_for_db():
        initialize_database()
    else:
        print("Failed to connect to database")
