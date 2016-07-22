FROM alpine

# Copy code
COPY . /data/datafoundry/

WORKDIR /data/datafoundry

# Install nginx & node
# Install Bower
# Install node & bower depends
# Set bower root allow
RUN apk add --update nginx nodejs git && \
    npm install -g bower && \
    echo '{ "allow_root": true }' > /root/.bowerrc && \
    git config --global url."https://".insteadOf git:// && \
    cp nginx.conf /etc/nginx/nginx.conf && \
    npm install && \
    bower install


