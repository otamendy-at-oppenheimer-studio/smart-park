import { Controller, Get, Param, Patch, Body, Post, UseGuards, Put, Delete } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { SpaceStatus } from './parking.entity';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('parking')
export class ParkingController {
	constructor(private readonly parkingService: ParkingService) {}

	// Obtener todos los espacios
	@Get('spaces')
	async getAllSpaces() {
		return this.parkingService.getAllSpaces();
	}

	// Obtener espacio por id
	@Get('spaces/:id')
	async getSpaceById(@Param('id') id: string) {
		return this.parkingService.getSpaceById(id);
	}

	// Cambiar estado de ocupación manualmente
	@Patch('spaces/:id/status')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async setSpaceStatus(@Param('id') id: string, @Body() body: { status: SpaceStatus }) {
		try {
			const updated = await this.parkingService.setSpaceStatus(id, body.status);
			return {
				message: 'Estado actualizado con éxito',
				space: updated,
			};
		} catch (error) {
			return {
				message: 'Error al actualizar el estado',
				error: error.message || error,
			};
		}
	}

	// Crear múltiples espacios de estacionamiento
	@Post('spaces/multiple')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async createMultipleSpaces(@Body() body: { count: number }) {
		try {
			const spaces = await this.parkingService.createMultipleSpaces(body.count);
			return {
				message: 'Espacios creados con éxito',
				spaces,
			};
		} catch (error) {
			return {
				message: 'Error al crear los espacios',
				error: error.message || error,
			};
		}
	}
	/**
	 * Crear un espacio individual
	 */
	@Post('spaces')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async createSpace(@Body() body: { status?: SpaceStatus; floor?: string }) {
		try {
			const space = await this.parkingService.createSpace(body);
			return { message: 'Espacio creado con éxito', space };
		} catch (error) {
			return { message: 'Error al crear el espacio', error: error.message || error };
		}
	}

	/**
	 * Editar un espacio de estacionamiento
	 */
	@Put('spaces/:id')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async updateSpace(@Param('id') id: string, @Body() body: Partial<{ status: SpaceStatus; floor: string }>) {
		const space = await this.parkingService.updateSpace(id, body);
		if (!space) return { message: 'Espacio no encontrado' };
		return { message: 'Espacio actualizado con éxito', space };
	}

	/**
	 * Soft delete de un espacio de estacionamiento
	 */
	@Delete('spaces/:id')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async softDeleteSpace(@Param('id') id: string) {
		const ok = await this.parkingService.softDeleteSpace(id);
		if (!ok) return { message: 'Espacio no encontrado' };
		return { message: 'Espacio eliminado con éxito' };
	}

	/**
	 * Borrar TODOS los espacios (usado antes de dibujar nuevos espacios con la cámara)
	 */
	@Delete('spaces')
	async deleteAllSpaces() {
		try {
			const result = await this.parkingService.deleteAllSpaces();
			return { 
				message: 'Todos los espacios eliminados con éxito', 
				deletedCount: result.deletedCount 
			};
		} catch (error) {
			return { 
				message: 'Error al eliminar los espacios', 
				error: error.message || error 
			};
		}
	}

	/**
	 * Crear espacio con coordenadas (usado desde draw_spots.py)
	 */
	@Post('spaces/with-coords')
	async createSpaceWithCoords(@Body() body: {
		spaceCode: string;
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		floor?: string;
	}) {
		try {
			const space = await this.parkingService.createSpaceWithCoords(body);
			return { message: 'Espacio creado con coordenadas', space };
		} catch (error) {
			return { 
				message: 'Error al crear el espacio', 
				error: error.message || error 
			};
		}
	}
}
