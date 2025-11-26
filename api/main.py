from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from routes_auth import router as auth_router
from routes_offers import router as offers_router
from routes_orders import router as orders_router
from routes_stats import router as stats_router

app = FastAPI(title="Producer-Buyer POC", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for POC; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(offers_router)
app.include_router(orders_router)
app.include_router(stats_router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/api/health")
def health():
    return {"status": "ok"}
