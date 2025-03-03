from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Allow CORS for Next.js frontend (adjust origin if needed)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Get Gemini API key from .env file
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_gemini_response(user_input):
    """Send user input to Gemini API and return the response."""
    if not GEMINI_API_KEY:
        return {"error": "Missing Gemini API Key. Check .env file."}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}

    payload = {
        "contents": [{"parts": [{"text": user_input}]}]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        ai_response = response.json()

        # Debugging: Print the full response
        print("Full Gemini API Response:", ai_response)

        # Extract AI response text correctly
        bot_response = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        if not bot_response:
            return {"error": "Empty response from Gemini AI."}

        return {"response": bot_response}

    except requests.exceptions.RequestException as e:
        return {"error": f"API Error: {e}"}



@app.route("/chat", methods=["POST"])
def chat():
    """Receive a message from the user and return a chatbot response."""
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message is empty!"}), 400

    # Get response from Gemini AI
    result = get_gemini_response(user_message)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
