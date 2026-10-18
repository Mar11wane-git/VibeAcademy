FROM php:8.3-cli

RUN apt-get update && apt-get install -y git unzip libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring zip gd bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Hugging Face Spaces uses port 7860 (set via app_port); other hosts provide $PORT.
ENV PORT=7860
EXPOSE 7860
CMD ["sh", "-c", "php artisan storage:link || true; php artisan migrate --force; php artisan config:cache; php artisan serve --host=0.0.0.0 --port=${PORT}"]
