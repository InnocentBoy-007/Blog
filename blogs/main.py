from fastapi import FastAPI
import schemas, models
from database import engine
from sqlalchemy.orm import Session

app = FastAPI()

models.Base.metadata.create_all(bind=engine)
    
# Using a request body
@app.post('/')
def create(request: schemas.Blog, db: Sess):
    return request