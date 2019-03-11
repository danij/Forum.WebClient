#!/bin/bash
HOSTNAME="$1"

mkdir /forum/config/Forum.WebClient
mkdir /forum/config/Forum.WebClient/doc
mkdir /forum/config/https

cp -r /var/www-old/* /var/www
cp /var/www/html/config/config.js /forum/config/Forum.WebClient/config.js

sed -i 's#"google"#//"google"#' /forum/config/Forum.WebClient/config.js
sed -i "s#http://dani.forum:8080#https://$HOSTNAME#" /forum/config/Forum.WebClient/config.js

rm /var/www/html/config/config.js
ln -s /forum/config/Forum.WebClient/config.js /var/www/html/config/config.js

cp -a /var/www/html/doc/. /forum/config/Forum.WebClient/doc
rm -r /var/www/html/doc
ln -s /forum/config/Forum.WebClient/doc /var/www/html/doc
