from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURANÇA ---
DEBUG = True  # Mude para False apenas no deploy final
SECRET_KEY = 'django-insecure-i_(whnni7ilw$((&x9od+3a#bv47sx5ssfuhj%*s#n*7a4&b7-'
ALLOWED_HOSTS = ['*']

# --- APLICATIVOS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'rest_framework',
    'corsheaders', # Pode manter para testes, mas não será mais vital após unificar
]

# --- MIDDLEWARE (Ordem Vital para Unificação e Produção) ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # DEVE vir logo após o SecurityMiddleware para servir CSS/JS
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --- CONFIGURAÇÕES DE ESTÁTICOS E MÍDIA (Ajustado para raiz do Backend) ---
# Onde o Django busca arquivos durante o desenvolvimento
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'), 
]

# Onde o Django guardará os arquivos para o Render servir em produção
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Configuração de Armazenamento do WhiteNoise (Comprime arquivos para carregar rápido)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# --- TEMPLATES (Ajustado para raiz do Backend) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')], # Procura index.html na raiz
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --- BANCO DE DADOS ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# --- OUTRAS CONFIGURAÇÕES ---
ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LOGIN_URL = '/login/'

# Como agora é um deploy único, você pode simplificar o CORS
CORS_ALLOW_ALL_ORIGINS = True 
CSRF_TRUSTED_ORIGINS = ["http://localhost:8000", "http://127.0.0.1:8000"]