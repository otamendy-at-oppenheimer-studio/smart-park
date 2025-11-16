import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST');
  const portStr = configService.get<string>('DB_PORT');
  const username = configService.get<string>('DB_USER');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_NAME');

  if (!host || !portStr || !username || !password || !database) {
    throw new Error('Faltan variables de entorno para la configuración de la base de datos. Verifica el archivo .env');
  }

  return {
    type: 'postgres',
    host,
    port: parseInt(portStr, 10),
    username,
    password,
    database,
    autoLoadEntities: true,
    synchronize: true,
  };
};
