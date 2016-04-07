#!/bin/sh
sed -i 's/#DATAFOUNDRY_APISERVER_ADDR#/'$DATAFOUNDRY_APISERVER_ADDR'/g' /etc/nginx/nginx.conf

nginx -g "daemon off;"
