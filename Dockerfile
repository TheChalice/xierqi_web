# Pull base image.
FROM library/node

# Install Bower & Grunt
RUN npm install -g bower grunt-cli
RUN echo '{ "allow_root": true }' > /root/.bowerrc

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["bash"]