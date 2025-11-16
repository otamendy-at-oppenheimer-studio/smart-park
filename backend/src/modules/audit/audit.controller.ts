import { Controller, Get, Query, Param, Delete, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditAction } from './audit-log.entity';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('audit')
@UseGuards(RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit
   * Obtener registros de auditoría con filtros opcionales
   * Solo accesible para administradores
   */
  @Get()
  @Roles('admin')
  async getAuditLogs(
    @Query('tableName') tableName?: string,
    @Query('action') action?: AuditAction,
    @Query('recordId') recordId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (tableName) filters.tableName = tableName;
    if (action) filters.action = action;
    if (recordId) filters.recordId = recordId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (limit) filters.limit = parseInt(limit, 10);

    return await this.auditService.findAll(filters);
  }

  /**
   * GET /audit/table/:tableName
   * Obtener registros de auditoría por tabla
   */
  @Get('table/:tableName')
  @Roles('admin')
  async getByTable(
    @Param('tableName') tableName: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.auditService.getByTable(tableName, limitNum);
  }

  /**
   * GET /audit/record/:tableName/:recordId
   * Obtener historial completo de un registro específico
   */
  @Get('record/:tableName/:recordId')
  @Roles('admin')
  async getRecordHistory(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ) {
    return await this.auditService.getRecordHistory(tableName, recordId);
  }

  /**
   * GET /audit/action/:action
   * Obtener registros de auditoría por tipo de acción
   */
  @Get('action/:action')
  @Roles('admin')
  async getByAction(
    @Param('action') action: AuditAction,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.auditService.getByAction(action, limitNum);
  }

  /**
   * GET /audit/statistics
   * Obtener estadísticas de auditoría
   */
  @Get('statistics')
  @Roles('admin')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return await this.auditService.getStatistics(start, end);
  }

  /**
   * DELETE /audit/cleanup/:days
   * Eliminar registros de auditoría más antiguos que X días
   */
  @Delete('cleanup/:days')
  @Roles('admin')
  async cleanupOldRecords(@Param('days') days: string) {
    const daysNum = parseInt(days, 10);
    const deletedCount = await this.auditService.cleanOldRecords(daysNum);
    
    return {
      message: `Se eliminaron ${deletedCount} registros de auditoría antiguos`,
      deletedCount,
    };
  }
}
