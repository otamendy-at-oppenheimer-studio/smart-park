import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OccupancyEvent, OccupancyStatus } from './occupancy-event.entity';
import { ParkingSpace, SpaceStatus } from '../parking/parking.entity';

@Injectable()
export class OccupancyService {
  constructor(
    @InjectRepository(OccupancyEvent)
    private occupancyRepo: Repository<OccupancyEvent>,
    @InjectRepository(ParkingSpace)
    private parkingRepo: Repository<ParkingSpace>,
  ) {}

  // Función para mapear enums
  private mapOccupancyToSpaceStatus(status: OccupancyStatus): SpaceStatus {
    switch (status) {
      case OccupancyStatus.FREE:
        return SpaceStatus.FREE;
      case OccupancyStatus.OCCUPIED:
        return SpaceStatus.OCCUPIED;
      default:
        return SpaceStatus.UNKNOWN;
    }
  }

  // Crear un evento cuando cambia el estado de un espacio
  async createEvent(
    parkingSpaceId: string,
    status: OccupancyStatus,
  ): Promise<OccupancyEvent> {
    const parkingSpace = await this.parkingRepo.findOne({
      where: { id: parkingSpaceId },
    });
    if (!parkingSpace) throw new Error('Parking space no encontrado');

    // Actualizar estado actual del ParkingSpace usando la función de mapeo
    parkingSpace.status = this.mapOccupancyToSpaceStatus(status);
    await this.parkingRepo.save(parkingSpace);

    // Crear registro histórico
    const event = this.occupancyRepo.create({ parkingSpace, status });
    return this.occupancyRepo.save(event);
  }

  // Obtener historial de un espacio
  async getHistory(parkingSpaceId: string): Promise<OccupancyEvent[]> {
    return this.occupancyRepo.find({
      where: { parkingSpace: { id: parkingSpaceId } },
      order: { timestamp: 'DESC' },
    });
  }
  /**
   * Obtener todos los eventos de ocupación
   */
  async findAll(): Promise<OccupancyEvent[]> {
    return this.occupancyRepo.find({ relations: ['parkingSpace'], order: { timestamp: 'DESC' } });
  }

  /**
   * Obtener un evento de ocupación por ID
   */
  async findById(id: string): Promise<OccupancyEvent | null> {
    return this.occupancyRepo.findOne({ where: { id }, relations: ['parkingSpace'] });
  }

  /**
   * Editar un evento de ocupación (solo status)
   */
  async updateEvent(id: string, status: OccupancyStatus): Promise<OccupancyEvent | null> {
    const event = await this.occupancyRepo.findOne({ where: { id } });
    if (!event) return null;
    event.status = status;
    await this.occupancyRepo.save(event);
    return event;
  }

  /**
   * Soft delete de un evento de ocupación (eliminar físicamente)
   */
  async softDelete(id: string): Promise<boolean> {
    const event = await this.occupancyRepo.findOne({ where: { id } });
    if (!event) return false;
    await this.occupancyRepo.remove(event);
    return true;
  }
}
