"""
Context-aware AI chatbot powered by Groq API.
Provides medical education and explains brain tumor detection results.
"""

import os
from typing import List, Dict, Optional
from groq import Groq
from educational_data import get_tumor_info, FAQS

# Initialize Groq client
client = None

def initialize_groq_client(api_key: str = None):
    """Initialize the Groq API client."""
    global client
    if api_key is None:
        api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    
    client = Groq(api_key=api_key)
    return client

# System prompt that defines the chatbot's personality and role
SYSTEM_PROMPT = """You are MedBot, an intelligent medical education assistant for a Brain Tumor Detection platform. Your role is to:

1. **Explain AI predictions** in simple, understandable terms
2. **Educate users** about different brain tumor types (Glioma, Meningioma, Pituitary)
3. **Answer questions** about symptoms, treatments, and medical concepts
4. **Provide context** about the AI model's capabilities and limitations

**CRITICAL RULES:**
- Always include a medical disclaimer when discussing health topics
- Never provide definitive diagnoses - emphasize this is educational only
- Encourage users to consult healthcare professionals for medical advice
- Be empathetic and supportive, especially when discussing concerning results
- Use simple language, avoid excessive medical jargon
- If you don't know something, admit it rather than guessing

**Tone:** Friendly, professional, educational, and compassionate

**Medical Disclaimer Template:** 
"⚕️ *Important: This AI tool is for educational purposes only. Always consult qualified healthcare professionals for medical diagnosis and treatment.*"

When users ask about their scan results, reference the specific prediction and confidence level provided in the context.
"""

def build_context_prompt(context: Optional[Dict] = None) -> str:
    """Build a context-aware prompt based on scan results."""
    if not context:
        return ""
    
    prediction = context.get("prediction", "")
    confidence = context.get("confidence", 0)
    all_scores = context.get("all_scores", [])
    
    # Get detailed tumor information
    tumor_info = get_tumor_info(prediction)
    
    context_prompt = f"\n\n**CURRENT SCAN CONTEXT:**\n"
    context_prompt += f"- Prediction: {prediction}\n"
    context_prompt += f"- Confidence: {confidence}%\n"
    
    if all_scores:
        labels = ['Glioma', 'Meningioma', 'Normal', 'Pituitary']
        context_prompt += f"- All Probabilities:\n"
        for label, score in zip(labels, all_scores):
            context_prompt += f"  - {label}: {score*100:.1f}%\n"
    
    if tumor_info:
        context_prompt += f"\n**TUMOR TYPE INFO:**\n"
        context_prompt += f"- Description: {tumor_info['short_description']}\n"
        context_prompt += f"- Severity: {tumor_info['severity']}\n"
    
    context_prompt += "\nUse this information to provide context-aware responses about the user's scan.\n"
    
    return context_prompt

def format_conversation_history(history: List[Dict]) -> List[Dict]:
    """Format conversation history for Groq API."""
    formatted = []
    for msg in history[-10:]:  # Keep last 10 messages for context
        formatted.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    return formatted

async def get_chatbot_response(
    user_message: str,
    context: Optional[Dict] = None,
    conversation_history: List[Dict] = None
) -> str:
    """
    Get a response from the Groq-powered chatbot.
    
    Args:
        user_message: The user's question or message
        context: Optional scan result context (prediction, confidence, scores)
        conversation_history: List of previous messages in the conversation
    
    Returns:
        The chatbot's response as a string
    """
    global client
    
    if client is None:
        initialize_groq_client()
    
    if conversation_history is None:
        conversation_history = []
    
    # Build the messages array
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    # Add context if available
    if context:
        context_prompt = build_context_prompt(context)
        messages.append({
            "role": "system",
            "content": context_prompt
        })
    
    # Add conversation history
    messages.extend(format_conversation_history(conversation_history))
    
    # Add current user message
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    try:
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",  # Fast and accurate model
            temperature=0.7,  # Balanced creativity and consistency
            max_tokens=800,  # Reasonable response length
            top_p=0.9,
            stream=False
        )
        
        response = chat_completion.choices[0].message.content
        return response
        
    except Exception as e:
        error_msg = f"I apologize, but I'm having trouble connecting to my AI brain right now. Error: {str(e)}"
        error_msg += "\n\n⚕️ *If you have medical concerns, please consult a healthcare professional immediately.*"
        return error_msg

def get_suggested_questions(context: Optional[Dict] = None) -> List[str]:
    """Generate suggested questions based on context."""
    if not context:
        return [
            "What are the different types of brain tumors?",
            "How does AI detect brain tumors?",
            "What are common symptoms of brain tumors?",
            "How accurate is this AI model?"
        ]
    
    prediction = context.get("prediction", "")
    confidence = context.get("confidence", 0)
    
    suggestions = [
        f"What is a {prediction}?",
        "Explain my results in simple terms",
        "What should I do next?",
        "How accurate is this prediction?"
    ]
    
    if confidence < 70:
        suggestions.append("Why is the confidence low?")
    
    return suggestions
