import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    JwtModule.register({ secret: 'supersecret', signOptions: { expiresIn: '1d' } }),
  ],
  providers: [RolesGuard],
  exports: [JwtModule, RolesGuard],
})
export class CommonModule {}
