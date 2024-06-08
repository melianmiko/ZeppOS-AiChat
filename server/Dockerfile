FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache curl opus

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . /app/
ENV PYTHONPATH=/app
RUN python /app/utils/patch_opuslib_alpine.py

CMD ["gunicorn", "-b", "0.0.0.0:80",  "--worker-class", "gevent", "ai_chat_backend:app"]
