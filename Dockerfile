FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    tesseract-ocr \
    tesseract-ocr-por \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput --clear
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && python manage.py shell -c \"from django.contrib.auth.models import User; User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists() or User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')\" && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120"]
