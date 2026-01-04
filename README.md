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

## Deployment (No Card Required)

### 1. Backend (Render)
To avoid being asked for a credit card, use the **Manual Setup** instead of the Blueprint:
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Name**: `brain-tumor-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Select the **Free** instance type.
6. Click **Create Web Service**.

### 2. Frontend (Vercel)
Vercel is completely free for personal projects and does not require a card:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your repository.
4. It will automatically use the `vercel.json` and deploy.
5. **Update URL**: Copy your Render API URL and paste it into `frontend/script.js` (replace `http://localhost:8000`).

