# ──────────────────────────────────────────────
# Stage 1: Build the React application
# ──────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# + Copy dependency files first (cache layer for faster rebuilds)
COPY package.json package-lock.json ./
RUN npm ci

# + Copy source code and build the production bundle
COPY . .
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ──────────────────────────────────────────────
FROM nginx:alpine AS runtime

# + Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# + Add custom Nginx config with API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# + Copy the built React app from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]