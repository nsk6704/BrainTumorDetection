# NeuroScan AI | Brain Tumour Detection

A professional medical imaging analysis platform using a Convolutional Neural Network (CNN) to detect and classify brain tumours from MRI scans.

## Project Structure

- **`backend/`**: FastAPI server handling predictions and model statistics.
- **`frontend/`**: Modern dashboard built with Vanilla JS, Tailwind CSS, and Chart.js.
- **`models/`**: Pre-trained CNN model (`braintumourN.h5`).
- **`data/`**: Training history logs for visualisations.

## Features

- **Instant Classification**: Detects Glioma, Meningioma, Pituitary tumours, or No Tumour.
- **Visual Analytics**: Interactive charts showing training accuracy and loss curves.
- **Model Transparency**: View detailed model architecture and performance metrics.
- **Modern UI**: Dark-mode, glassmorphism dashboard with drag-and-drop upload.

## How to Run Locally

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
2. **Frontend**:
   Open `frontend/index.html` in your browser (use Live Server for best results).

## Deployment

- **Backend (Render)**: Connect your repository and use the provided `render.yaml`.
- **Frontend (Vercel)**: Connect your repository and it will auto-detect the `vercel.json` configuration.
