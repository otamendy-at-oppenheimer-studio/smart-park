# Dockerfile
FROM mysql:8.0

# Establecer variables de entorno para MySQL
ENV MYSQL_ROOT_PASSWORD=unida123
ENV MYSQL_DATABASE=parking_db

# Copiar el script de inicialización
COPY init.sql /docker-entrypoint-initdb.d/

# Exponer el puerto MySQL
EXPOSE 3306