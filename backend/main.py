from fastapi import FastAPI
from app.database import engine
from app import models
from app.routes import waste, category
from app.routes import users




#Users
app.include_router(users.router)

@app.get("/")
def home():
    return {
        "message": "Waste Trading API is running 🚀"
    }

