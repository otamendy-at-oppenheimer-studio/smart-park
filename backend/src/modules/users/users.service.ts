
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private userRepo: Repository<User>,
	) {}

	async createUser(data: { email: string; password: string; role?: UserRole }): Promise<User> {
		const hash = await bcrypt.hash(data.password, 10);
		const user = this.userRepo.create({
			email: data.email,
			password: hash,
			role: data.role ?? UserRole.USER,
			deleted: null,
		});
		return this.userRepo.save(user);
	}

	async updateUser(id: string, data: Partial<{ email: string; password: string; role: UserRole }>): Promise<User | null> {
		const user = await this.userRepo.findOne({ where: { id, deleted: IsNull() } });
		if (!user) return null;
		if (data.email) user.email = data.email;
		if (data.password) user.password = await bcrypt.hash(data.password, 10);
		if (data.role) user.role = data.role;
		await this.userRepo.save(user);
		return user;
	}

	async softDeleteUser(id: string): Promise<boolean> {
		const user = await this.userRepo.findOne({ where: { id, deleted: IsNull() } });
		if (!user) return false;
		user.deleted = new Date();
		await this.userRepo.save(user);
		return true;
	}

	async findByEmail(email: string): Promise<User | null> {
			return this.userRepo.findOne({ where: { email, deleted: IsNull() } });
		}
	/**
	 * Obtener todos los usuarios no eliminados
	 */
	async findAll(): Promise<User[]> {
		return this.userRepo.find({ where: { deleted: IsNull() } });
	}

	/**
	 * Obtener usuario por ID (no eliminado)
	 */
	async findById(id: string): Promise<User | null> {
		return this.userRepo.findOne({ where: { id, deleted: IsNull() } });
	}
}
