# Use an official Node.js runtime as the base image
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY ./package.json ./package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the application source code to the container
COPY . .

# Install PM2 globally
RUN npm install -g pm2

# Copy the .env file to the container
COPY .env .env

# Verify the .env file contents (for debugging or development purposes)
RUN cat .env

# Build the application (e.g., for TypeScript or asset building)
RUN npm run build

# Expose necessary ports
EXPOSE 3012
EXPOSE 1080
EXPOSE 1025
EXPOSE 4215

# Start the app with PM2
CMD ["pm2-runtime", "dist/app.js", "--name", "meterly", "--no-strict"]
