from fastapi import FastAPI
from app.database import engine
from app import models
from app.routes import waste, category


# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Waste Trading API")

# Routes
app.include_router(waste.router)

#Cateory
app.include_router(category.router)

@app.get("/")
def home():
    return {
        "message": "Waste Trading API is running 🚀"
    }
