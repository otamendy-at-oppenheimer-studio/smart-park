#!/bin/sh
# Espera a que el broker MQTT esté disponible antes de arrancar el backend
HOST=${MQTT_BROKER_HOST:-mosquitto}
PORT=${MQTT_BROKER_PORT:-1883}

until nc -z $HOST $PORT; do
  echo "Esperando a que MQTT ($HOST:$PORT) esté disponible..."
  sleep 1
done

echo "MQTT está disponible, arrancando backend..."

npm install && npm run build && npm run start:prod
