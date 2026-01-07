# NeuroScan AI | Brain Tumour Detection

A professional medical imaging analysis platform using a Convolutional Neural Network (CNN) to detect and classify brain tumours from MRI scans. Now featuring an AI-powered chatbot and comprehensive educational resources!

## Project Structure

- **`backend/`**: FastAPI server handling predictions, chatbot, and educational content.
- **`frontend/`**: Modern dashboard built with Vanilla JS, Tailwind CSS, and Chart.js.
- **`models/`**: Pre-trained CNN model (`braintumourN.h5`).
- **`data/`**: Training history logs for visualisations.

## Features

- **Instant Classification**: Detects Glioma, Meningioma, Pituitary tumours, or No Tumour.
- **Visual Analytics**: Interactive charts showing training accuracy and loss curves.
- **Model Transparency**: View detailed model architecture and performance metrics.
- **🤖 AI Chatbot**: Context-aware medical education assistant powered by Groq AI
- **📚 Educational Resources**: Interactive tumor information cards, FAQs, and detailed modal popups
- **Modern UI**: Dark-mode, glassmorphism dashboard with drag-and-drop upload.

## How to Run Locally

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Groq API key
# Get free API key from: https://console.groq.com/keys
echo "GROQ_API_KEY=your_api_key_here" > .env

# Start the server
uvicorn main:app --reload
```

### 2. Frontend Setup

Open `frontend/index.html` in your browser (use Live Server for best results).

**Important**: Update the API_BASE URL in `frontend/script.js` if running locally:
```javascript
const API_BASE = 'http://localhost:8000';  // For local development
```

## New Features Guide

### 🤖 AI Chatbot
- Click the floating chat button (bottom-right) to open MedBot
- Ask questions about brain tumors, symptoms, treatments
- After uploading a scan, click "Ask About This Result" for context-aware explanations
- Chatbot remembers conversation context for natural follow-up questions

### 📚 Educational Resources
- Navigate to the "Education" section in the sidebar
- Click on any tumor type card to view detailed information
- Explore FAQs about AI accuracy, tumor types, and medical advice
- All content includes appropriate medical disclaimers

## Deployment (No Card Required)

### 1. Backend (Render)

1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Name**: `brain-tumor-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variable**: 
   - Key: `GROQ_API_KEY`
   - Value: Your Groq API key from https://console.groq.com/keys
6. Select the **Free** instance type.
7. Click **Create Web Service**.

### 2. Frontend (Vercel)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your repository.
4. It will automatically use the `vercel.json` and deploy.
5. **Update URL**: Copy your Render API URL and paste it into `frontend/script.js` (replace the API_BASE constant).

## API Endpoints

- `POST /predict` - Upload MRI scan for tumor detection
- `GET /stats` - Get training statistics and history
- `GET /model-info` - Get model architecture details
- `POST /chat` - Chat with AI medical education assistant
- `GET /educational-content` - Get all tumor information and FAQs
- `GET /educational-content/{tumor_type}` - Get specific tumor details

## Tech Stack

- **Backend**: FastAPI, TensorFlow, OpenCV, Groq AI
- **Frontend**: Vanilla JavaScript, Tailwind CSS, Chart.js
- **AI Model**: Custom CNN trained on brain MRI dataset
- **Chatbot**: Groq API with Llama 3.3 70B model

## Medical Disclaimer

⚕️ This tool is for **educational purposes only**. It should never replace professional medical diagnosis or treatment. Always consult qualified healthcare professionals for medical advice.

## License

MIT License - Feel free to use for educational purposes!
