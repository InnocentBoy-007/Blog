from fastapi import FastAPI
from typing import Optional

# instantiate the FastAPI class
app = FastAPI()

@app.get("/blog")
def index(limit=10,published: bool= True, sort: Optional[str] = None): # Query parameters, we should specify the query parameter type
    if published:
        return {'data':f'{limit} blogs from the database'}
    else:
        return {'data':f'{limit} unpublished blogs from the database'}
        
# Take care of dynamic routing bugs
@app.get('/blog/unpublished')
def unpulished():
    return {'data':'all unpublished blogs'}

@app.get("/blog/{id}") # path parameter
def show(id : int): # defining the type for the parameter
    return {'data':id}

@app.get("/blog/{id}/comments")
def comments(id : int, limit=10):
    return limit
    

