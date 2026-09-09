FROM node:18-alpine

# Install yt-dlp, python3, ffmpeg, and curl
RUN apk add --no-cache python3 py3-pip ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy backend package files
COPY apps/backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY apps/backend/ ./

EXPOSE 4000

ENV PORT=4000

CMD ["node", "src/index.js"]
