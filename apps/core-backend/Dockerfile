FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm 

COPY  package*.json ./ 

RUN pnpm install --only = production

COPY . .

# RUN pnpm run build 

#CMD ["node", "dist/main"]
CMD ["pnpm", "dev"]