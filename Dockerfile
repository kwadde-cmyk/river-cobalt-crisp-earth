FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NITRO_PRESET=node-server
RUN npm run build:host

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
RUN useradd --system --home /app --shell /usr/sbin/nologin scriptwerk
COPY --from=build /app/package.json ./
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/.output ./.output
COPY --from=build /app/public ./public
USER scriptwerk
EXPOSE 8080
CMD ["node", "scripts/host.mjs"]
