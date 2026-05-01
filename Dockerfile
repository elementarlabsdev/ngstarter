# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build all applications
RUN npm run build:prod
RUN npm run build:docs:prod
RUN npm run build:admin:prod

# Stage 2: Serve
FROM caddy:2-alpine

# Copy build results to the appropriate directories for Caddy
COPY --from=build /app/dist/ngstarter/browser /srv/main
COPY --from=build /app/dist/docs/browser /srv/docs
COPY --from=build /app/dist/admin/browser /srv/admin

COPY Caddyfile /etc/caddy/Caddyfile
