import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { SensorType } from '../sensor.entity';

/**
 * DTO para la creación de un sensor.
 * - hwId: identificador único del hardware (obligatorio)
 * - type: tipo de sensor (opcional, por defecto 'ultrasonic')
 * - locationDescription: descripción opcional de la ubicación
 * - parkingSpaceId: id del lugar de estacionamiento asociado (opcional)
 */
export class CreateSensorDto {
  @IsString()
  @IsNotEmpty()
  hwId: string;

  @IsEnum(SensorType)
  @IsOptional()
  type?: SensorType;

  @IsString()
  @IsOptional()
  locationDescription?: string;

  @IsString()
  @IsOptional()
  parkingSpaceId?: string;
}
