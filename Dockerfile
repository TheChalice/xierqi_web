# This is a local-build docker image for p2p-dl test
FROM alpine
RUN apk add --update nginx nodejs && rm -rf /var/cache/apk/*
COPY dist /usr/share/nginx/html
EXPOSE  80
CMD ["nginx", "-g", "daemon off;"]
