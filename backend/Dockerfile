FROM php:8.3-cli

RUN apt-get update && apt-get install -y git unzip libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring zip gd bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 8080
CMD ["sh", "-c", "php artisan storage:link || true; php artisan migrate --force; php artisan config:cache; php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
