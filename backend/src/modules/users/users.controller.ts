import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@UseGuards(RolesGuard)
	@Roles('admin')
	async create(@Body() body: { email: string; password: string; role?: UserRole }) {
		try {
			const user = await this.usersService.createUser(body);
			return { message: 'Usuario creado con éxito', user };
		} catch (error) {
			return { message: 'Error al crear usuario', error: error.message || error };
		}
	}

	@Patch(':id')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async update(@Param('id') id: string, @Body() body: Partial<{ email: string; password: string; role: UserRole }>) {
		try {
			const user = await this.usersService.updateUser(id, body);
			if (!user) return { message: 'Usuario no encontrado' };
			return { message: 'Usuario actualizado con éxito', user };
		} catch (error) {
			return { message: 'Error al actualizar usuario', error: error.message || error };
		}
	}

	@Delete(':id')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async softDelete(@Param('id') id: string) {
		try {
			const ok = await this.usersService.softDeleteUser(id);
			if (!ok) return { message: 'Usuario no encontrado' };
			return { message: 'Usuario eliminado (soft delete) con éxito' };
		} catch (error) {
			return { message: 'Error al eliminar usuario', error: error.message || error };
		}
	}
	/**
	 * Obtener todos los usuarios no eliminados
	 */
	@Get()
	@UseGuards(RolesGuard)
	@Roles('admin')
	async findAll() {
		return this.usersService.findAll();
	}

	/**
	 * Obtener usuario por ID
	 */
	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles('admin')
	async findById(@Param('id') id: string) {
		const user = await this.usersService.findById(id);
		if (!user) return { message: 'Usuario no encontrado' };
		return user;
	}
}
