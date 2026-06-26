# --- Base Stage ---
FROM node:24-bullseye AS build
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build:prod
RUN npm run build:docs:prod
RUN npm run build:admin-corporate:prod
RUN npm run build:admin-modern:prod
RUN npm run build:admin-classic:prod

# --- Final Stage ---
FROM node:24-bullseye-slim
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
EXPOSE 4000 4001 4003 4004 4005
CMD ["./entrypoint.sh"]
