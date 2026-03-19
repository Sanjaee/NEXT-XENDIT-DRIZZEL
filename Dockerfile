FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build Next.js app
RUN npm run build

# Expose app port
EXPOSE 3000

# By default just start the Next.js server.
# Migrations will be executed from docker-compose command.
CMD ["npm", "run", "start"]

