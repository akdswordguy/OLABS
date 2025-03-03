import requests
import os

# Secure API key (Set this in your environment variables)
API_KEY = os.getenv("GEMINI_API_KEY")

# Define difficulty levels
difficulty_levels = ["Basic", "Intermediate", "Advanced"]

# Track current difficulty level
current_level = 0  # Start with "Basic"

def generate_question(level):
    """Generate a multiple-choice question using Google Gemini AI based on difficulty level."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    
    headers = {"Content-Type": "application/json"}

    prompt = f"""
    You are a physics tutor creating adaptive multiple-choice questions for a Class 11 physics lab.
    The student should be tested on measuring instruments like Vernier calipers, screw gauge, and titration.

    **Difficulty Level:** {difficulty_levels[level]}
    
    Generate a **single multiple-choice question (MCQ)** about a physics lab concept.  
    Format the response as follows:
    
    **Question:** <question text>  
    **A)** <option 1>  
    **B)** <option 2>  
    **C)** <option 3>  
    **D)** <option 4>  
    **Correct Answer:** <A/B/C/D>
    """

    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an error for HTTP issues
        ai_response = response.json()

        # Extract AI-generated text
        question_text = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        if not question_text:
            return "Error: AI response was empty."

        # Extract correct answer
        correct_answer = "A"  # Default fallback
        if "**Correct Answer:**" in question_text:
            question_part, correct_answer = question_text.split("**Correct Answer:**")
            correct_answer = correct_answer.strip()

        return question_text, correct_answer

    except requests.exceptions.RequestException as e:
        return f"API Error: {e}", "A"

def evaluate_answer(user_answer, correct_answer):
    """Check if the answer is correct and adjust difficulty."""
    global current_level

    if user_answer.strip().upper() == correct_answer.strip().upper():
        print("✅ Correct!")
        if current_level < len(difficulty_levels) - 1:  # Increase difficulty if possible
            current_level += 1
    else:
        print("❌ Incorrect.")
        if current_level > 0:  # Lower difficulty if possible
            current_level -= 1

# Main loop to ask 10 questions
for i in range(10):
    print(f"\n🔹 **Question {i+1} ({difficulty_levels[current_level]})** 🔹")
    
    question_data, correct_answer = generate_question(current_level)
    print(question_data)

    user_answer = input("Your answer (A/B/C/D): ")
    evaluate_answer(user_answer, correct_answer)
