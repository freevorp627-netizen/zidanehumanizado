# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Pass build arguments (Vite needs these to be available during 'npm run build')
ARG GEMINI_API_KEY
ARG APP_URL

# Set environment variables for the build
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV APP_URL=$APP_URL

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
