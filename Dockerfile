FROM node:20 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

FROM node:20 AS production
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=base /app/package*.json ./
RUN npm install --legacy-peer-deps
COPY --from=base /app/prisma ./prisma
RUN npx prisma generate
COPY --from=base /app/dist ./dist
COPY env.example ./
CMD ["node", "dist/server.js"]

