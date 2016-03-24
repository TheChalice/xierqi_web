# This is a local-build docker image for p2p-dl test

FROM alpine

ADD ./app /
ADD ./www /bin/
WORKDIR /app

ENTRYPOINT ["/bin/www"]

