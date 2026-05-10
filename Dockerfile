# --- Base Stage ---
FROM node:20-bullseye AS build
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build:prod
RUN npm run build:docs:prod
RUN npm run build:admin:prod
RUN npm run build:admin-corporate:prod

# --- Final Stage ---
FROM node:20-bullseye-slim
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
EXPOSE 4000 4001 4002 4003
CMD ["./entrypoint.sh"]
