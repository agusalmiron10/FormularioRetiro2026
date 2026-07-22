-- Esquema de la base de inscripciones — Alegría Retreats: RENUEVA 2026
-- Aplicar con:  npx wrangler d1 execute renueva-2026 --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS inscripciones (
  id                            INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Datos personales
  nombre_completo               TEXT NOT NULL,
  email                         TEXT NOT NULL,
  telefono                      TEXT NOT NULL,
  direccion                     TEXT NOT NULL,
  fecha_nacimiento              TEXT NOT NULL,
  edad                          INTEGER,
  contacto_emergencia_nombre    TEXT NOT NULL,
  contacto_emergencia_telefono  TEXT NOT NULL,

  -- Preferencias
  idioma                        TEXT NOT NULL,
  origen_viaje                  TEXT NOT NULL,
  dieta                         TEXT NOT NULL DEFAULT '[]',  -- JSON array
  dieta_otro                    TEXT,

  -- Retiro
  apoyo_otras_mujeres           TEXT,
  condicion_medica              TEXT,
  preferencia_habitacion        TEXT,
  transporte                    TEXT,
  oracion                       TEXT,
  expectativas                  TEXT NOT NULL DEFAULT '[]',  -- JSON array
  expectativas_otro             TEXT,
  como_se_entero                TEXT,

  -- Confirmaciones y cierre
  confirma_reserva              INTEGER NOT NULL DEFAULT 0,
  confirma_cancelacion          INTEGER NOT NULL DEFAULT 0,
  confirma_terminos             INTEGER NOT NULL DEFAULT 0,
  comentarios                   TEXT,

  creado_en                     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Una inscripción puede tener varios pagos (1ra cuota, 2da cuota, donación...).
CREATE TABLE IF NOT EXISTS pagos (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  inscripcion_id      INTEGER NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,

  tipo                TEXT NOT NULL,     -- early-full | early-1 | early-2 | regular-full | volunteer-* | donation-*
  descripcion         TEXT NOT NULL,     -- etiqueta legible tal como la eligió la persona
  monto               REAL,              -- NULL en voluntarias y donaciones de monto libre
  moneda              TEXT NOT NULL DEFAULT 'AUD',
  metodo              TEXT NOT NULL DEFAULT 'transferencia',  -- transferencia | paypal

  comprobante_key     TEXT,              -- ruta del archivo en R2
  comprobante_nombre  TEXT,
  comprobante_tipo    TEXT,

  -- 'pendiente' = subió el comprobante; 'verificado' = la plata está confirmada en la cuenta.
  estado              TEXT NOT NULL DEFAULT 'pendiente',  -- pendiente | verificado | rechazado
  referencia_externa  TEXT,              -- id de transacción de PayPal

  reportado_en        TEXT NOT NULL DEFAULT (datetime('now')),  -- cuándo lo informó la persona
  pagado_en           TEXT,              -- fecha real del pago (PayPal la trae; en transferencia la fija el admin)
  verificado_en       TEXT,
  verificado_por      TEXT,
  nota_admin          TEXT
);

CREATE INDEX IF NOT EXISTS idx_inscripciones_email    ON inscripciones(email);
CREATE INDEX IF NOT EXISTS idx_inscripciones_creado   ON inscripciones(creado_en);
CREATE INDEX IF NOT EXISTS idx_pagos_inscripcion      ON pagos(inscripcion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado           ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_reportado        ON pagos(reportado_en);
CREATE INDEX IF NOT EXISTS idx_pagos_pagado           ON pagos(pagado_en);

-- Evita registrar dos veces el mismo pago de PayPal si el webhook llega repetido.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pagos_referencia
  ON pagos(referencia_externa) WHERE referencia_externa IS NOT NULL;

-- Orden de pago: quién pagó primero, contando solo lo verificado.
CREATE VIEW IF NOT EXISTS orden_de_pago AS
SELECT
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.pagado_en, p.reportado_en)) AS puesto,
  i.id            AS inscripcion_id,
  i.nombre_completo,
  i.email,
  p.descripcion   AS pago,
  p.monto,
  p.metodo,
  COALESCE(p.pagado_en, p.reportado_en) AS fecha
FROM pagos p
JOIN inscripciones i ON i.id = p.inscripcion_id
WHERE p.estado = 'verificado';
