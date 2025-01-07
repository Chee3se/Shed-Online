RUN docker-php-ext-install pcntl
RUN docker-php-ext-configure pcntl --enable-pcntl
CMD php artisan reverb:install && php artisan reverb:start
web: heroku-php-apache2 public/
