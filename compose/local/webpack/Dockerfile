FROM node:9.8-alpine

COPY ./compose/local/webpack/start.sh /start-webpack.sh
RUN sed -i 's/\r//' /start-webpack.sh
RUN chmod +x /start-webpack.sh

WORKDIR /app

ENTRYPOINT ["/start-webpack.sh"]
