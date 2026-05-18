-- Migration 001: Add authentication and security columns to USUARIO table
-- Date: 2026-05-17
-- Purpose: Support account lockout, password reset, and additional profile fields

-- Add colegio field (H.U. 001 - Registro de Estudiante)
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS colegio VARCHAR(200);

-- Add account lockout fields (H.U. 001 - Bloqueo por intentos fallidos)
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS intentosFallidos INTEGER DEFAULT 0;
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS bloqueadoHasta TIMESTAMP;

-- Add password reset token fields (H.U. 008 - Recuperar Contraseña)
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS resetPasswordToken VARCHAR(255);
ALTER TABLE USUARIO ADD COLUMN IF NOT EXISTS resetPasswordExpires TIMESTAMP;

-- Notes:
-- - intentosFallidos: Counter incremented on login failures, reset to 0 on successful login
-- - bloqueadoHasta: Timestamp when account is locked (set to NOW + 15 minutes after 5 failed attempts)
-- - resetPasswordToken: UUID token generated during forgot-password flow
-- - resetPasswordExpires: Timestamp when reset token expires (set to NOW + 1 hour)
-- - colegio: School/institution name from student registration (H.U. 001)
