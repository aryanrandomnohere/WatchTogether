FROM node:20-alpine
WORKDIR  /app
COPY . .
RUN cd Backend
RUN npm install
RUN docker "postgres://postgres:mysecretpassword@localhost:5432/postgres"
RUN npx prisma generate
RUN cd dist 
RUN node index.js
RUN cd ..
RUN cd ..
RUN cd Frontend
RUN npm install
RUN node index.js