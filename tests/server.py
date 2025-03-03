from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re
from dotenv import load_dotenv
import random  # Import the random module

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

# Your API Key
API_KEY = os.getenv("GEMINI_API_KEY")

# Blueprint for verification
blueprint = """
Aim:
To determine the concentration of the given hydrochloric acid (HCl) solution by titrating it against a
standard sodium carbonate (Na2CO3) solution.

Apparatus:
• Burette
• Pipette (10 mL)
• Conical flask
• Beaker
• Funnel
• Stand with clamp
• White tile (optional)

Chemicals:
• Sodium carbonate (Na2CO3) solution
• Hydrochloric acid (HCl) solution
• Methyl orange indicator
• Distilled water

Procedure:
1. Weigh a known mass of anhydrous sodium carbonate (Na2CO3) and dissolve it in distilled water.
2. Transfer the solution to a volumetric flask and make up the volume to a known mark.
3. Rinse the burette with distilled water and then with hydrochloric acid.
4. Fill the burette with hydrochloric acid and record the initial reading.
5. Use a pipette to transfer 10 mL of sodium carbonate solution into a conical flask.
6. Add 2-3 drops of methyl orange indicator (solution turns yellow).
7. Slowly add hydrochloric acid from the burette while swirling.
8. Near the endpoint, add acid dropwise until the color changes from yellow to orange-pink.
9. Record the final burette reading.
10. Perform at least three titrations and take the average volume of hydrochloric acid used.

Result:
The concentration of the given hydrochloric acid solution is determined using the titration data.

Balanced Chemical Equation:
Na2CO3 + 2HCl → 2NaCl + CO2 + H2O
"""

# Function to compare input with the blueprint
def compare_procedure(form_data):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    
    headers = {"Content-Type": "application/json"}

    payload = {
        "contents": [{
            "parts": [{
                "text": f"""
Compare the following procedure with the original blueprint and rate its accuracy out of 10. Follow these strict deduction rules:

- **Chemical Equation**: Deduct **only 3 mark** if the equation does not match exactly.
- **Apparatus**: Deduct **only 3 mark** if at least 2 apparatus are missing. Do not deduct more than 1 mark for apparatus.
- **Aim**: Deduct **only 2 mark** if the aim does not match exactly.
- **Procedure Accuracy**: If the steps are mostly correct, do not deduct any marks, else reduce 2 marks.

**Original Blueprint:**
{blueprint}

**Submitted Experiment Form:**
Aim: {form_data["aim"]}
Apparatus: {form_data["apparatus"]}
Procedure: {form_data["procedure"]}
Observations: {form_data["observations"]}
Conclusion: {form_data["conclusion"]}

Provide a **final numerical score out of 10**, along with a breakdown of the deductions.
"""
            }]
        }]
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        result = response.json()
        return result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Error: No response")
    else:
        return f"Error: {response.status_code}, {response.text}"

@app.route("/compare", methods=["POST"])
def compare():
    data = request.json  # Receive form data from frontend
    score = compare_procedure(data)
    return jsonify({"score": score})

# Difficulty levels mapping
difficulty_levels = ["Basic", "Intermediate", "Advanced"]
current_level = 1  # Start at "Intermediate"
question_data = []  # Store last generated questions

def generate_question(level="Intermediate", topic="Ohm's Law"):
    """Generate an MCQ using AI based on difficulty level."""
    if not API_KEY:
        return {"error": "API Key is missing. Check .env.local file."}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}

    prompt = f"""
    You are a physics tutor. Generate a **multiple-choice question (MCQ)** on **{topic}**. **Difficulty Level:** {level}

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
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "An unexpected error occurred."}

def generate_questions(num_questions=2, level="Intermediate", topic="Ohm's Law"):
    """Generate a list of MCQs."""
    questions = []
    for _ in range(num_questions):
        question = generate_question(level=level, topic=topic)
        if "error" in question:
            return {"error": question["error"]}
        questions.append(question)
    return questions

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
    """Return two MCQ questions based on current difficulty."""
    global question_data
    questions = generate_questions(num_questions=2, level=difficulty_levels[current_level]) # Generate two questions
    if "error" in questions:
        return jsonify(questions)  # Return error if any

    question_data = questions  # Store the generated questions
    return jsonify(questions)

@app.route("/check-answer", methods=["POST"])
def check_answer():
    """Validate user's answers, adjust difficulty, and provide explanations."""
    global current_level, question_data
    data = request.json
    selected_answers = data.get("selected_answers")  # Expecting a list of answers

    if not question_data:
        return jsonify({"error": "No questions generated yet!"}), 400

    if not isinstance(selected_answers, list) or len(selected_answers) != len(question_data):
        return jsonify({"error": "Incorrect number of answers provided."}), 400

    correct_answers = [q["answer"] for q in question_data]
    is_correct = [selected_answers[i] == correct_answers[i] for i in range(len(question_data))]

    # Adjust difficulty based on performance
    if all(is_correct):
        message = "✅ Correct! Next questions will be harder."
        current_level = min(current_level + 1, 2)
    elif not any(is_correct):
        message = "❌ Incorrect! Next questions will be easier."
        current_level = max(current_level - 1, 0)
    else:
        message = "🤷‍♀️ Mixed results! Difficulty remains the same."
    
    explanations = [
        generate_explanation(
            question_data[i]["question"], question_data[i][correct_answers[i]], question_data[i]
        ) for i in range(len(question_data))
    ]

    results = []
    for i in range(len(question_data)):
        results.append({
            "question": question_data[i]["question"],
            "correct_answer": correct_answers[i],
            "is_correct": is_correct[i],
            "explanation": explanations[i],
        })

    return jsonify({
        "message": message,
        "new_level": difficulty_levels[current_level],
        "results": results,
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

def get_gemini_response(user_input):
    """Send user input to Gemini API and return the response."""
    if not API_KEY:
        return {"error": "Missing Gemini API Key. Check .env file."}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
