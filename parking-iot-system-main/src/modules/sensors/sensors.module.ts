import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { Sensor } from './sensor.entity';
import { ParkingSpace } from '../parking/parking.entity';
import { OccupancyEvent } from '../occupancy/occupancy-event.entity';
import { CommonModule } from '../../common/common.module';


/**
 * Módulo de sensores con integración MQTT.
 * - El servicio se suscribe al tópico 'sensor/event' para recibir eventos en tiempo real.
 * - Puedes configurar la URL del broker con la variable de entorno MQTT_BROKER_URL.
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
    CommonModule,
  ],
  providers: [SensorsService],
  controllers: [SensorsController],
})
export class SensorsModule {}
