/*
  # Recreate ticket number column as TEXT

  1. Database Changes
    - Drop existing trigger that validates ticket numbers
    - Remove CHECK constraint on number column
    - Drop existing number column (INTEGER)
    - Add new number column as TEXT
    - This allows proper storage of formatted ticket numbers like '0000', '0001', etc.

  2. Notes
    - This will remove all existing ticket number data
    - New tickets will need to be regenerated with proper TEXT format
    - Ensures compatibility with 4-digit padded format (0000-9999)
*/

-- 1. Eliminar el trigger que impide modificar la columna
DROP TRIGGER IF EXISTS validate_ticket_number_trigger ON tickets;

-- 2. Verifica si hay una restricción CHECK que dependa de la columna
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_number_check;

-- 3. Elimina la columna actual (que tiene conflictos)
ALTER TABLE tickets DROP COLUMN IF EXISTS number;

-- 4. Crea nuevamente la columna 'number' como TEXT para manejar boletos como '0001', '0456', etc.
ALTER TABLE tickets ADD COLUMN number TEXT;

-- 5. Agregar constraint para validar formato de 4 dígitos
ALTER TABLE tickets ADD CONSTRAINT tickets_number_format_check 
CHECK (number ~ '^[0-9]{4}$');

-- 6. Agregar índice para búsquedas eficientes
CREATE INDEX IF NOT EXISTS tickets_number_text_idx ON tickets(number);

-- 7. Recrear el constraint de unicidad por sorteo
ALTER TABLE tickets ADD CONSTRAINT tickets_number_raffle_unique 
UNIQUE (number, raffle_id);