-- Migration: Add new rental fields to rentals table
-- This script adds all the new fields required for the enhanced rental system

-- Add phone number field
ALTER TABLE rentals ADD COLUMN renter_phone TEXT;

-- Add rental date fields
ALTER TABLE rentals ADD COLUMN rental_date TEXT;
ALTER TABLE rentals ADD COLUMN rental_day_of_week TEXT;
ALTER TABLE rentals ADD COLUMN return_date TEXT;

-- Add rental type and group information
ALTER TABLE rentals ADD COLUMN rental_type TEXT CHECK (rental_type IN ('개인', '단체'));
ALTER TABLE rentals ADD COLUMN group_name TEXT;

-- Add demographic information
ALTER TABLE rentals ADD COLUMN gender TEXT CHECK (gender IN ('남', '여'));
ALTER TABLE rentals ADD COLUMN region TEXT;
ALTER TABLE rentals ADD COLUMN residence TEXT;
ALTER TABLE rentals ADD COLUMN age_group TEXT;

-- Add rental purpose and disability type
ALTER TABLE rentals ADD COLUMN rental_purpose TEXT;
ALTER TABLE rentals ADD COLUMN disability_type TEXT;

-- Add quantity and period calculations
ALTER TABLE rentals ADD COLUMN quantity INTEGER DEFAULT 1;
ALTER TABLE rentals ADD COLUMN period INTEGER DEFAULT 7;
ALTER TABLE rentals ADD COLUMN total_person_days INTEGER DEFAULT 1;

-- Create indexes for new fields to improve query performance
CREATE INDEX IF NOT EXISTS idx_rentals_rental_type ON rentals(rental_type);
CREATE INDEX IF NOT EXISTS idx_rentals_rental_date ON rentals(rental_date);
CREATE INDEX IF NOT EXISTS idx_rentals_return_date ON rentals(return_date);
CREATE INDEX IF NOT EXISTS idx_rentals_region ON rentals(region);
