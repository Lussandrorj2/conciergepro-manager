FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .
WORKDIR /app/backend
# collectstatic roda no build (não precisa de banco)
RUN python manage.py collectstatic --noinput --clear
EXPOSE 8000
# migrate roda no start (precisa do banco já disponível)
CMD ["sh", "-c", "python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120"]