// Script de prueba para publicar eventos MQTT a tu backend
// Ubícalo en la carpeta test/ y ejecútalo con: node test/mqtt-publish.js

const mqtt = require('mqtt');

// Cambia la URL si tu broker no está en localhost
const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);

const payload = {
  hwId: 'ESP32-001', // Cambia por un hwId válido en tu base de datos
  status: 'OCCUPIED' // O 'FREE', según el caso
};

client.on('connect', () => {
  console.log('Conectado a MQTT, publicando evento...');
  client.publish('sensor/event', JSON.stringify(payload), {}, (err) => {
    if (err) {
      console.error('Error al publicar:', err);
    } else {
      console.log('Evento publicado:', payload);
    }
    client.end();
  });
});
