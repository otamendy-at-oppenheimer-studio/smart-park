import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
      const host = configService.get<string>('DB_HOST');
      const portStr = configService.get<string>('DB_PORT');
      const username = configService.get<string>('DB_USER');
      const password = configService.get<string>('DB_PASSWORD');
      const sid = configService.get<string>('DB_SID');

        if (!host || !portStr || !username || !password || !sid) {
          throw new Error('Faltan variables de entorno para la configuración de la base de datos. Verifica el archivo .env');
        }

        return {
          type: 'oracle',
          host,
          port: parseInt(portStr, 10),
          username,
          password,
          sid,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
