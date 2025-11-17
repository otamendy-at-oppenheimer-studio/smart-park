import { Module, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ParkingModule } from './modules/parking/parking.module';
import { OccupancyModule } from './modules/occupancy/occupancy.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = process.env.DB_HOST;
        const portStr = process.env.DB_PORT;
        const username = configService.get<string>('DB_USER');
        const password = configService.get<string>('DB_PASSWORD');
        const serviceName = configService.get<string>('DB_SERVICE_NAME');

        if (!host || !portStr || !username || !password || !serviceName) {
          throw new Error('Faltan variables de entorno para la configuración de la base de datos. Verifica el archivo .env');
        }
        return {
          type: 'oracle',
          host,
          port: parseInt(portStr, 10),
          username,
          password,
          serviceName,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ParkingModule,
  OccupancyModule,
  AuthModule,
  CommonModule,
  AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
