import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() body: { email: string; password: string }) {
		try {
			const result = await this.authService.login(body.email, body.password);
			return { message: 'Login exitoso', ...result };
		} catch (error) {
			return { message: 'Error de autenticación', error: error.message || error };
		}
	}
}
