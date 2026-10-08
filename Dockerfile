FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN VITE_BASE_PATH=/ VITE_STATIC_DEMO=false VITE_API_BASE_URL= npm run build

ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

USER node

CMD ["npm", "run", "start"]
