from fastapi import FastAPI
from pydantic import BaseModel

# instantiate the FastAPI class
app = FastAPI()

@app.get("/blog")
def index():
    return {'data':'blog-list'}

# Take care of dynamic routing bugs
@app.get('/blog/unpublished')
def unpulished():
    return {'data':'all unpublished blogs'}

@app.get("/blog/{id}")
def show(id : int): # defining the type for the parameter
    return {'data':id}

@app.get("/blog/{id}/comments")
def comments(id : int):
    return {'data': {'1','2'}}

