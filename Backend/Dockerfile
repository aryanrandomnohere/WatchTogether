FROM  node:20     
WORKDIR /app/backend
COPY package.json /app/backend/
RUN npm install
RUN npm rebuild bcrypt --build-from-source
COPY . /app/backend/
RUN npx prisma generate 
RUN npm run dist
EXPOSE 3000
CMD ["node", "dist/index.js"]

 