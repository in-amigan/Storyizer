FROM rockylinux/rockylinux

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN yum update -y \
   && yum install -y wget unzip

ENV NVM_DIR=/usr/local/nvm NODE_VERSION=6.10.3

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin/:$PATH

# Install app
COPY ./code/ /opt/
WORKDIR /opt/API

EXPOSE 81

CMD ["node", "/opt/API/app.js"]
