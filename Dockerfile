FROM node:20-slim

# Install httpx dependencies and binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ARG HTTPX_VERSION=1.7.4
RUN curl -L "https://github.com/projectdiscovery/httpx/releases/download/v${HTTPX_VERSION}/httpx_${HTTPX_VERSION}_linux_amd64.zip" -o /tmp/httpx.zip \
  && unzip /tmp/httpx.zip -d /tmp/httpx \
  && mv /tmp/httpx/httpx /usr/local/bin/httpx \
  && chmod +x /usr/local/bin/httpx \
  && rm -rf /tmp/httpx /tmp/httpx.zip

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
