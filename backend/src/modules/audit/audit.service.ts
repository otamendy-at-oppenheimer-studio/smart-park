import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Obtener todos los registros de auditoría con filtros opcionales
   */
  async findAll(filters?: {
    tableName?: string;
    action?: AuditAction;
    recordId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (filters?.tableName) {
      query.andWhere('audit.tableName = :tableName', { tableName: filters.tableName });
    }

    if (filters?.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.recordId) {
      query.andWhere('audit.recordId = :recordId', { recordId: filters.recordId });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    query.orderBy('audit.timestamp', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }

    return await query.getMany();
  }

  /**
   * Obtener historial de cambios de un registro específico
   */
  async getRecordHistory(tableName: string, recordId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: {
        tableName,
        recordId,
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  /**
   * Obtener registros de auditoría por tabla
   */
  async getByTable(tableName: string, limit = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { tableName },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtener registros de auditoría por acción
   */
  async getByAction(action: AuditAction, limit = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { action },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtener registros de auditoría por rango de fechas
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Obtener estadísticas de auditoría
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (startDate && endDate) {
      query.where('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalRecords = await query.getCount();

    const byTable = await query
      .select('audit.tableName', 'tableName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.tableName')
      .getRawMany();

    const byAction = await query
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    return {
      totalRecords,
      byTable,
      byAction,
    };
  }

  /**
   * Limpiar registros de auditoría antiguos
   */
  async cleanOldRecords(daysOld: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :date', { date })
      .execute();

    return result.affected || 0;
  }
}
