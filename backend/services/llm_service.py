# backend/services/llm_service.py

"""
Service layer for interacting with the Large Language Model (LLM).

This module acts as a dedicated interface or "wrapper" for the OpenAI API.
It encapsulates all the logic required to communicate with the language model,
including API key management, prompt formatting, and response parsing.

By isolating this functionality, the rest of the application can interact
with the AI without needing to know the specific details of the OpenAI library.
This also makes it easier to switch to a different LLM provider in the future.
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

# Load the OPENAI_API_KEY from the .env file into the environment.
load_dotenv()

# The OpenAI client is instantiated here. It will automatically look for the
# 'OPENAI_API_KEY' environment variable for authentication.
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def _load_system_prompt() -> str:
    """
    Defines the system prompt to set the AI's persona and instructions.

    This private helper function centralizes the core identity of the AI assistant,
    ensuring it behaves consistently as "Finora" in all conversations.

    Returns:
        str: The system prompt message.
    """
    return (
        "You are Finora, a helpful and knowledgeable financial advisor. "
        "Respond concisely, clearly, and professionally to user queries "
        "about investments, ETFs, allocation, and risk management."
    )

def chat_with_model(user_message: str) -> str:
    """
    Sends a user's message to the OpenAI API and returns the model's reply.

    This function takes a plain text message from the user, combines it with the
    system prompt, and sends it to the specified GPT model. It then parses the
    API response to extract and return only the content of the assistant's message.

    Args:
        user_message (str): The message typed by the user.

    Returns:
        str: The text-only reply from the language model.

    Raises:
        openai.APIError: Can raise various exceptions from the OpenAI library if the
                         API call fails (e.g., authentication error, server issue).
                         These are caught and handled in the calling route.
    """
    system_prompt = _load_system_prompt()
    
    # The messages payload is structured with 'system' and 'user' roles, which is
    # the standard format for chat-based models like GPT-4.
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_message}
    ]

    # This is the primary API call to OpenAI.
    # - model: Specifies which version of the model to use.
    # - temperature: Controls the creativity of the response (lower is more deterministic).
    # - max_tokens: Limits the length of the reply to prevent overly long or costly responses.
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )

    # The API response is a complex object; we extract the text content from the
    # first choice and strip any leading/trailing whitespace for a clean output.
    return response.choices[0].message.content.strip()