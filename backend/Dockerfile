# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Instalar todas las dependencias (dev + prod)
COPY package*.json ./
RUN npm ci

# Copiar el código y hacer build
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /usr/src/app

# Solo instalar dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar el build desde la etapa anterior
COPY --from=builder /usr/src/app/dist ./dist

# Exponer puerto y comando
EXPOSE 3000
CMD ["node", "dist/main.js"]
