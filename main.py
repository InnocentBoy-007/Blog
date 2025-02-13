from fastapi import FastAPI

# instantiate the FastAPI class
app = FastAPI()

@app.get("/")
def read_root():
    return {'data': {
        'name': 'John Doe',
    }}

@app.get('/about')
def about():
    return {'data': 'about page'}

