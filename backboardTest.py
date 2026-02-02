from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
# This allows your React app (usually on port 3000 or 5173) to talk to Python
CORS(app)

API_KEY = "espr_0JlUd7dxtN_6wb_WRFQYnm_H1SueOV7nDNykxIXLH_o"
BASE_URL = "https://app.backboard.io/api"
HEADERS = {"X-API-Key": API_KEY}

@app.route('/generate-gifts', methods=['POST'])
def generate_gifts():
    # 1. Get the full data object from React
    data = request.json
    
    # Extract fields for easy printing/prompting
    relation = data.get('relation')
    age = data.get('age')
    gender = data.get('gender')
    hobbies = data.get('hobbies')
    personality = data.get('personality')
    min_b = data.get('minBudget')
    max_b = data.get('maxBudget')
    occasion = data.get('occasion')

    # 2. Print everything to terminal (The "Logging" part)
    print("\n--- NEW GIFT REQUEST RECEIVED ---")
    print(f"Recipient: {gender}, {age} years old ({relation})")
    print(f"Occasion: {occasion}")
    print(f"Interests: {hobbies}")
    print(f"Traits: {personality}")
    print(f"Budget: ${min_b} - ${max_b}")
    print("----------------------------------\n")

    # 3. Create the AI Prompt
    ai_prompt = (
        f"Suggest 3 creative gift ideas for my {relation}. "
        f"They are a {age} year old {gender} who likes {hobbies}. "
        f"Their personality is {personality}. The occasion is {occasion} "
        f"and my budget is between ${min_b} and ${max_b}."
    )

    try:
        # Create assistant
        ast_resp = requests.post(
            f"{BASE_URL}/assistants",
            json={"name": "Gift Guru", "system_prompt": "You are an expert gift personal shopper. Give concise, exciting suggestions."},
            headers=HEADERS,
        )
        assistant_id = ast_resp.json()["assistant_id"]

        # Create thread
        thread_resp = requests.post(
            f"{BASE_URL}/assistants/{assistant_id}/threads",
            json={},
            headers=HEADERS,
        )
        thread_id = thread_resp.json()["thread_id"]

        # Send formatted prompt
        msg_resp = requests.post(
            f"{BASE_URL}/threads/{thread_id}/messages",
            headers=HEADERS,
            data={"content": ai_prompt, "stream": "false", "memory": "Auto"},
        )
        
        ai_content = msg_resp.json().get("content")
        print(f"AI RECOMMENDED: {ai_content}")

        # Return the result to React
        return jsonify({"result": ai_content})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to generate gifts"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)