FROM alpine

# Install nginx & node
RUN apk add --update nginx nodejs git && \
    rm -rf /var/cache/apk/*

# Install Bower
# Set bower root allow
RUN npm install -g bower && \
    echo '{ "allow_root": true }' > /root/.bowerrc && \
    git config --global url."https://".insteadOf git://

# Copy code
COPY . /data/datafoundry/

# Install node & bower depends
WORKDIR /data/datafoundry

RUN cp nginx.conf /etc/nginx/nginx.conf && \
    npm install && \
    bower install && \
    ./release.sh && \
    apk del nginx nodejs git --purge && \
    rm -rf bower_components node_modules && \
    mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2

EXPOSE  80 9090
RUN ./oauthServer &

ENTRYPOINT ["nginx", "-g", "daemon off;"]

