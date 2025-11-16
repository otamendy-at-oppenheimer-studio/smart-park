import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingSpace, SpaceStatus } from './parking.entity';

@Injectable()
export class ParkingService {
		// Validación de formato para spaceCode: Letra A-Z, guion, número 01-99
		private isValidSpaceCode(spaceCode: string): boolean {
			return /^[A-Z]-([0][1-9]|[1-9][0-9])$/.test(spaceCode);
		}

			// Genera el siguiente spaceCode disponible automáticamente
			private async generateNextSpaceCode(): Promise<string> {
				const spaces = await this.parkingRepo.find();
				const codes = spaces.map(s => s.spaceCode);
				// Buscar el primer código libre en el formato A-01, A-02, ..., Z-99
				for (let l = 65; l <= 90; l++) { // A-Z
					for (let n = 1; n <= 99; n++) {
						const code = `${String.fromCharCode(l)}-${n.toString().padStart(2, '0')}`;
						if (!codes.includes(code)) {
							return code;
						}
					}
				}
				throw new Error('No hay códigos disponibles');
			}

			// Crear espacio con código generado automáticamente
			async createSpace(data: { status?: SpaceStatus; floor?: string }): Promise<ParkingSpace> {
				const spaceCode = await this.generateNextSpaceCode();
				const space = this.parkingRepo.create({
					spaceCode,
					status: data.status ?? SpaceStatus.UNKNOWN,
					floor: data.floor,
				});
				return this.parkingRepo.save(space);
			}
	constructor(
		@InjectRepository(ParkingSpace)
		private parkingRepo: Repository<ParkingSpace>,
	) {}

	// Obtener todos los espacios y su estado
	async getAllSpaces(): Promise<ParkingSpace[]> {
		return this.parkingRepo.find({ relations: ['sensors'] });
	}

	// Obtener un espacio por id
		async getSpaceById(id: string): Promise<ParkingSpace> {
			const space = await this.parkingRepo.findOne({ where: { id }, relations: ['sensors'] });
			if (!space) throw new Error('ParkingSpace no encontrado');
			return space;
		}

	// Cambiar el estado de ocupación manualmente
	async setSpaceStatus(id: string, status: SpaceStatus): Promise<ParkingSpace> {
		const space = await this.parkingRepo.findOne({ where: { id } });
		if (!space) throw new Error('ParkingSpace no encontrado');
		space.status = status;
		return this.parkingRepo.save(space);
	}

	// Crear múltiples espacios de estacionamiento
		async createMultipleSpaces(count: number): Promise<ParkingSpace[]> {
			const spaces: ParkingSpace[] = [];
			for (let i = 1; i <= count; i++) {
				// Genera un código válido, por ejemplo: A-01, A-02, ...
				const letter = String.fromCharCode(65 + ((i - 1) % 26));
				const number = (i % 100).toString().padStart(2, '0');
				const spaceCode = `${letter}-${number}`;
				const exists = await this.parkingRepo.findOne({ where: { spaceCode } });
				if (exists) continue;
				const space = this.parkingRepo.create({
					spaceCode,
					status: SpaceStatus.UNKNOWN,
				});
				spaces.push(space);
			}
			return this.parkingRepo.save(spaces);
		}
	/**
	 * Editar un espacio de estacionamiento
	 */
	async updateSpace(id: string, data: Partial<{ status: SpaceStatus; floor: string }>): Promise<ParkingSpace | null> {
		const space = await this.parkingRepo.findOne({ where: { id } });
		if (!space) return null;
		if (data.status) space.status = data.status;
		if (data.floor) space.floor = data.floor;
		await this.parkingRepo.save(space);
		return space;
	}

	/**
	 * Soft delete de un espacio de estacionamiento
	 */
	async softDeleteSpace(id: string): Promise<boolean> {
		const space = await this.parkingRepo.findOne({ where: { id } });
		if (!space) return false;
		// Si quieres un borrado lógico, puedes agregar un campo "deleted" en la entidad y marcarlo aquí
		// Por ahora, lo eliminamos físicamente
		await this.parkingRepo.remove(space);
		return true;
	}
}
