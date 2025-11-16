import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';
import { ParkingSpace } from './parking.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSpace]), CommonModule],
  providers: [ParkingService],
  controllers: [ParkingController]
})
export class ParkingModule {}
