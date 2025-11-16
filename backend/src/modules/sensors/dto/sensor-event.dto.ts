import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { OccupancyStatus } from '../../occupancy/occupancy-event.entity';

/**
 * DTO para eventos enviados por sensores (por ejemplo, cambio de estado de ocupación).
 */
export class SensorEventDto {
  @IsString()
  @IsNotEmpty()
  hwId: string;

  @IsEnum(OccupancyStatus)
  status: OccupancyStatus;
}
