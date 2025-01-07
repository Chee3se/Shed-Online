RUN docker-php-ext-install pcntl
RUN docker-php-ext-configure pcntl --enable-pcntl
web: heroku-php-apache2 public/
websocket: php artisan reverb:start
