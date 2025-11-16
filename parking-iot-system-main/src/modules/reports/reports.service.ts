import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Report } from './reports.entity';
import { OccupancyEvent, OccupancyStatus } from '../occupancy/occupancy-event.entity';

@Injectable()
export class ReportsService {
	constructor(
		@InjectRepository(Report)
		private reportRepo: Repository<Report>,
		@InjectRepository(OccupancyEvent)
		private occupancyRepo: Repository<OccupancyEvent>,
	) {}

	async createReport(parkingSpaceId: string, startDate: Date, endDate: Date): Promise<Report> {
		// Obtener eventos de ocupación en el periodo
		const events = await this.occupancyRepo.find({
			where: {
				parkingSpace: { id: parkingSpaceId },
				timestamp: Between(startDate, endDate)
			},
			order: { timestamp: 'ASC' },
		});
		// Calcular cambios de estado y tiempo ocupado
		let cambiosEstado = 0;
		let tiempoOcupado = 0;
		let lastStatus: OccupancyStatus | undefined = undefined;
		let lastTimestamp: Date | undefined = undefined;
		for (const event of events) {
			if (lastStatus !== undefined && event.status !== lastStatus) {
				cambiosEstado++;
			}
			if (event.status === OccupancyStatus.OCCUPIED && lastTimestamp) {
				tiempoOcupado += (event.timestamp.getTime() - lastTimestamp.getTime());
			}
			lastStatus = event.status;
			lastTimestamp = event.timestamp;
		}
		// Guardar reporte
		const report = this.reportRepo.create({
			parkingSpaceId,
			startDate,
			endDate,
			data: { cambiosEstado, tiempoOcupadoMs: tiempoOcupado },
		});
		return this.reportRepo.save(report);
	}

	async updateReport(id: string, data: Partial<Report>): Promise<Report | null> {
		await this.reportRepo.update(id, { ...data, updatedAt: new Date() });
		return this.reportRepo.findOne({ where: { id } });
	}

	async softDeleteReport(id: string): Promise<void> {
		await this.reportRepo.update(id, { deleted: true, updatedAt: new Date() });
	}

	async getReports(): Promise<Report[]> {
		return this.reportRepo.find({ where: { deleted: false } });
	}
}
