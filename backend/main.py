from fastapi import FastAPI
from app.database import engine
from pydantic import BaseModel
from app import models


models.Base.metadata.create_all(bind=engine)


app = FastAPI()

from app.routes import waste

app.include_router(waste.router)


# Temporary storage
coconut_data = []

# Pydantic model
class CoconutRequest(BaseModel):
    name: str
    coconut_qty: int

@app.get("/")
def home():
    return {"message": "Coconut Collector API is running!"}

@app.post("/collect")
def collect_coconuts(data: CoconutRequest):
    coconut_data.append(data)
    return {
        "status": "success",
        "received_data": data
    }

# 🔹 Day 5: GET endpoint
@app.get("/all-collections")
def get_all_collections():
    return {"collections": coconut_data}
