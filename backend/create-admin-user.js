#!/usr/bin/env node

/**
 * Script para crear un usuario administrador directamente en Oracle Database
 * Uso: node create-admin-user.js
 */

const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Configuración de la base de datos
const dbConfig = {
  user: 'parkingapp',
  password: 'admin123',
  connectString: 'localhost:1521/FREEPDB1'
};

// Datos del usuario administrador
const adminUser = {
  email: 'admin@gmail.com',
  password: '12341234',
  role: 'admin'
};

async function createAdminUser() {
  let connection;

  try {
    console.log('Conectando a Oracle Database...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✓ Conectado exitosamente');

    // Verificar si el usuario ya existe
    const checkResult = await connection.execute(
      `SELECT id FROM users WHERE email = :email AND deleted IS NULL`,
      [adminUser.email]
    );

    if (checkResult.rows.length > 0) {
      console.log(`⚠ El usuario ${adminUser.email} ya existe en la base de datos`);
      return;
    }

    // Generar hash de la contraseña
    console.log('Generando hash de la contraseña...');
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    console.log('✓ Hash generado');

    // Generar UUID
    const userId = uuidv4();

    // Insertar el usuario
    console.log('Insertando usuario en la base de datos...');
    const result = await connection.execute(
      `INSERT INTO users (id, email, password, role, "createdAt", "updatedAt", deleted)
       VALUES (:id, :email, :password, :role, SYSTIMESTAMP, SYSTIMESTAMP, NULL)`,
      {
        id: userId,
        email: adminUser.email,
        password: hashedPassword,
        role: adminUser.role
      },
      { autoCommit: true }
    );

    console.log('✓ Usuario administrador creado exitosamente');
    console.log('\nCredenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    console.error('✗ Error:', err.message);
    
    if (err.message.includes('ORA-00942')) {
      console.log('\n⚠ La tabla "users" no existe todavía.');
      console.log('Por favor, inicia el backend primero para que TypeORM cree las tablas:');
      console.log('  cd backend && npm start');
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\n✓ Conexión cerrada');
      } catch (err) {
        console.error('Error al cerrar conexión:', err.message);
      }
    }
  }
}

// Ejecutar el script
createAdminUser();
