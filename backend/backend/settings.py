from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------
# AMBIENTE
# -----------------------
# Railway define RAILWAY_ENVIRONMENT automaticamente
IS_PROD = os.getenv("RAILWAY_ENVIRONMENT") is not None

# -----------------------
# SEGURANÇA
# -----------------------
DEBUG      = not IS_PROD
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-inseguro-trocar-em-producao")

ALLOWED_HOSTS = ["*"]

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
    'rest_framework',
    'cloudinary',
    'cloudinary_storage',
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

ROOT_URLCONF      = 'backend.urls'
WSGI_APPLICATION  = 'backend.wsgi.application'

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
# BANCO
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
TIME_ZONE     = 'America/Sao_Paulo'
USE_I18N      = True
USE_TZ        = True

# -----------------------
# STATIC (WhiteNoise)
# -----------------------
STATIC_URL       = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT      = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# -----------------------
# MEDIA — Cloudinary
# -----------------------
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
MEDIA_URL  = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# -----------------------
# CSRF & SESSÃO
# Railway usa proxy HTTPS — precisa dessas configs para login funcionar
# -----------------------
CSRF_TRUSTED_ORIGINS = [
    "https://conciergerio.up.railway.app",
    "https://*.up.railway.app",
]

# Proxy reverso do Railway: informa ao Django que a requisição é HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Cookies seguros APENAS em produção
# Em dev local (IS_PROD=False) fica False para não bloquear HTTP
CSRF_COOKIE_SECURE    = IS_PROD
SESSION_COOKIE_SECURE = IS_PROD

# SameSite Lax — compatível com redirect de login
CSRF_COOKIE_SAMESITE    = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

# -----------------------
# MISC
# -----------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LOGIN_URL          = '/login/'
