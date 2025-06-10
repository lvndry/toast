import os
from typing import Literal


class Model:
    model: str
    api_key: str

    def __init__(self, model: str, api_key: str):
        self.model = model
        self.api_key = api_key


SupportedModel = Literal["mistral-small", "gemini-1.5-flash-8b", "gemini-2.0-flash"]


def get_model(model_name: SupportedModel) -> Model:
    if "mistral" in model_name:
        MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
        if not MISTRAL_API_KEY:
            raise ValueError("MISTRAL_API_KEY is not set")

        model_mapping = {
            "mistral-small": "mistral/mistral-small-latest",
        }

        full_model = model_mapping.get(model_name, f"mistral/{model_name}")
        return Model(
            model=full_model,
            api_key=MISTRAL_API_KEY,
        )
    elif "gemini" in model_name:
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set")

        model_mapping = {
            "gemini-1.5-flash-8b": "gemini/gemini-1.5-flash-8b",
            "gemini-2.0-flash": "gemini/gemini-2.0-flash",
        }

        full_model = model_mapping.get(model_name, f"gemini/{model_name}")
        return Model(
            model=full_model,
            api_key=GEMINI_API_KEY,
        )
    else:
        raise ValueError(f"Unsupported model: {model_name}")
