import { Body, Controller, Post, Put, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@Post()
	@UseGuards(RolesGuard)
	@Roles('admin', 'user')
	async create(@Body() body: { parkingSpaceId: string; startDate: string; endDate: string }) {
		try {
			const report = await this.reportsService.createReport(
				body.parkingSpaceId,
				new Date(body.startDate),
				new Date(body.endDate)
			);
			return {
				message: 'Reporte creado con éxito',
				report,
			};
		} catch (error) {
			return {
				message: 'Error al crear el reporte',
				error: error.message || error,
			};
		}
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: any) {
		try {
			const report = await this.reportsService.updateReport(id, body);
			return {
				message: 'Reporte actualizado con éxito',
				report,
			};
		} catch (error) {
			return {
				message: 'Error al actualizar el reporte',
				error: error.message || error,
			};
		}
	}

	@Delete(':id')
	async softDelete(@Param('id') id: string) {
		try {
			await this.reportsService.softDeleteReport(id);
			return { message: 'Reporte eliminado con éxito' };
		} catch (error) {
			return {
				message: 'Error al eliminar el reporte',
				error: error.message || error,
			};
		}
	}

	@Get()
	async getAll() {
		return this.reportsService.getReports();
	}
}
