import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
print("FastAPI Python Path:", sys.executable)

from fastapi import FastAPI
import uvicorn
from app.api.v1.predict_controller import predict_router
from app.api.v1.design_controller import design_router
from fastapi.middleware.cors import CORSMiddleware
from configs.config import settings

# create FastAPI app
app = FastAPI(
    title=settings.TITLE,
    version=settings.VERSION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
)

# expose routers
API_PREFIX = f"/{settings.VERSION}"
app.include_router(predict_router, prefix=API_PREFIX)
app.include_router(design_router, prefix=API_PREFIX)

# run app
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
