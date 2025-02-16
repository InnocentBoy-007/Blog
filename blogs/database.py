from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base # for creating the mappings
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = 'sqlite:///blog.db' # databse url
 
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base() # instance of the base class