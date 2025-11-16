import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SensorType } from '../sensor.entity';

/**
 * DTO para actualizar un sensor.
 * Permite cambiar el tipo, la descripción y asociar a un lugar de estacionamiento.
 */
export class UpdateSensorDto {
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
