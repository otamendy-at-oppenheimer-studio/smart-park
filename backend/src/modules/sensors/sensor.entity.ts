import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParkingSpace } from '../parking/parking.entity';

export enum SensorType {
  ULTRASONIC = 'ultrasonic',
  MAGNETIC = 'magnetic',
  RADAR = 'radar',
}

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hwId: string; // Identificador único del ESP32

  @Column({ type: 'varchar', length: 50, default: SensorType.ULTRASONIC })
  type: SensorType;

  @Column({ nullable: true })
  locationDescription: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => ParkingSpace, parkingSpace => parkingSpace.sensors, { onDelete: 'CASCADE' })
  parkingSpace: ParkingSpace;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
