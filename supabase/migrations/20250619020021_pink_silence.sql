/*
  # Crear promotores basados en la lista de empleados

  1. Insertar todos los empleados como promotores
  2. Generar códigos únicos para cada uno
  3. Activar todos los promotores por defecto
*/

-- Insertar promotores basados en la lista de empleados
INSERT INTO promoters (name, code, active) VALUES 
  ('VARELA MEDINA MARIA FERNANDA', 'VMMF001', true),
  ('LANZARIN FERRE JESUS SALVADOR', 'LFJS002', true),
  ('VALDEZ GASTELUM JUAN MIGUEL', 'VGJM003', true),
  ('GIL FLORES ADAN ALEJANDRO', 'GFAA004', true),
  ('ROMERO GOMEZ EDGAR HUMBERTO', 'RGEH005', true),
  ('GASTELUM SOTO JORGE ABRAHAM', 'GSJA006', true),
  ('ANAYA TORRES IRAN LIZANDRO', 'ATIL007', true),
  ('FLORES MARQUEZ JOSE GILBERTO', 'FMJG008', true),
  ('LLAMAS ASTORGA JORGE LUIS', 'LAJL009', true),
  ('ARMENTA CRUZ EDGAR SAID', 'ACES010', true),
  ('LOZOYA HERNANDEZ CARLOS', 'LHCA011', true),
  ('GUZMAN GASTELUM ANDREA FERNANDA', 'GGAF012', true),
  ('TIZNADO COTA OSCAR ALEJANDRO', 'TCOA013', true),
  ('MIRANDA ORDOÑEZ EDUARDO', 'MOEA014', true),
  ('BASTIDAS GUZMAN OSCAR ALEXIS', 'BGOA015', true),
  ('SANCHEZ ENRIQUEZ LUIS AROLDO', 'SELA016', true),
  ('GASTELUM LOPEZ DANIEL', 'GLDA017', true),
  ('ANAYA TORRES HERBERTH FERNANDO', 'ATHF018', true),
  ('FUENTES QUINTERO MARTHA ABIGAIL', 'FQMA019', true),
  ('URTUSUASTEGUI MARTINEZ JOSE DANIEL', 'UMJD020', true)
ON CONFLICT (code) DO NOTHING;