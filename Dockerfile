# syntax=docker/dockerfile:1.7

# Etapa 1: compilar la aplicación Vue
FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# .env-prod se monta como secreto y nunca se copia a una capa de la imagen.
RUN --mount=type=secret,id=env_prod,target=/app/.env.production,required=true \
    pnpm build:prod

# Etapa 2: servir los archivos estáticos
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
