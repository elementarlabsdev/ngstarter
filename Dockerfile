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

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts
COPY --from=build /app/dist /app/dist

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose ports
EXPOSE 4000 4001 4002

CMD ["./entrypoint.sh"]
