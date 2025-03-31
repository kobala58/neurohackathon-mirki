import asyncio
import datetime

from BrainDataHandler import BrainDataHandler
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from numpy.random import random
from pydantic import BaseModel


class Device(BaseModel):
    serialNumber: str
    model: str  # we had only one model so it doesnt matter tbh


class ConnectionDetails(BaseModel):
    connected: bool
    battery: int


class Scores(BaseModel):
    timestamp: datetime.datetime
    coef_min: float
    coef_max: float
    coef_avg: float
    is_focused: bool


class Raw(BaseModel):
    timestamp: datetime.datetime
    f4: float
    f3: float
    c4: float
    c3: float
    p4: float
    p3: float
    o1: float
    o2: float


class SessionData(BaseModel):
    scores: list[Scores]
    raw: list[Raw]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Dozwolone origins - domeny, które mogą się komunikować z API
    allow_origins=[
        "http://localhost:4200",  # Vite dev server
        "http://localhost:3000",  # Alternatywny port dev
        "http://localhost",  # Produkcja
    ],
    # Dozwolone metody HTTP
    # Wszystkie metody (GET, POST, PUT, DELETE, etc.)
    allow_methods=["*"],
    # Dozwolone nagłówki
    allow_headers=["*"],  # Wszystkie nagłówki
    # Czy pozwalać na credentials (cookies, auth headers)
    allow_credentials=True,
    # Opcjonalnie: cache dla preflight requests (OPTIONS)
    max_age=3600,  # Czas cache'owania w sekundach
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/register/")
async def register_device(device: Device) -> ConnectionDetails:
    await asyncio.sleep(5)
    return ConnectionDetails(connected=True, battery=27)


@app.get("/last/session/{minutes}")
async def getLastSessionData(minutes: int) -> SessionData:
    try:
        end_time = datetime.datetime.now()
        start_time = end_time - datetime.timedelta(minutes=minutes)

        with BrainDataHandler() as db:
            # Pobierz dane z określonego zakresu czasowego
            engagement_data = db.get_engagement_data(start_time, end_time)
            raw_data_lst = db.get_raw_data(start_time, end_time)

            if not engagement_data or not raw_data_lst:
                raise HTTPException(
                    status_code=404, detail="No data found for the specified time range"
                )

            # Przygotuj dane do odpowiedzi
            scores = [
                Scores(
                    timestamp=record["timestamp"],
                    coef_min=record["coef_min"],
                    coef_max=record["coef_max"],
                    coef_avg=record["coef_avg"],
                    is_focused=record["is_focused"],
                )
                for record in engagement_data
            ]

            raw = [
                Raw(
                    timestamp=raw_data["timestamp"],
                    f4=raw_data["f4"],
                    f3=raw_data["f3"],
                    c4=raw_data["c4"],
                    c3=raw_data["c3"],
                    p4=raw_data["p4"],
                    p3=raw_data["p3"],
                    o1=raw_data["o1"],
                    o2=raw_data["o2"],
                )
                for raw_data in raw_data_lst
            ]

            return SessionData(scores=scores, raw=raw)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}")
