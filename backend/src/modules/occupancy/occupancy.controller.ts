import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { OccupancyService } from './occupancy.service';
import { OccupancyStatus } from './occupancy-event.entity';

@Controller('occupancy')
export class OccupancyController {
  constructor(private readonly occupancyService: OccupancyService) {}

  // Crear un evento de ocupación
  @Post()
  async createEvent(
    @Body() body: { parkingSpaceId: string; status: OccupancyStatus },
  ) {
    const { parkingSpaceId, status } = body;
    try {
      const event = await this.occupancyService.createEvent(parkingSpaceId, status);
      return {
        message: 'Evento de ocupación creado con éxito',
        event,
      };
    } catch (error) {
      return {
        message: 'Error al crear el evento de ocupación',
        error: error.message || error,
      };
    }
  }

  // Obtener historial de un espacio
  @Get('history/:parkingSpaceId')
  async getHistory(@Param('parkingSpaceId') parkingSpaceId: string) {
    return this.occupancyService.getHistory(parkingSpaceId);
  }
  /**
   * Obtener todos los eventos de ocupación
   */
  @Get()
  async findAll() {
    return this.occupancyService.findAll();
  }

  /**
   * Obtener un evento de ocupación por ID
   */
  @Get('event/:id')
  async findById(@Param('id') id: string) {
    const event = await this.occupancyService.findById(id);
    if (!event) return { message: 'Evento no encontrado' };
    return event;
  }

  /**
   * Editar un evento de ocupación (solo status)
   */
  @Patch('event/:id')
  async updateEvent(@Param('id') id: string, @Body() body: { status: string }) {
    // Convertir string a OccupancyStatus enum
    const statusEnum = body.status as any;
    const event = await this.occupancyService.updateEvent(id, statusEnum);
    if (!event) return { message: 'Evento no encontrado' };
    return { message: 'Evento actualizado con éxito', event };
  }

  /**
   * Soft delete de un evento de ocupación
   */
  @Delete('event/:id')
  async softDelete(@Param('id') id: string) {
    const ok = await this.occupancyService.softDelete(id);
    if (!ok) return { message: 'Evento no encontrado' };
    return { message: 'Evento eliminado con éxito' };
  }
}
