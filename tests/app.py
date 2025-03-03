from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

# Your API Key
API_KEY = "AIzaSyAE1SECKjNzkW3xXTZKcQooFv5G2nFhjuU"

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
