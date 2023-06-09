FROM rockylinux/rockylinux

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN yum update -y \
  && yum install -y curl unzip \
  && yum clean all

ARG AWSREGION
ENV NVM_DIR=/usr/local/nvm NODE_VERSION=6.10.3 AWSREGION=${AWSREGION} 

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin/:$PATH

# Install app
COPY ./code/ /opt/
WORKDIR /opt/save

# Setup Config
RUN sed -i -- "s|AWSRegion|$AWSREGION|g" /opt/save/creds.json

EXPOSE 82

CMD ["node", "/opt/save/app.js"]
