from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------
# SEGURANÇA
# -----------------------
DEBUG = False

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")

ALLOWED_HOSTS = ["conciergepro-manager.onrender.com"]


# -----------------------
# APLICATIVOS
# -----------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # terceiros
    'rest_framework',
    'cloudinary',
    'cloudinary_storage',

    # seus apps
    'core',
]


# -----------------------
# MIDDLEWARE
# -----------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# -----------------------
# URLS / WSGI
# -----------------------
ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'


# -----------------------
# TEMPLATES
# -----------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
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


# -----------------------
# BANCO (Aiven / Render)
# -----------------------
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv("DATABASE_URL", "sqlite:///db.sqlite3"),
        conn_max_age=600,
    )
}


# -----------------------
# INTERNACIONALIZAÇÃO
# -----------------------
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True


# -----------------------
# STATIC FILES (WhiteNoise)
# -----------------------
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# -----------------------
# MEDIA (Cloudinary)
# -----------------------
MEDIA_URL = '/media/'

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUD_NAME'),
    'API_KEY':    os.getenv('API_KEY'),
    'API_SECRET': os.getenv('API_SECRET'),
}


# -----------------------
# SEGURANÇA PRODUÇÃO (Render)
# -----------------------
CSRF_TRUSTED_ORIGINS = ["https://conciergepro-manager.onrender.com"]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Permite que o iframe do Google Maps seja exibido corretamente.
# SAMEORIGIN bloquearia iframes de outros domínios na página.
X_FRAME_OPTIONS = 'SAMEORIGIN'


# -----------------------
# PADRÃO DJANGO
# -----------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LOGIN_URL = '/login/'


# -----------------------
# PERFORMANCE
# -----------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}