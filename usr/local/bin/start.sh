#!/bin/sh

# REGISTRY_PRIVATE_ADDR public route to internal registry.
# REGISTRY_PUBLIC_ADDR public habor route url.
# INTERNAL_REGISTRY_ADDR internal registry, like docker-registry.default.svc:5000

sed -i 's/<ROUTER_DOMAIN_SUFFIX>/'$ROUTER_DOMAIN_SUFFIX'/g'  /datafoundry/dist/app.js

sed -i 's~<OPERATION_CONTROL_URL>~'$OPERATION_CONTROL_URL'~g'  /datafoundry/dist/app.js
sed -i 's~<DATA_ASSETS_URL>~'$DATA_ASSETS_URL'~g'  /datafoundry/dist/app.js
sed -i 's~<OPERATION_CENTER_URL>~'$OPERATION_CENTER_URL'~g'  /datafoundry/dist/app.js
sed -i 's~<APPLICATION_MANAGEMENT_URL>~'$APPLICATION_MANAGEMENT_URL'~g'  /datafoundry/dist/app.js
sed -i 's~<USER_CENTER_URL>~'$USER_CENTER_URL'~g'  /datafoundry/dist/app.js
sed -i 's~<SMALL_BELL_URL>~'$SMALL_BELL_URL'~g'  /datafoundry/dist/app.js

sed -i 's/<REGISTRY_PUBLIC_ADDR>/'$REGISTRY_PUBLIC_ADDR'/g'  /datafoundry/dist/app.js
sed -i 's/<REGISTRY_PRIVATE_ADDR>/'$REGISTRY_PRIVATE_ADDR'/g'  /datafoundry/dist/app.js
sed -i 's/<INTERNAL_REGISTRY_ADDR>/'$INTERNAL_REGISTRY_ADDR'/g'  /datafoundry/dist/app.js


sed -i 's/<HAWKULAR-HA-ADDR>/'$HAWKULAR-HA-ADDR'/g'  /datafoundry/dist/app.js
sed -i 's/<HAWKULAR-HU-ADDR>/'$HAWKULAR-HU-ADDR'/g'  /datafoundry/dist/app.js

sed -i 's/<API_SERVER_ADDR>/'$API_SERVER_ADDR'/g'  /datafoundry/dist/app.js
sed -i 's/<API_SBNANJI_ADDR>/'$API_SBNANJI_ADDR'/g'  /datafoundry/dist/app.js

#prefix includes scheme. / should be instead.

sed -i 's~<WEBHOOK_PREFIX>~'$WEBHOOK_PREFIX'~g'  /datafoundry/dist/app.js
sed -i 's~<SSO_SWITCH>~'$SSO_SWITCH'~g'  /datafoundry/dist/app.js


sed -i 's/<redis_host>/'$REDIS_HOST'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<redis_port>/'$REDIS_PORT'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<redis_password>/'$REDIS_PASSWORD'/g' /usr/local/openresty/nginx/conf/nginx.conf

sed -i 's/<redis_hu_host>/'$REDIS_HU_HOST'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<redis_hu_port>/'$REDIS_HU_PORT'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<redis_hu_password>/'$REDIS_HU_PASSWORD'/g' /usr/local/openresty/nginx/conf/nginx.conf

sed -i 's/<api_restapi_addr>/'$API_RESTAPI_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<api_aipaas_addr>/'$API_AIPAAS_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf


sed -i 's/<api_server_addr>/'$API_SERVER_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<api_sbnanji_addr>/'$API_SBNANJI_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf

sed -i 's/<api_proxy_addr>/'$API_PROXY_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<api_uploadimage_addr>/'$API_UPLOADIMAGE_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
# sed -i 's/<api_oauth_addr>/'$API_OAUTH_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<api_metrics_addr>/'$API_METRICS_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<apis_prd_addr>/'$APIS_PRD_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<api_gitter_addr>/'$API_GITTER_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<api_volume_addr>/'$API_VOLUME_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
# sed -i 's/<api_registry_addr>/'$API_REGISTRY_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf
# sed -i 's/<public_registry_endpoint>/'$PUBLIC_REGISTRY_ENDPOINT'/g' /usr/local/openresty/nginx/conf/nginx.conf
sed -i 's/<public_registry_endpoint>/'$REGISTRY_PUBLIC_ADDR'/g' /usr/local/openresty/nginx/conf/nginx.conf

chown -R nobody:nobody /datafoundry

/usr/local/openresty/bin/openresty -g "daemon off;"
