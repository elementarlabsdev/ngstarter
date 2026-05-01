#!/bin/bash

set -e

if [ $# -ne 1 ]; then
  echo "Usage: $0 <tag>"
  exit 1
fi

TAG=$1
USERNAME="elementarlabs"

# Service name for Docker Hub
HUB_NAME="ngstarter"

echo "======================================"
# Check if builder exists and create if not
if ! docker buildx inspect container-builder > /dev/null 2>&1; then
  docker buildx create --name container-builder --driver docker-container --use
else
  docker buildx use container-builder
fi

echo "Step 1: Building and pushing image..."
echo "======================================"

echo "Starting build and push for $HUB_NAME..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --cache-from type=gha \
  --cache-to type=gha,mode=max \
  -f Dockerfile \
  -t $USERNAME/$HUB_NAME:$TAG \
  -t $USERNAME/$HUB_NAME:latest \
  --push .

# Success message
echo "======================================"
echo "All images built and pushed successfully!"
