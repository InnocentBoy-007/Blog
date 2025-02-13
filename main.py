from fastapi import FastAPI

# instantiate the FastAPI class
app = FastAPI()

@app.get("/") # / is the base path in FastAPI and .get() is the operation
def read_root(): # The name does't matter , This the path operation function
    return {'data': {
        'name': 'John Doe',
    }}

@app.get('/about')
def about():
    return {'data': 'about page'}

