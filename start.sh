#!/bin/sh
sed -i 's/#DATAFOUNDRY_APISERVER_ADDR#/'$DATAFOUNDRY_APISERVER_ADDR'/g' /etc/nginx/nginx.conf
sed -i 's/54.222.158.233:8443/'$DATAFOUNDRY_APISERVER_ADDR'/g' /data/datafoundry/dist/app.js

chown -R nginx.nginx /var/lib/nginx

nginx -g "daemon off;"
