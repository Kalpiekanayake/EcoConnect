from fastapi import FastAPI
from app.routes import users, waste, category

app = FastAPI(title="Waste Trading API")

@app.get("/")
def home():
    return {"message": "Waste Trading API is running"}

app.include_router(users.router)
app.include_router(waste.router)
app.include_router(category.router)
