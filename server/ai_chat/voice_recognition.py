import base64
import io
import wave

from opuslib import Decoder


async def zepp_opus_to_wav_base64(opus_data: bytes):
    decoder = Decoder(16000, 1)
    pos = 0
    pcm = b""
    while pos < len(opus_data):
        payload_len = int.from_bytes(opus_data[pos:pos + 4], byteorder="big")
        payload = opus_data[pos + 8:pos + 8 + payload_len]
        pcm += decoder.decode(payload, 1024)
        pos += 8 + payload_len

    # Create wav
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        w.writeframes(pcm)

    return base64.b64encode(wav_buffer.getvalue()).decode()
