-- Cinema Equipment Rental Management System Database Schema
-- Create tables for devices and rentals

-- Devices table: stores equipment information
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('AR_GLASSES', 'BONE_HEADSET', 'SMARTPHONE')),
    name TEXT,
    qty_total INTEGER NOT NULL DEFAULT 0,
    qty_available INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rentals table: stores rental history and current rentals
CREATE TABLE IF NOT EXISTS rentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_type TEXT NOT NULL CHECK (device_type IN ('AR_GLASSES', 'BONE_HEADSET', 'SMARTPHONE')),
    device_name TEXT,
    renter_name TEXT NOT NULL,
    rented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    returned_at DATETIME NULL,
    note_rent TEXT,
    note_return TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);
CREATE INDEX IF NOT EXISTS idx_rentals_device_type ON rentals(device_type);
CREATE INDEX IF NOT EXISTS idx_rentals_returned_at ON rentals(returned_at);
CREATE INDEX IF NOT EXISTS idx_rentals_rented_at ON rentals(rented_at);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_devices_timestamp 
    AFTER UPDATE ON devices
BEGIN
    UPDATE devices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
