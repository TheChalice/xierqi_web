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
    echo search home > /etc/resolv.conf && \
    echo nameserver 223.5.5.5 >> /etc/resolv.conf && \
    echo nameserver 223.6.6.6 >> /etc/resolv.conf && \
    npm install && \
    bower install && \
    ./release.sh && \
    apk del nodejs git --purge && \
    rm -rf bower_components node_modules 


EXPOSE 80 

ENTRYPOINT ["nginx", "-g", "daemon off;"]

