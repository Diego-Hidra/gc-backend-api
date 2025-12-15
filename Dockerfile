FROM node:18-slim

# Build arg to skip heavy ML dependencies in CI (default: install them)
ARG ENABLE_EMBEDDINGS=true

RUN if [ "$ENABLE_EMBEDDINGS" = "true" ]; then \
      apt-get update && apt-get install -y \
        python3 \
        python3-pip \
        build-essential \
        && rm -rf /var/lib/apt/lists/*; \
    fi

RUN if [ "$ENABLE_EMBEDDINGS" = "true" ]; then \
      pip3 install --no-cache-dir --break-system-packages \
        torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
      pip3 install --no-cache-dir --break-system-packages \
        facenet-pytorch requests; \
    fi

WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .

EXPOSE 8080
CMD ["npm", "start"]