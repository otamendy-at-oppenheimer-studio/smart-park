import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ParkingSpace } from '../parking/parking.entity';

export enum OccupancyStatus {
  FREE = 'free',
  OCCUPIED = 'occupied',
  UNKNOWN = 'unknown',
}

@Entity('occupancy_events')
export class OccupancyEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ParkingSpace, { nullable: false })
  parkingSpace: ParkingSpace;

  @Column({ type: 'enum', enum: OccupancyStatus })
  status: OccupancyStatus;

  @CreateDateColumn()
  timestamp: Date;
}
