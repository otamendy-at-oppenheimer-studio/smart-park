-- ============================================
-- Sistema de Auditoría con Triggers
-- Smart Parking System
-- ============================================
-- Este script crea triggers automáticos para registrar
-- todos los cambios (INSERT, UPDATE, DELETE) en las tablas principales
-- ============================================

SET SERVEROUTPUT ON;

BEGIN
    DBMS_OUTPUT.PUT_LINE('===========================================');
    DBMS_OUTPUT.PUT_LINE('Iniciando configuración de auditoría...');
    DBMS_OUTPUT.PUT_LINE('===========================================');
END;
/

-- ============================================
-- TRIGGER PARA TABLA: users
-- ============================================

-- Trigger para INSERT
CREATE OR REPLACE TRIGGER trg_audit_users_insert
AFTER INSERT ON users
FOR EACH ROW
DECLARE
    v_new_values CLOB;
BEGIN
    -- Construir JSON con los valores nuevos
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"email":"' || :NEW.email || '",' ||
                    '"role":"' || :NEW.role || '",' ||
                    '"createdAt":"' || TO_CHAR(:NEW."createdAt", 'YYYY-MM-DD HH24:MI:SS') || '"}';
    
    -- Insertar en audit_log
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'users', 'INSERT', :NEW.id, NULL, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para UPDATE
CREATE OR REPLACE TRIGGER trg_audit_users_update
AFTER UPDATE ON users
FOR EACH ROW
DECLARE
    v_old_values CLOB;
    v_new_values CLOB;
BEGIN
    -- Construir JSON con los valores antiguos
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"email":"' || :OLD.email || '",' ||
                    '"role":"' || :OLD.role || '",' ||
                    '"updatedAt":"' || TO_CHAR(:OLD."updatedAt", 'YYYY-MM-DD HH24:MI:SS') || '"}';
    
    -- Construir JSON con los valores nuevos
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"email":"' || :NEW.email || '",' ||
                    '"role":"' || :NEW.role || '",' ||
                    '"updatedAt":"' || TO_CHAR(:NEW."updatedAt", 'YYYY-MM-DD HH24:MI:SS') || '"}';
    
    -- Insertar en audit_log
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'users', 'UPDATE', :NEW.id, v_old_values, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para DELETE
CREATE OR REPLACE TRIGGER trg_audit_users_delete
AFTER DELETE ON users
FOR EACH ROW
DECLARE
    v_old_values CLOB;
BEGIN
    -- Construir JSON con los valores eliminados
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"email":"' || :OLD.email || '",' ||
                    '"role":"' || :OLD.role || '",' ||
                    '"deletedAt":"' || TO_CHAR(:OLD.deleted, 'YYYY-MM-DD HH24:MI:SS') || '"}';
    
    -- Insertar en audit_log
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'users', 'DELETE', :OLD.id, v_old_values, NULL, SYSTIMESTAMP
    );
END;
/

-- ============================================
-- TRIGGER PARA TABLA: parking_spaces
-- ============================================

-- Trigger para INSERT
CREATE OR REPLACE TRIGGER trg_audit_parking_insert
AFTER INSERT ON parking_spaces
FOR EACH ROW
DECLARE
    v_new_values CLOB;
BEGIN
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"spaceCode":"' || :NEW."spaceCode" || '",' ||
                    '"status":"' || :NEW.status || '",' ||
                    '"floor":"' || NVL(:NEW.floor, 'null') || '",' ||
                    '"createdAt":"' || TO_CHAR(:NEW."createdAt", 'YYYY-MM-DD HH24:MI:SS') || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'parking_spaces', 'INSERT', :NEW.id, NULL, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para UPDATE
CREATE OR REPLACE TRIGGER trg_audit_parking_update
AFTER UPDATE ON parking_spaces
FOR EACH ROW
DECLARE
    v_old_values CLOB;
    v_new_values CLOB;
BEGIN
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"spaceCode":"' || :OLD."spaceCode" || '",' ||
                    '"status":"' || :OLD.status || '",' ||
                    '"floor":"' || NVL(:OLD.floor, 'null') || '"}';
    
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"spaceCode":"' || :NEW."spaceCode" || '",' ||
                    '"status":"' || :NEW.status || '",' ||
                    '"floor":"' || NVL(:NEW.floor, 'null') || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'parking_spaces', 'UPDATE', :NEW.id, v_old_values, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para DELETE
CREATE OR REPLACE TRIGGER trg_audit_parking_delete
AFTER DELETE ON parking_spaces
FOR EACH ROW
DECLARE
    v_old_values CLOB;
BEGIN
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"spaceCode":"' || :OLD."spaceCode" || '",' ||
                    '"status":"' || :OLD.status || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'parking_spaces', 'DELETE', :OLD.id, v_old_values, NULL, SYSTIMESTAMP
    );
END;
/

-- ============================================
-- TRIGGER PARA TABLA: occupancy_events
-- ============================================

-- Trigger para INSERT
CREATE OR REPLACE TRIGGER trg_audit_occupancy_insert
AFTER INSERT ON occupancy_events
FOR EACH ROW
DECLARE
    v_new_values CLOB;
BEGIN
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"status":"' || :NEW.status || '",' ||
                    '"timestamp":"' || TO_CHAR(:NEW."timestamp", 'YYYY-MM-DD HH24:MI:SS') || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'occupancy_events', 'INSERT', :NEW.id, NULL, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para UPDATE
CREATE OR REPLACE TRIGGER trg_audit_occupancy_update
AFTER UPDATE ON occupancy_events
FOR EACH ROW
DECLARE
    v_old_values CLOB;
    v_new_values CLOB;
BEGIN
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"status":"' || :OLD.status || '"}';
    
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"status":"' || :NEW.status || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'occupancy_events', 'UPDATE', :NEW.id, v_old_values, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para DELETE
CREATE OR REPLACE TRIGGER trg_audit_occupancy_delete
AFTER DELETE ON occupancy_events
FOR EACH ROW
DECLARE
    v_old_values CLOB;
BEGIN
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"status":"' || :OLD.status || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'occupancy_events', 'DELETE', :OLD.id, v_old_values, NULL, SYSTIMESTAMP
    );
END;
/

-- ============================================
-- TRIGGER PARA TABLA: reports
-- ============================================

-- Trigger para INSERT
CREATE OR REPLACE TRIGGER trg_audit_reports_insert
AFTER INSERT ON reports
FOR EACH ROW
DECLARE
    v_new_values CLOB;
BEGIN
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"parkingSpaceId":"' || :NEW."parkingSpaceId" || '",' ||
                    '"startDate":"' || TO_CHAR(:NEW."startDate", 'YYYY-MM-DD HH24:MI:SS') || '",' ||
                    '"endDate":"' || TO_CHAR(:NEW."endDate", 'YYYY-MM-DD HH24:MI:SS') || '",' ||
                    '"deleted":"' || CASE WHEN :NEW.deleted = 1 THEN 'true' ELSE 'false' END || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'reports', 'INSERT', :NEW.id, NULL, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para UPDATE
CREATE OR REPLACE TRIGGER trg_audit_reports_update
AFTER UPDATE ON reports
FOR EACH ROW
DECLARE
    v_old_values CLOB;
    v_new_values CLOB;
BEGIN
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"parkingSpaceId":"' || :OLD."parkingSpaceId" || '",' ||
                    '"deleted":"' || CASE WHEN :OLD.deleted = 1 THEN 'true' ELSE 'false' END || '"}';
    
    v_new_values := '{"id":"' || :NEW.id || '",' ||
                    '"parkingSpaceId":"' || :NEW."parkingSpaceId" || '",' ||
                    '"deleted":"' || CASE WHEN :NEW.deleted = 1 THEN 'true' ELSE 'false' END || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'reports', 'UPDATE', :NEW.id, v_old_values, v_new_values, SYSTIMESTAMP
    );
END;
/

-- Trigger para DELETE
CREATE OR REPLACE TRIGGER trg_audit_reports_delete
AFTER DELETE ON reports
FOR EACH ROW
DECLARE
    v_old_values CLOB;
BEGIN
    v_old_values := '{"id":"' || :OLD.id || '",' ||
                    '"parkingSpaceId":"' || :OLD."parkingSpaceId" || '"}';
    
    INSERT INTO audit_log (
        id, "tableName", action, "recordId", "oldValues", "newValues", "timestamp"
    ) VALUES (
        SYS_GUID_AS_CHAR(), 'reports', 'DELETE', :OLD.id, v_old_values, NULL, SYSTIMESTAMP
    );
END;
/

-- ============================================
-- Función auxiliar para convertir SYS_GUID a VARCHAR
-- ============================================
CREATE OR REPLACE FUNCTION SYS_GUID_AS_CHAR
RETURN VARCHAR2
IS
BEGIN
    RETURN LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), 
           '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})', 
           '\1-\2-\3-\4-\5'));
END;
/

-- ============================================
-- Verificación de triggers creados
-- ============================================
BEGIN
    DBMS_OUTPUT.PUT_LINE('===========================================');
    DBMS_OUTPUT.PUT_LINE('Triggers de auditoría creados exitosamente');
    DBMS_OUTPUT.PUT_LINE('===========================================');
    DBMS_OUTPUT.PUT_LINE('Tablas auditadas:');
    DBMS_OUTPUT.PUT_LINE('  - users');
    DBMS_OUTPUT.PUT_LINE('  - parking_spaces');
    DBMS_OUTPUT.PUT_LINE('  - occupancy_events');
    DBMS_OUTPUT.PUT_LINE('  - reports');
    DBMS_OUTPUT.PUT_LINE('===========================================');
END;
/
