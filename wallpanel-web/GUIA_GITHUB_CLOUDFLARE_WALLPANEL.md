# WALL PANEL: GitHub + Ubuntu + Docker + Cloudflare Tunnel

Esta guía adapta la guía de despliegue y el video al sitio estático WALL PANEL. El video utiliza un túnel administrado por Cloudflare Zero Trust con un `TUNNEL_TOKEN` dentro de Docker Compose. Esta es la ruta recomendada para la práctica porque es más simple que administrar manualmente `credentials.json` e ingress.

## 1. Qué contiene este proyecto

`index.html`, `styles.css`, `script.js` y `assets/logo.jpeg` forman la web. `Dockerfile` construye un servidor Nginx. `docker-compose.yml` levanta dos servicios: `wallpanel-web` en el puerto local `8080` y `cloudflared-wallpanel`, que conecta el servidor con Cloudflare. `.env.example` muestra la variable necesaria sin contener el token real. El archivo `.gitignore` evita que `.env` se suba a GitHub.

## 2. Subir el ZIP a GitHub desde el navegador

Primero descomprime `wallpanel-web.zip` en tu computadora. Entra a `https://github.com` e inicia sesión. Pulsa **New repository**. Usa un nombre como `wallpanel-web`, elige **Public** si el asesor necesita revisarlo y no agregues README, `.gitignore` ni licencia porque ya vienen incluidos en el proyecto.

Dentro del repositorio vacío pulsa **uploading an existing file**. Arrastra todos los archivos y carpetas descomprimidos. Debes ver como mínimo `index.html`, `styles.css`, `script.js`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore`, `assets/logo.jpeg` y esta guía. No subas ningún archivo llamado `.env` ni ningún token. Pulsa **Commit changes**.

Comprueba que al abrir `index.html` desde tu computadora la página sigue funcionando. GitHub Pages puede servir una demostración estática, pero no reemplaza el servidor Ubuntu ni el túnel que pide esta práctica.

## 3. Clonar el proyecto en Ubuntu Server

Conéctate por SSH al servidor:

```bash
ssh ubuntu@IP_DEL_SERVIDOR
```

Instala Git si hace falta y clona el repositorio:

```bash
sudo apt update
sudo apt install -y git
cd ~
git clone https://github.com/TU_USUARIO/wallpanel-web.git
cd wallpanel-web
```

Si el repositorio es privado, GitHub te pedirá autenticación. No pegues contraseñas en comandos ni dentro de archivos del proyecto.

## 4. Instalar Docker

La guía del curso usa Ubuntu Server 24.04 LTS. Ejecuta los comandos oficiales de Docker indicados por el curso:

```bash
sudo apt update && sudo apt install -y ca-certificates curl gnupg nano openssl ufw
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run hello-world
```

Verifica:

```bash
docker --version
docker compose version
```

## 5. Preparar el archivo secreto del túnel

Desde la carpeta del proyecto:

```bash
cp .env.example .env
nano .env
```

Reemplaza únicamente el texto después de `TUNNEL_TOKEN=` por el token que Cloudflare mostrará al crear el túnel. Guarda con `Ctrl+O`, pulsa Enter y sal con `Ctrl+X`.

El token es secreto. No lo publiques en GitHub, no lo pegues en capturas y no lo compartas por chat.

## 6. Crear el túnel en Cloudflare Zero Trust

Entra a Cloudflare y abre **Zero Trust → Networks → Tunnels**. Pulsa **Create a tunnel**, asigna un nombre como `mi-servidor-docker` y elige el conector **Docker**. Cloudflare mostrará un comando con un token largo. Copia solo el token y pégalo en `.env` del servidor.

En el túnel, entra a **Routes → Add route → Published application**. Configura:

- **Hostname:** el subdominio y dominio que realmente tengas, por ejemplo `www.tudominio.com`.
- **Service type:** `HTTP`.
- **URL:** `localhost:8080`.

Si quieres que funcionen dos nombres, crea otra ruta para `tudominio.com` y usa la misma URL `localhost:8080`. No uses literalmente `tudominio.com`; reemplázalo por tu dominio real.

## 7. Levantar la web y el túnel

En Ubuntu, dentro de la carpeta del proyecto:

```bash
docker compose up -d --build
docker compose ps
```

Debes ver `wallpanel-web` y `cloudflared-wallpanel` en estado `Up`.

Prueba primero la web local:

```bash
curl -I http://127.0.0.1:8080
```

Debe devolver `HTTP/1.1 200 OK`. Después revisa los registros del túnel:

```bash
docker compose logs -f cloudflared
```

Busca mensajes que indiquen que el túnel está conectado. Sal de los registros con `Ctrl+C`; el contenedor seguirá ejecutándose.

Finalmente abre tu hostname HTTPS en el navegador. Cloudflare debe mostrar el certificado HTTPS y la página WALL PANEL.

## 8. Firewall de Ubuntu

Como la web está publicada por el túnel y solo escucha en `127.0.0.1:8080`, no necesitas abrir el puerto 8080 a Internet. Mantén únicamente SSH y, si el asesor lo exige, los puertos 80 y 443:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

No ejecutes `sudo ufw enable` hasta confirmar que la regla `OpenSSH` aparece, porque de lo contrario podrías perder la conexión SSH.

## 9. Actualizar cambios después de editar en Visual Studio Code

En tu computadora:

```bash
git add .
git commit -m "Actualiza sitio WALL PANEL"
git push origin main
```

En el servidor:

```bash
cd ~/wallpanel-web
git pull origin main
docker compose up -d --build
```

## 10. Lista de comprobación para entregar al asesor

El dominio está registrado y usa los nameservers de Cloudflare. Cloudflare muestra el túnel como **Healthy**. Ubuntu acepta conexión SSH. Docker y Docker Compose responden a sus comandos de versión. `docker compose ps` muestra los dos contenedores en estado `Up`. `curl -I http://127.0.0.1:8080` devuelve 200. El hostname HTTPS abre la página WALL PANEL y muestra el certificado de Cloudflare.

## Diferencia importante entre la guía y el video

La guía escrita propone crear el túnel con `cloudflared tunnel login`, un UUID, `credentials.json` y `config.yml`. El video propone un túnel administrado desde Zero Trust con un token dentro de Docker Compose. No mezcles los dos métodos en el mismo túnel. Para esta entrega se preparó el método del video.

## Fuentes consultadas

- Video de clase: `https://drive.google.com/file/d/16_qNHZHz_cy0hW1O-CN6v4k0Vr0jM9vM/view`
- Documentación oficial de Cloudflare: `https://developers.cloudflare.com/tunnel/get-started/`
