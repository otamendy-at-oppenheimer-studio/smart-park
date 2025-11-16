import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupancyEvent } from './occupancy-event.entity';
import { ParkingSpace } from '../parking/parking.entity';
import { OccupancyService } from './occupancy.service';
import { OccupancyController } from './occupancy.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([OccupancyEvent, ParkingSpace]), CommonModule],
  providers: [OccupancyService],
  controllers: [OccupancyController],
  exports: [OccupancyService],
})
export class OccupancyModule {}
