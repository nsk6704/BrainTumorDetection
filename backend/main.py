import os
import pickle
import numpy as np
import cv2
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from pydantic import BaseModel
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Import chatbot and educational modules
from chatbot import get_chatbot_response, get_suggested_questions, initialize_groq_client
from educational_data import get_tumor_info, get_all_tumor_info, get_faqs

# Load environment variables
load_dotenv()

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

# Session storage for conversation history (in-memory for MVP)
# In production, use Redis or a database
conversation_sessions = {}

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    suggested_questions: List[str]

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
    
    # Initialize Groq chatbot
    try:
        initialize_groq_client()
        print("Groq chatbot initialized successfully")
    except Exception as e:
        print(f"Warning: Groq chatbot initialization failed: {e}")
        print("Chatbot features will be unavailable. Set GROQ_API_KEY in .env file.")

@app.get("/")
def read_root():
    return {"message": "Brain Tumour Detection API is running"}

@app.get("/stats")
def get_stats():
    if os.path.exists(HISTORY_PATH):
        with open(HISTORY_PATH, "rb") as f:
            history = pickle.load(f)
        
        # Add summary stats
        summary = {
            "max_accuracy": round(max(history.get('accuracy', [0])) * 100, 2),
            "max_val_accuracy": round(max(history.get('val_accuracy', [0])) * 100, 2),
            "final_loss": round(history.get('loss', [0])[-1], 4),
            "epochs": len(history.get('accuracy', []))
        }
        return {"history": history, "summary": summary}
    else:
        raise HTTPException(status_code=404, detail="Training history not found")

@app.get("/model-info")
def get_model_info():
    if model:
        # Count layer types
        layer_counts = {}
        for layer in model.layers:
            l_type = type(layer).__name__
            layer_counts[l_type] = layer_counts.get(l_type, 0) + 1
        
        # Build descriptive info
        architecture_type = "Deep Convolutional Neural Network (CNN)"
        description = (
            f"The model is a {architecture_type} meticulously designed for high-resolution MRI analysis. "
            f"It features {layer_counts.get('Conv2D', 0)} Convolutional layers that extract intricate spatial features from the scans, "
            f"supported by {layer_counts.get('MaxPooling2D', 0)} Max Pooling layers for downsampling and translational invariance. "
            f"To prevent overfitting, {layer_counts.get('Dropout', 0)} Dropout layers are strategically placed throughout the network. "
            f"The final classification is handled by {layer_counts.get('Dense', 0)} Fully Connected layers, culminating in a 4-way Softmax output."
        )

        return {
            "name": "NeuroScan CNN V1",
            "type": architecture_type,
            "description": description,
            "params": f"{model.count_params():,}",
            "stats": [
                {"label": "Convolutional Stages", "value": layer_counts.get('Conv2D', 0)},
                {"label": "Pooling Operations", "value": layer_counts.get('MaxPooling2D', 0)},
                {"label": "Regularization Layers", "value": layer_counts.get('Dropout', 0)},
                {"label": "Input Resolution", "value": "150x150x3"}
            ]
        }
    else:
        return {
            "name": "Model Not Loaded",
            "description": "The AI engine is currently offline or the model file could not be loaded.",
            "params": "0",
            "stats": []
        }

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

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint for AI-powered medical education assistant.
    Supports context-aware responses based on scan results.
    """
    try:
        # Generate or retrieve session ID
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get conversation history for this session
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = []
        
        conversation_history = conversation_sessions[session_id]
        
        # Get chatbot response
        response = await get_chatbot_response(
            user_message=request.message,
            context=request.context,
            conversation_history=conversation_history
        )
        
        # Update conversation history
        conversation_history.append({"role": "user", "content": request.message})
        conversation_history.append({"role": "assistant", "content": response})
        
        # Keep only last 20 messages to prevent memory bloat
        if len(conversation_history) > 20:
            conversation_history = conversation_history[-20:]
        
        conversation_sessions[session_id] = conversation_history
        
        # Get suggested questions
        suggestions = get_suggested_questions(request.context)
        
        return ChatResponse(
            response=response,
            session_id=session_id,
            suggested_questions=suggestions
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/educational-content")
def get_educational_content():
    """
    Get educational content for all tumor types and FAQs.
    """
    return {
        "tumor_types": get_all_tumor_info(),
        "faqs": get_faqs()
    }

@app.get("/educational-content/{tumor_type}")
def get_educational_content_by_type(tumor_type: str):
    """
    Get detailed educational content for a specific tumor type.
    """
    info = get_tumor_info(tumor_type)
    if info is None:
        raise HTTPException(status_code=404, detail=f"Tumor type '{tumor_type}' not found")
    return info

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
