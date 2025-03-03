from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re

# Load API key from environment variables
API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)  # Enable CORS

# Difficulty levels mapping
difficulty_levels = ["Basic", "Intermediate", "Advanced"]
current_level = 1  # Start at "Intermediate"
question_data = {}  # Store last generated question

def generate_question(level="Intermediate", topic="Ohm's Law"):
    """Generate an MCQ using AI based on difficulty level."""
    if not API_KEY:
        return {"error": "API Key is missing. Check .env.local file."}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}

    prompt = f"""
    You are a physics tutor. Generate a **multiple-choice question (MCQ)** on **{topic}**.

    **Difficulty Level:** {level}

    Format:
    - **Question:** <question>
    - A) <option 1>
    - B) <option 2>
    - C) <option 3>
    - D) <option 4>
    - **Correct Answer:** <A/B/C/D>

    Ensure the response follows this structure strictly.
    """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        ai_response = response.json()

        # Extract AI response
        question_text = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        if not question_text:
            return {"error": "AI response was empty."}

        # Regex for extracting question, options, and correct answer
        question_match = re.search(r"\*\*Question:\*\*\s*(.+)", question_text)
        options = re.findall(r"([A-D])\)\s*(.+)", question_text)
        correct_answer_match = re.search(r"\*\*Correct Answer:\*\*\s*([A-D])", question_text)

        if not question_match or not options or not correct_answer_match:
            return {"error": "Invalid AI response format."}

        question = question_match.group(1).strip()
        correct_answer = correct_answer_match.group(1).strip()
        options_dict = {opt[0]: opt[1].strip() for opt in options}

        # Ensure exactly 4 options and a valid correct answer
        if len(options_dict) != 4 or correct_answer not in options_dict:
            return {"error": "Invalid options or answer key from AI."}

        global question_data
        question_data = {
            "question": question,
            "A": options_dict["A"],
            "B": options_dict["B"],
            "C": options_dict["C"],
            "D": options_dict["D"],
            "answer": correct_answer,
        }

        return question_data

    except requests.exceptions.RequestException as e:
        return {"error": f"API Error: {e}"}

@app.route("/simplify-text", methods=["POST"])
def simplify_text():
    """Simplify a block of text using Gemini API."""
    text_to_simplify = request.json.get("text")
    if not text_to_simplify:
        return jsonify({"error": "No text provided for simplification."}), 400

    prompt = f"""
    You are a tutor. Simplify the following text from a physics lab procedure to make it easier to understand for high school students and explain the purpose of the instruction. 
    
    The text to simplify is: {text_to_simplify}

    Your response should be in this format:
    
    Simplified Text: [your simplified version here]
    
    Purpose: [explain why this instruction is important]
    
    Provide the simplified text focusing on clarity and avoiding technical jargon where possible. Keep the core meaning intact.
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        ai_response = response.json()

        # Extract simplified text
        simplified_text = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        # Format processing to remove ** and other markdown characters
        simplified_text = simplified_text.replace("**Simplified Text:**", "Simplified Text:")
        simplified_text = simplified_text.replace("**Purpose:**", "Purpose:")
        simplified_text = simplified_text.replace("**", "")
        simplified_text = simplified_text.replace("***", "")
        
        # Remove any extra whitespace and ensure consistent formatting
        simplified_text = simplified_text.strip()
        
        if simplified_text:
            return jsonify({"simplified_text": simplified_text})
        return jsonify({"error": "Simplified text not found in API response."}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API Request Error: {e}"}), 500

@app.route("/generate-question", methods=["GET"])
def get_question():
    """Return an MCQ question based on current difficulty."""
    question = generate_question(level=difficulty_levels[current_level])
    return jsonify(question)

@app.route("/check-answer", methods=["POST"])
def check_answer():
    """Validate user's answer, adjust difficulty, and provide an explanation."""
    global current_level

    data = request.json
    selected_answer = data.get("selected_answer")

    if not question_data:
        return jsonify({"error": "No question generated yet!"}), 400

    correct_answer = question_data.get("answer")
    is_correct = selected_answer == correct_answer
    message = "✅ Correct! Next question will be harder." if is_correct else "❌ Incorrect! Next question will be easier."

    # Adjust difficulty
    current_level = min(current_level + 1, 2) if is_correct else max(current_level - 1, 0)

    explanation = generate_explanation(
        question_data["question"], question_data[correct_answer], question_data
    )

    return jsonify({
        "message": message,
        "new_level": difficulty_levels[current_level],
        "correct_answer": correct_answer,
        "explanation": explanation,
    })

def generate_explanation(question, correct_answer, question_data):
    """Generate a brief explanation for the correct answer."""
    if not API_KEY:
        return "Explanation not available due to missing API key."

    prompt = f"""
    You are a physics tutor. Explain the correct answer for the following MCQ in **2-3 sentences**.

    **Question:** {question}
    **Correct Answer:** {correct_answer}

    **Options:**
    A) {question_data["A"]}
    B) {question_data["B"]}
    C) {question_data["C"]}
    D) {question_data["D"]}

    Provide a concise explanation.
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        ai_response = response.json()

        # Extract explanation
        explanation = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        return explanation if explanation else "No explanation provided by AI."

    except requests.exceptions.RequestException as e:
        return f"API Request Error: {e}"

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech using Voice RSS API."""
    data = request.get_json()
    if 'text' not in data:
        return jsonify({'error': 'Text is required.'}), 400

    text = data['text']
    url = f'https://api.voicerss.org/?key=cee124818c53400f81056fb6fb251eb4&src={text}&hl=en-us&r=0&c=mp3&f=44khz_16bit_stereo'
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch audio response'}), response.status_code

        audio_url = response.text  # Getting the audio URL from the response
        return jsonify({'audioUrl': audio_url})
    except Exception as e:
        print(f'Error fetching audio: {e}')
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Start on port 5000