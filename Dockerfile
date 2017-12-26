FROM registry.new.dataos.io/datafoundry/web-base

# Copy code
COPY . /datafoundry

WORKDIR /datafoundry

RUN bower install && npm install

# Install nginx & node
# Install Bower
# Install node & bower depends
# Set bower root allow

RUN cp usr / -rf && rm usr -rf &&  \
    ./release.sh && \
    npm uninstall bower -g && \
    apk del git nodejs --purge && \
    rm /root/.cache /root/.npm -rf && \
    rm bower_components node_modules app conf -rf

EXPOSE 80 

ENTRYPOINT ["/usr/local/bin/start.sh"]

