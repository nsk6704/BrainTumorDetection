import os
import pickle
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="Brain Tumour Detection API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "braintumourN.h5")
HISTORY_PATH = os.path.join(os.path.dirname(__file__), "data", "training_history.pkl")
IMAGE_SIZE = 150
LABELS = ['Glioma Tumour', 'Meningioma Tumour', 'No Tumour', 'Pituitary Tumour']

# Global model variable
model = None

@app.on_event("startup")
def load_resources():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = load_model(MODEL_PATH)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Model file not found at {MODEL_PATH}")

@app.get("/")
def read_root():
    return {"message": "Brain Tumour Detection API is running"}

@app.get("/stats")
def get_stats():
    if os.path.exists(HISTORY_PATH):
        with open(HISTORY_PATH, "rb") as f:
            history = pickle.load(f)
        return history
    else:
        raise HTTPException(status_code=404, detail="Training history not found")

@app.get("/model-info")
def get_model_info():
    if model:
        # Extract basic info from model summary as string
        # Since model.summary() prints to stdout, we just return basic layered info
        layers = []
        for layer in model.layers:
            layers.append({
                "name": layer.name,
                "type": type(layer).__name__,
                "output_shape": layer.output_shape
            })
        return {
            "name": "CNN Brain Tumour Detector",
            "accuracy": "94.16%",
            "layers": layers
        }
    else:
        raise HTTPException(status_code=404, detail="Model not loaded")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Preprocess
        img_res = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
        img_array = np.array(img_res).reshape(1, IMAGE_SIZE, IMAGE_SIZE, 3)
        
        # Predict
        prediction = model.predict(img_array)
        index = np.argmax(prediction, axis=1)[0]
        confidence = float(np.max(prediction))
        
        return {
            "prediction": LABELS[index],
            "index": int(index),
            "confidence": round(confidence * 100, 2),
            "all_scores": prediction.tolist()[0]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
