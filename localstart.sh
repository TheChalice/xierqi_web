#!/bin/sh



export ROUTER_DOMAIN_SUFFIX='.new.dataos.io'
export REGISTRY_PUBLIC_ADDR='registry.new.dataos.io'
export REGISTRY_PRIVATE_ADDR='docker-registry.new.dataos.io'
export INTERNAL_REGISTRY_ADDR='docker-registry.default.svc:5000'




sed -i 's/<ROUTER_DOMAIN_SUFFIX>/'$ROUTER_DOMAIN_SUFFIX'/g'  ./app/app.js
sed -i 's/<REGISTRY_PUBLIC_ADDR>/'$REGISTRY_PUBLIC_ADDR'/g'  ./app/app.js
sed -i 's/<REGISTRY_PRIVATE_ADDR>/'$REGISTRY_PRIVATE_ADDR'/g'  ./app/app.js
sed -i 's/<INTERNAL_REGISTRY_ADDR>/'$INTERNAL_REGISTRY_ADDR'/g'  ./app/app.js

nginx -s stop

sleep 1

nginx -g 'daemon off;'
