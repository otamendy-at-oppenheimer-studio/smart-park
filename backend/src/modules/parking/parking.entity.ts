import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sensor } from '../sensors/sensor.entity';

export enum SpaceStatus {
  FREE = 'free',
  OCCUPIED = 'occupied',
  UNKNOWN = 'unknown',
}

@Entity('parking_spaces')
export class ParkingSpace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  spaceCode: string; // Ej: A-01, B-03

  @Column({ type: 'varchar', length: 50, default: SpaceStatus.UNKNOWN })
  status: SpaceStatus;

  @OneToMany(() => Sensor, sensor => sensor.parkingSpace, { cascade: true })
  sensors: Sensor[];

  @Column({ nullable: true })
  floor: string;

  // Coordenadas del espacio de estacionamiento (desde la cámara)
  @Column({ type: 'int', nullable: true })
  x1: number; // Esquina superior izquierda - X

  @Column({ type: 'int', nullable: true })
  y1: number; // Esquina superior izquierda - Y

  @Column({ type: 'int', nullable: true })
  x2: number; // Esquina inferior derecha - X

  @Column({ type: 'int', nullable: true })
  y2: number; // Esquina inferior derecha - Y

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
