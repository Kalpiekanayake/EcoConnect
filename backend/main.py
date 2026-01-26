from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Categories
categories = ["coconut_shell", "plastic", "glass", "paper"]
category_data = {cat: [] for cat in categories}  # Temporary storage per category

# Pydantic model
class WasteRequest(BaseModel):
    name: str
    quantity: int
    category: str  # Must be one of the categories

# Home route
@app.get("/")
def home():
    return {"message": "Waste Collector API is running!"}

# Collect waste
@app.post("/collect")
def collect_waste(data: WasteRequest):
    if data.category not in category_data:
        return {"status": "error", "message": f"Category '{data.category}' not supported."}
    
    category_data[data.category].append(data)
    return {"status": "success", "received_data": data}

# Get all collections (optionally by category)
@app.get("/all-collections/{category}")
def get_collections_by_category(category: str):
    if category not in category_data:
        return {"status": "error", "message": f"Category '{category}' not found."}
    return {"category": category, "collections": category_data[category]}

# Get all collections (all categories)
@app.get("/all-collections")
def get_all_collections():
    return category_data
