#!/bin/sh
sed -i 's/#DATAFOUNDRY_APISERVER_ADDR#/'$DATAFOUNDRY_APISERVER_ADDR'/g' /etc/nginx/nginx.conf
sed -i 's/54.222.143.70:8443/'$DATAFOUNDRY_APISERVER_ADDR'/g' /data/datafoundry/dist/app.js

nginx -g "daemon off;"
