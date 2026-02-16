from fastapi import FastAPI
from app.database import engine, Base


from app.routes import users
from app.routes import categories
from app.routes import waste

from app.routes import auth





app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(categories.router)
app.include_router(waste.router)
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "API running"}



