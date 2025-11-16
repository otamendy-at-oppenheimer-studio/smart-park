import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.findByEmail(email);
		if (!user) return null;
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) return null;
		return user;
	}

	async login(email: string, password: string) {
		const user = await this.validateUser(email, password);
		if (!user) throw new UnauthorizedException('Credenciales inválidas');
		const payload = { sub: user.id, email: user.email, role: user.role };
		return {
			access_token: this.jwtService.sign(payload),
			user: { id: user.id, email: user.email, role: user.role },
		};
	}
}
