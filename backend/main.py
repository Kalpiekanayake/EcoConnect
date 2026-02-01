from fastapi import FastAPI
from app.routes.users import router as user_router

app = FastAPI(title="My API")

app.include_router(user_router)
