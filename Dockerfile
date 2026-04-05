# CineOrbit — CRA production build + nginx
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG REACT_APP_TMDB_KEY
ARG REACT_APP_TMDB_REDIRECT_URL
ARG ESLINT_NO_DEV_ERRORS=true

ENV REACT_APP_TMDB_KEY=$REACT_APP_TMDB_KEY
ENV REACT_APP_TMDB_REDIRECT_URL=$REACT_APP_TMDB_REDIRECT_URL
ENV ESLINT_NO_DEV_ERRORS=$ESLINT_NO_DEV_ERRORS

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
