FROM node:18-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir --break-system-packages \
    torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip3 install --no-cache-dir --break-system-packages \
    facenet-pytorch requests

WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .

EXPOSE 8080
CMD ["npm", "start"]