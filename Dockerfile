FROM node:latest

EXPOSE 4080

WORKDIR /home/node/app

ADD . .

RUN chown -R node .

USER node

RUN npm i

CMD ["node", "."]