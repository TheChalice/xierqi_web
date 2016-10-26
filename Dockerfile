FROM registry.dataos.io/library/alpine:3.2

# Copy code
COPY . /data/datafoundry/

WORKDIR /data/datafoundry

# Install nginx & node
# Install Bower
# Install node & bower depends
# Set bower root allow
RUN sed -i s#dl-cdn.alpinelinux.org#mirrors.aliyun.com/alpine#g /etc/apk/repositories
RUN apk add --update nginx nodejs git && \
    npm install -g bower && \
    echo '{ "allow_root": true }' > /root/.bowerrc && \
    git config --global url."https://".insteadOf git:// && \
    cp nginx.conf /etc/nginx/nginx.conf && \
    npm install && \
    bower install && \
    ./release.sh && \
    npm uninstall -g bower && \
    apk del nodejs git --purge && \
    rm -rf bower_components node_modules app /var/cache/apk/* /tmp/*
RUN mkdir -p /run/nginx/

EXPOSE 80 

#ENTRYPOINT ["nginx", "-g", "daemon off;"]
CMD ["./start.sh"]
