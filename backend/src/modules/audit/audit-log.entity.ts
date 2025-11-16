import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  tableName: string;

  @Column({ type: 'varchar', length: 20 })
  action: AuditAction;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recordId: string;

  @Column({ type: 'clob', nullable: true })
  oldValues: string; // JSON con los valores anteriores (para UPDATE y DELETE)

  @Column({ type: 'clob', nullable: true })
  newValues: string; // JSON con los valores nuevos (para INSERT y UPDATE)

  @Column({ type: 'varchar', length: 255, nullable: true })
  performedBy: string; // Usuario que realizó el cambio (si está disponible)

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string; // Dirección IP del usuario (si está disponible)

  @CreateDateColumn()
  timestamp: Date;
}
