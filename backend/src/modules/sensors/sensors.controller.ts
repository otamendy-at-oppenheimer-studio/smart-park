import { Controller, Post, Body, UseGuards, Patch, Param, Get, Delete } from '@nestjs/common';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SensorEventDto } from './dto/sensor-event.dto';
import { SensorsService } from './sensors.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('sensors')
export class SensorsController {
	constructor(private readonly sensorsService: SensorsService) {}

	/**
	 * Actualiza un sensor existente y lo asocia a un lugar de estacionamiento.
	 * Ejemplo: PATCH /sensors/:id { parkingSpaceId: 'uuid-del-espacio' }
	 */
	@Patch(':id')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async updateSensor(@Param('id') id: string, @Body() updateSensorDto: UpdateSensorDto) {
		try {
			const sensor = await this.sensorsService.updateSensor(id, updateSensorDto);
			return {
				message: 'Sensor actualizado con éxito',
				sensor,
			};
		} catch (error) {
			return {
				message: 'Error al actualizar el sensor',
				error: error.message || error,
			};
		}
	}

	/**
	 * Crea un nuevo sensor.
	 * Solo accesible para administradores.
	 * Usa DTO y validación automática.
	 */
	@Post()
	@UseGuards(RolesGuard)
	@Roles('admin')
	async createSensor(@Body() createSensorDto: CreateSensorDto) {
		try {
			const sensor = await this.sensorsService.createSensor(createSensorDto);
			return {
				message: 'Sensor creado con éxito',
				sensor,
			};
		} catch (error) {
			return {
				message: 'Error al crear el sensor',
				error: error.message || error,
			};
		}
	}

	/**
	 * Recibe un evento de sensor (por ejemplo, cambio de estado de ocupación).
	 * Usa DTO y validación automática.
	 */
	@Post('event')
	async processSensorEvent(@Body() sensorEventDto: SensorEventDto) {
		try {
			const event = await this.sensorsService.processSensorEvent(sensorEventDto);
			return {
				message: 'Evento procesado y estado actualizado con éxito',
				event,
			};
		} catch (error) {
			return {
				message: 'Error al procesar el evento',
				error: error.message || error,
			};
		}
	}
	/**
	 * Obtener todos los sensores activos
	 */
	@Get()
	async findAll() {
		return this.sensorsService.findAll();
	}

	/**
	 * Obtener un sensor por ID
	 */
	@Get(':id')
	async findById(@Param('id') id: string) {
		const sensor = await this.sensorsService.findById(id);
		if (!sensor) return { message: 'Sensor no encontrado' };
		return sensor;
	}

	/**
	 * Soft delete de un sensor
	 */
	@Delete(':id')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async softDelete(@Param('id') id: string) {
		const ok = await this.sensorsService.softDelete(id);
		if (!ok) return { message: 'Sensor no encontrado' };
		return { message: 'Sensor eliminado (soft delete) con éxito' };
	}
}
