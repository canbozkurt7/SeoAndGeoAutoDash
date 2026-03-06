FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_PUBLIC_SUPABASE_URL=https://build-placeholder.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=build-placeholder
ENV SUPABASE_SERVICE_ROLE_KEY=build-placeholder
ENV APP_BASE_URL=https://build-placeholder.local
ENV APP_DOMAIN=build-placeholder.local
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/public
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
