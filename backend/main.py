from fastapi import FastAPI
from app.database import engine
from app.models.user import User
from app.database import Base
from app.routes.users import router as user_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Waste Trading API")

@app.get("/")
def home():
    return {"message": "API is running"}

app.include_router(user_router)
