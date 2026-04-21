from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base


from app.routes import auth
from app.routes import users
from app.routes import categories
from app.routes import waste








app = FastAPI()

origins = [
    "http://localhost:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )

from app.models import User, WasteCategory, PickupRequest

Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(categories.router)
app.include_router(waste.router)
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "API running"}



