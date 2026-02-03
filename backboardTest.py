from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json # Added for parsing AI string into a List

import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("API_KEY")
BASE_URL = "https://app.backboard.io/api"
HEADERS = {"X-API-Key": API_KEY}

@app.route('/generate-gifts', methods=['POST'])
def generate_gifts():
    data = request.json
    
    # Extract fields
    relation = data.get('relation')
    age = data.get('age')
    gender = data.get('gender')
    hobbies = data.get('hobbies')
    personality = data.get('personality')
    min_b = data.get('minBudget')
    max_b = data.get('maxBudget')
    occasion = data.get('occasion')

    # 1. Strict JSON Prompt
    # We tell the AI exactly what keys to use so the frontend doesn't crash
    ai_prompt = (
        f"Suggest 5 gift ideas for my {relation} ({age}yo {gender}) who likes {hobbies}. "
        f"Personality: {personality}. Occasion: {occasion}. Budget: ${min_b}-${max_b}. "
        "RETURN ONLY A JSON ARRAY. Do not include conversational text. "
        "Format: "
        '[{"id": 1, "title": "Name", "description": "Pitch", "category": "Home"}]'
        "Categories must be: Arts, Entertainment, Technology, Food & Drink, Home, or Self-care."
    )

    try:
        # Create assistant
        ast_resp = requests.post(
            f"{BASE_URL}/assistants",
            json={"name": "Gift Guru", "system_prompt": "You are a JSON generator. You only output valid JSON arrays."},
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
        
        ai_raw_content = msg_resp.json().get("content", "[]")

        # 2. JSON Cleaning & Parsing
        # AI often wraps JSON in code blocks (```json ... ```). We must strip those.
        clean_content = ai_raw_content.replace("```json", "").replace("```", "").strip()
        
        try:
            gift_list = json.loads(clean_content)
            # Ensure the result is actually a list for the frontend's .map()
            if not isinstance(gift_list, list):
                gift_list = [gift_list]
        except Exception as parse_error:
            print(f"Parsing failed: {parse_error}")
            # Fallback if AI produces bad JSON
            gift_list = [{
                "id": 1, 
                "title": "AI Suggestion", 
                "description": ai_raw_content[:150], 
                "category": "Home"
            }]

        return jsonify({"result": gift_list})

    except Exception as e:
        print(f"General Error: {e}")
        return jsonify({"error": "Failed to generate gifts"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)