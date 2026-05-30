import asyncio, os, base64
from pathlib import Path
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage


async def main():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(api_key=api_key, session_id="nano-test-1",
                   system_message="You are a world-class brand art director.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"])
    msg = UserMessage(text=(
        "Ultra-premium editorial brand poster, 1:1 square aspect ratio. "
        "Deep navy #0B1B2B background with gold #B8864C and cream highlights. "
        "Dramatic cinematic rim lighting, fine film grain, abstract geometric "
        "gold light streaks, luxury magazine aesthetic, bold negative space. "
        "No text, no logos, no human faces. Shock-and-awe, high detail."
    ))
    text, images = await chat.send_message_multimodal_response(msg)
    print("TEXT:", (text or "")[:80])
    if images:
        print("IMAGES:", len(images), images[0].get("mime_type"))
        b = base64.b64decode(images[0]["data"])
        Path("/tmp/nano_test.png").write_bytes(b)
        print("OK bytes=", len(b))
    else:
        print("NO IMAGES")


asyncio.run(main())
