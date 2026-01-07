# 🚀 Quick Setup Guide for Chatbot Feature

## Step 1: Get Your Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up for a free account (no credit card required!)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the generated key (it looks like: `gsk_...`)

## Step 2: Create .env File

In the `backend` folder, create a file named `.env` (yes, just `.env` with no other name):

**Option A: Using Command Line (PowerShell)**
```powershell
cd backend
echo GROQ_API_KEY=your_actual_api_key_here > .env
```

**Option B: Manual Creation**
1. Open the `backend` folder
2. Create a new file called `.env` (not `.env.txt`)
3. Add this single line:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
4. Save the file

## Step 3: Verify Setup

Your `.env` file should look exactly like this:
```
GROQ_API_KEY=gsk_abc123xyz...
```

**Important Notes:**
- ✅ No quotes around the API key
- ✅ No spaces before or after the `=`
- ✅ File must be named exactly `.env` (not `.env.txt`)
- ✅ File must be in the `backend` folder
- ⚠️ Never commit this file to Git (it's already in `.gitignore`)

## Step 4: Test It Works

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

If you see:
```
Groq chatbot initialized successfully
```
✅ You're all set!

If you see:
```
Warning: Groq chatbot initialization failed
```
❌ Check your `.env` file and API key

## Troubleshooting

**Problem**: "GROQ_API_KEY not found"
- **Solution**: Make sure `.env` file is in the `backend` folder, not the root folder

**Problem**: "Invalid API key"
- **Solution**: Double-check you copied the entire key from Groq console

**Problem**: File shows as `.env.txt` in Windows
- **Solution**: In File Explorer, go to View → Show → File name extensions, then rename to remove `.txt`

## For Deployment (Render)

When deploying to Render, you don't need the `.env` file. Instead:
1. Go to your Render dashboard
2. Select your web service
3. Go to **Environment** tab
4. Add environment variable:
   - **Key**: `GROQ_API_KEY`
   - **Value**: Your Groq API key
5. Save changes

---

Need help? The chatbot won't work without the API key, but the rest of the app (tumor detection, stats, model info) will work fine!
