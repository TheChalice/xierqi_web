# Pull base image.
FROM library/node

# Install Bower & Grunt
RUN npm install -g bower
RUN echo '{ "allow_root": true }' > /root/.bowerrc

COPY app /data/datafoundry/app
COPY conf /data/datafoundry/conf
COPY bower.json /data/datafoundry/bower.json
COPY package.json /data/datafoundry/package.json
COPY release.sh /data/datafoundry/release.sh

# Install node & bower depends
WORKDIR /data/datafoundry
RUN npm install
RUN bower install
RUN ./release.sh

# Define working directory.
WORKDIR /data/datafoundry/app

# Define default command.
CMD ["bash"]