# init.sql
CREATE DATABASE IF NOT EXISTS parking_db;
USE parking_db;

CREATE TABLE IF NOT EXISTS parking_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    occupied BOOLEAN NOT NULL,
    timestamp DATETIME NOT NULL
);