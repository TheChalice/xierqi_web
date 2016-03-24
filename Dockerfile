FROM kitematic/hello-world-nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /start.sh

RUN mkdir -p /datafoundry/raw/main/webapp
ADD ./webapp /datafoundry/raw/main/webapp
WORKDIR /datafoundry/raw/main/webapp

CMD ["/start.sh"]