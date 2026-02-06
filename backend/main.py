from fastapi import FastAPI
from app.database import engine
from app.models import user, category
from app.routes import users, categories
from app.routes import users, categories, waste

user.Base.metadata.create_all(bind=engine)
category.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router)
app.include_router(categories.router)

@app.get("/")
def root():
    return {"message": "Waste Trading API is running"}

app.include_router(users.router)
app.include_router(categories.router)
app.include_router(waste.router)