-- ============================================
-- Script de inicialización para Oracle Database
-- Smart Parking System
-- ============================================

-- Nota: Este script se ejecuta como usuario APP_USER (parkingapp)
-- El usuario ya está creado por las variables de entorno del contenedor

-- Habilitar DBMS_OUTPUT para debugging
SET SERVEROUTPUT ON;

BEGIN
    DBMS_OUTPUT.PUT_LINE('Iniciando configuración de Smart Parking System...');
END;
/

-- ============================================
-- Configuración de secuencias para IDs
-- ============================================
-- Nota: Oracle no tiene AUTO_INCREMENT como PostgreSQL
-- TypeORM creará las secuencias automáticamente, pero las predefinimos para control

-- No es necesario crear secuencias manualmente ya que TypeORM las manejará
-- con @PrimaryGeneratedColumn('uuid')

BEGIN
    DBMS_OUTPUT.PUT_LINE('Base de datos Oracle lista para Smart Parking System');
    DBMS_OUTPUT.PUT_LINE('Las tablas serán creadas automáticamente por TypeORM con synchronize:true');
END;
/
