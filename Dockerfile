# Stage 1: Build
FROM node:20-bullseye AS build

WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"

COPY package*.json ./
RUN npm install

COPY . .

# Build all applications
RUN npm run build:prod
RUN npm run build:docs:prod
RUN npm run build:admin:prod

# Final stage
FROM node:20-bullseye

WORKDIR /app

# Copy built artifacts
COPY --from=build /app/dist /app/dist

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose ports
EXPOSE 4000 4001 4002

CMD ["./entrypoint.sh"]
