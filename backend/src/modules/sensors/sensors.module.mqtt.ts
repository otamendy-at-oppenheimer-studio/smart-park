import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { Sensor } from './sensor.entity';
import { ParkingSpace } from '../parking/parking.entity';
import { OccupancyEvent } from '../occupancy/occupancy-event.entity';

/**
 * El módulo de sensores ahora incluye un cliente MQTT.
 * Puedes usar este cliente en el servicio para suscribirte a tópicos y procesar mensajes de sensores en tiempo real.
 *
 * Ejemplo de uso en SensorsService:
 *   constructor(@Inject('MQTT_SERVICE') private readonly mqttClient: ClientProxy) {}
 *   onModuleInit() {
 *     this.mqttClient.connect();
 *     this.mqttClient.subscribeToResponseOf('sensor/event');
 *   }
 *   // Procesar mensajes MQTT en un método aparte
 *
 * Para escalar, puedes desacoplar el procesamiento de eventos MQTT en workers o microservicios independientes.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, ParkingSpace, OccupancyEvent]),
    ClientsModule.register([
      {
        name: 'MQTT_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
        },
      },
    ]),
  ],
  providers: [SensorsService],
  controllers: [SensorsController],
})
export class SensorsModule {}
