FROM node:20
WORKDIR /app/frontend

COPY package.json package-lock.json ./ 
RUN npm install

COPY . ./

EXPOSE 2000

CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]
