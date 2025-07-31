# backend/services/llm_service.py

import os
from openai import OpenAI
from dotenv import load_dotenv

# Load .env so OPENAI_API_KEY is available
load_dotenv()

# Instantiate a client (picks up OPENAI_API_KEY or you can pass api_key=...)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def _load_system_prompt() -> str:
    return (
        "You are Finora, a helpful and knowledgeable financial advisor. "
        "Respond concisely, clearly, and professionally to user queries "
        "about investments, ETFs, allocation, and risk management."
    )

def chat_with_model(user_message: str) -> str:
    """
    Send a user message to the LLM via the new v1.x interface and return its reply.
    """
    system_prompt = _load_system_prompt()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_message}
    ]

    # Use the new chat completion call
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )

    # Extract and return the assistant’s reply text
    return response.choices[0].message.content.strip()