FROM node:20-alpine

WORKDIR /server

RUN npm install pnpm@10.11.1 -g

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

COPY . .

# Anonymous volumes for node_modules to survive bind mounts (pnpm monorepo quirk)
VOLUME ["/server/node_modules", "/server/apps/backend/node_modules", "/server/apps/storefront/node_modules"]

EXPOSE 9000 5173 8000

# Default entrypoint is overridden per-service in docker-compose.yml
ENTRYPOINT ["./start.sh"]
