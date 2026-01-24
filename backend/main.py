from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Temporary storage
coconut_data = []

# Pydantic model for POST request
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
