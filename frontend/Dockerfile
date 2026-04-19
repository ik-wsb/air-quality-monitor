# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Kopiujemy pliki z zależnościami i instalujemy je
COPY package.json package-lock.json ./
RUN npm install

# Kopiujemy resztę kodu
COPY . .

# Uruchamiamy serwer developerski Vite (flaga --host wystawia go na zewnątrz kontenera)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]