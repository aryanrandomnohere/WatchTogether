FROM node:20

RUN apt-get update && apt-get install -y \
  libglib2.0-dev \
  libnss3-dev \
  libgconf-2-4 \
  libxss1 \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  git \
  build-essential

WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev

COPY . .

CMD ["npm", "run", "devv"]
