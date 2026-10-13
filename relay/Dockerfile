FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir -p /data && chown node:node /data
COPY --chown=node:node agent.mjs transport.mjs journal.mjs scheduler.mjs ./
USER node
ENV NODE_ENV=production SMARTFIXX_DATA_DIR=/data
CMD ["node", "agent.mjs"]
