
import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor, SensorType } from './sensor.entity';
import { ParkingSpace, SpaceStatus } from '../parking/parking.entity';
import { OccupancyEvent, OccupancyStatus } from '../occupancy/occupancy-event.entity';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { CreateSensorDto } from './dto/create-sensor.dto';

@Injectable()
export class SensorsService implements OnModuleInit {
	private readonly logger = new Logger(SensorsService.name);
	constructor(
		@InjectRepository(Sensor)
		private sensorRepo: Repository<Sensor>,
		@InjectRepository(ParkingSpace)
		private parkingRepo: Repository<ParkingSpace>,
		@InjectRepository(OccupancyEvent)
		private occupancyRepo: Repository<OccupancyEvent>,
		@Inject('MQTT_SERVICE')
		private readonly mqttClient: ClientProxy,
	) {}

	/**
	 * Suscribirse a eventos MQTT al iniciar el módulo.
	 * Procesa mensajes recibidos en el tópico 'sensor/event'.
	 */
	async onModuleInit() {
		await this.mqttClient.connect();
		this.logger.log('Conectado a MQTT. Suscribiendo a sensor/event...');
		// Suscribirse manualmente a eventos MQTT
		// NOTA: El siguiente bloque accede al cliente MQTT subyacente para escuchar mensajes directamente.
		const mqtt = this.mqttClient as any;
		if (mqtt && mqtt['mqttClient']) {
			mqtt['mqttClient'].on('message', async (topic: string, payload: Buffer) => {
				if (topic === 'sensor/event') {
					try {
						const data = JSON.parse(payload.toString());
						await this.processSensorEvent(data);
						this.logger.log('Evento MQTT procesado: ' + JSON.stringify(data));
					} catch (err) {
						this.logger.error('Error procesando evento MQTT', err);
					}
				}
			});
			mqtt['mqttClient'].subscribe('sensor/event');
		}
	}

	/**
	 * Crea un nuevo sensor a partir de un DTO validado.
	 * @param data CreateSensorDto
	 */
	async createSensor(data: CreateSensorDto): Promise<Sensor> {
		const sensor = this.sensorRepo.create({
			hwId: data.hwId,
			type: data.type ?? SensorType.ULTRASONIC,
			locationDescription: data.locationDescription,
		});
		if (data.parkingSpaceId) {
			const space = await this.parkingRepo.findOne({ where: { id: data.parkingSpaceId } });
			if (!space) throw new Error('ParkingSpace no encontrado');
			sensor.parkingSpace = space as ParkingSpace;
		}
		return this.sensorRepo.save(sensor);
	}

	/**
	 * Actualiza un sensor existente y lo asocia a un lugar de estacionamiento.
	 * @param id ID del sensor
	 * @param data UpdateSensorDto
	 */
	async updateSensor(id: string, data: UpdateSensorDto): Promise<Sensor> {
		const sensor = await this.sensorRepo.findOne({ where: { id }, relations: ['parkingSpace'] });
		if (!sensor) throw new Error('Sensor no encontrado');
		if (data.type) sensor.type = data.type;
		if (data.locationDescription) sensor.locationDescription = data.locationDescription;
		if (data.parkingSpaceId) {
			const space = await this.parkingRepo.findOne({ where: { id: data.parkingSpaceId } });
			if (!space) throw new Error('ParkingSpace no encontrado');
			sensor.parkingSpace = space as ParkingSpace;
		}
		return this.sensorRepo.save(sensor);
// ...fin del archivo limpio...
	}

	/**
	 * Procesar evento de sensor recibido por MQTT o HTTP.
	 * Actualiza el estado del lugar de estacionamiento y registra el evento.
	 */
	async processSensorEvent(data: { hwId: string; status: OccupancyStatus }): Promise<OccupancyEvent | void> {
		const sensor = await this.sensorRepo.findOne({ where: { hwId: data.hwId }, relations: ['parkingSpace'] });
		if (!sensor || !sensor.parkingSpace) {
			this.logger.warn('Sensor o ParkingSpace no encontrado para hwId: ' + data.hwId);
			return;
		}
		const parkingSpace = sensor.parkingSpace;
		// Mapear status
		let mappedStatus: SpaceStatus;
		switch (data.status) {
			case OccupancyStatus.FREE:
				mappedStatus = SpaceStatus.FREE;
				break;
			case OccupancyStatus.OCCUPIED:
				mappedStatus = SpaceStatus.OCCUPIED;
				break;
			default:
				mappedStatus = SpaceStatus.UNKNOWN;
		}
		parkingSpace.status = mappedStatus;
		await this.parkingRepo.save(parkingSpace);
		// Registrar evento
		const event = this.occupancyRepo.create({ parkingSpace, status: data.status });
		return this.occupancyRepo.save(event);
	}
	/**
	 * Obtener todos los sensores activos
	 */
	async findAll(): Promise<Sensor[]> {
		return this.sensorRepo.find({ where: { active: true }, relations: ['parkingSpace'] });
	}

	/**
	 * Obtener un sensor por ID
	 */
	async findById(id: string): Promise<Sensor | null> {
		return this.sensorRepo.findOne({ where: { id, active: true }, relations: ['parkingSpace'] });
	}

	/**
	 * Soft delete de un sensor (desactiva el sensor)
	 */
	async softDelete(id: string): Promise<boolean> {
		const sensor = await this.sensorRepo.findOne({ where: { id, active: true } });
		if (!sensor) return false;
		sensor.active = false;
		await this.sensorRepo.save(sensor);
		return true;
	}
}
