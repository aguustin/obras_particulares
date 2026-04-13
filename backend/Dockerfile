FROM node:20-alpine

RUN apk add --no-cache ghostscript

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]
