from pathlib import Path
import os
import dj_database_url



BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURANÇA ---
DEBUG = False

SECRET_KEY = os.environ["SECRET_KEY"]

ALLOWED_HOSTS = ["https://conciergepro-manager.onrender.com"]


# --- APLICATIVOS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'rest_framework'
]

# --- MIDDLEWARE (Ordem Vital para Unificação e Produção) ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # DEVE vir logo após o SecurityMiddleware para servir CSS/JS
    'django.contrib.sessions.middleware.SessionMiddleware',
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
    'default': dj_database_url.config(default='sqlite:///db.sqlite3')
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
CSRF_TRUSTED_ORIGINS = ["https://conciergepro-manager.onrender.com"]


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUD_NAME'),
    'API_KEY': os.getenv('API_KEY'),
    'API_SECRET': os.getenv('API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'