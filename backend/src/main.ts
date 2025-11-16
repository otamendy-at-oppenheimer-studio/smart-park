import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  Logger.log('Arrancando backend ParkingAccess...');
  Logger.log(`Valor de process.env.DB_HOST: ${process.env.DB_HOST}`);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
