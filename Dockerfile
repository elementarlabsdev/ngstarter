# --- Base Stage ---
FROM node:20-bullseye AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Build App ---
FROM base AS build-app
RUN npm run build:prod

# --- Build Docs ---
FROM base AS build-docs
RUN npm run build:docs:prod -- --no-prerender

# --- Build Admin ---
FROM base AS build-admin
RUN npm run build:admin:prod

# --- Final Stage ---
FROM node:20-bullseye-slim
WORKDIR /app

# Only copy what you actually need
COPY --from=build-app /app/dist/ngstarter ./dist/ngstarter
COPY --from=build-docs /app/dist/docs ./dist/docs
COPY --from=build-admin /app/dist/admin ./dist/admin

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 4000 4001 4002
CMD ["./entrypoint.sh"]
