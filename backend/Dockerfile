# Backend Dockerfile - Node.js Express REST API
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Create uploads directory if not present
RUN mkdir -p uploads

# Expose API port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "index.js"]
