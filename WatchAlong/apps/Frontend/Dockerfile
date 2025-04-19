FROM node:20
WORKDIR /app/frontend
COPY package.json package-lock.json ./ 
RUN npm install
COPY . ./
EXPOSE 80
 CMD [ "npm","run","dev","--", "--host" ]