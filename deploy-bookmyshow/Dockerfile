# Production Dockerfile for BookMyShow PWA
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package descriptors and install production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy application server and pre-built public PWA assets
COPY server.js ./
COPY public ./public

EXPOSE 5000

USER node

CMD ["node", "server.js"]
