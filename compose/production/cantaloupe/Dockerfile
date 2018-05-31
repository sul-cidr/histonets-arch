FROM mostalive/ubuntu-14.04-oracle-jdk8

# Adapted from:
# https://github.com/pulibrary/cantaloupe-docker
# https://github.com/kaij/cantaloupe
# https://github.com/MITLibraries/docker-cantaloupe
ARG CANTALOUPE_BRANCH=false
ARG CANTALOUPE_VERSION=3.4.1
ARG BASE_URI=
ARG ADMIN_ENABLED=true
ARG ADMIN_PASSWORD=docker
ARG SOURCE_STATIC=S3Source
# In old versions the setting is called resolver
ARG RESOLVER_STATIC=AmazonS3Resolver
ARG AWS_ENDPOINT=
ARG AWS_BUCKET_NAME=
ARG AWS_BUCKET_REGION=
EXPOSE 8182

# Update packages and install tools
RUN apt-get update -y && apt-get install -y wget rpl unzip graphicsmagick curl build-essential cmake

#Build OpenJPEG
RUN wget -c https://github.com/uclouvain/openjpeg/archive/v2.1.2.tar.gz -O openjpeg-2.1.2.tar.gz \
     && tar -zxvf openjpeg-2.1.2.tar.gz \
     && cd openjpeg-2.1.2 \
     && mkdir -v build \
     && cd build \
     && cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr .. \
     && make \
     && make install

# run non priviledged
RUN adduser --system cantaloupe

#
# Cantaloupe
#
WORKDIR /tmp
RUN echo "Using version '$CANTALOUPE_VERSION'"
RUN if [ "$CANTALOUPE_BRANCH" = "true" ] ; then \
  apt-get install -y maven \
  && curl -o Cantaloupe-$CANTALOUPE_VERSION.zip -L https://github.com/medusa-project/cantaloupe/archive/$CANTALOUPE_VERSION.zip \
  && mkdir -p /usr/local/ \
  && cd /usr/local \
  && unzip /tmp/Cantaloupe-$CANTALOUPE_VERSION.zip \
  && mv cantaloupe-$CANTALOUPE_VERSION Cantaloupe-$CANTALOUPE_VERSION \
  && cd /usr/local/Cantaloupe-$CANTALOUPE_VERSION \
  && mvn clean package -DskipTests \
  && cp target/cantaloupe-*.war Cantaloupe-$CANTALOUPE_VERSION.war \
 ; else \
  curl -OL https://github.com/medusa-project/cantaloupe/releases/download/v$CANTALOUPE_VERSION/Cantaloupe-$CANTALOUPE_VERSION.zip \
  && mkdir -p /usr/local/ \
  && cd /usr/local \
  && unzip /tmp/Cantaloupe-$CANTALOUPE_VERSION.zip \
 ; fi
RUN cd /usr/local \
 && ln -s Cantaloupe-$CANTALOUPE_VERSION cantaloupe \
 && rm -rf /tmp/Cantaloupe-$CANTALOUPE_VERSION \
 && rm /tmp/Cantaloupe-$CANTALOUPE_VERSION.zip

COPY ./compose/production/cantaloupe/cantaloupe.properties /etc/cantaloupe.properties
RUN rpl '$BASE_URI' "$BASE_URI" /etc/cantaloupe.properties \
 && rpl '$ADMIN_ENABLED' "$ADMIN_ENABLED" /etc/cantaloupe.properties \
 && rpl '$ADMIN_PASSWORD' "$ADMIN_PASSWORD" /etc/cantaloupe.properties \
 && rpl '$RESOLVER_STATIC' "$RESOLVER_STATIC" /etc/cantaloupe.properties \
 && rpl '$SOURCE_STATIC' "$SOURCE_STATIC" /etc/cantaloupe.properties \
 && rpl '$AWS_BUCKET_NAME' "$AWS_BUCKET_NAME" /etc/cantaloupe.properties \
 && rpl '$AWS_ENDPOINT' "$AWS_ENDPOINT" /etc/cantaloupe.properties \
 && rpl '$AWS_BUCKET_REGION' "$AWS_BUCKET_REGION" /etc/cantaloupe.properties

RUN mkdir -p /var/log/cantaloupe \
 && mkdir -p /var/cache/cantaloupe \
 && chown -R cantaloupe /var/log/cantaloupe \
 && chown -R cantaloupe /var/cache/cantaloupe \
 && chown cantaloupe /etc/cantaloupe.properties

USER cantaloupe
CMD ["sh", "-c", "java -Dcantaloupe.config=/etc/cantaloupe.properties -Xmx2g -jar $(ls /usr/local/cantaloupe/*.war)"]
