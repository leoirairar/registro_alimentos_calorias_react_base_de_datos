CREATE DATABASE IF NOT EXISTS `12123` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `12123`;

CREATE TABLE foods (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  calories_per_100g INT NOT NULL DEFAULT 0,
  protein_per_100g DECIMAL(6,1) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(6,1) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(6,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_entries (
  id VARCHAR(36) PRIMARY KEY,
  food_item_id VARCHAR(36) NOT NULL,
  grams DECIMAL(8,1) NOT NULL,
  datetime DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_item_id) REFERENCES foods(id) ON DELETE CASCADE
);

CREATE TABLE movement_entries (
  id VARCHAR(36) PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  calories_burned INT NOT NULL DEFAULT 0,
  datetime DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_entries (
  id VARCHAR(36) PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  went_to_gym BOOLEAN NOT NULL DEFAULT FALSE,
  body_parts JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weight_entries (
  id VARCHAR(36) PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  weight_kg DECIMAL(5,1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_goals (
  id INT PRIMARY KEY DEFAULT 1,
  calories INT NOT NULL DEFAULT 2000,
  protein DECIMAL(6,1) NOT NULL DEFAULT 150,
  fat DECIMAL(6,1) NOT NULL DEFAULT 65,
  carbs DECIMAL(6,1) NOT NULL DEFAULT 200,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO daily_goals (id, calories, protein, fat, carbs) VALUES (1, 2000, 150, 65, 200)
ON DUPLICATE KEY UPDATE id=id;

-- Alimentos cocidos y comunes (valores aproximados por 100g)
INSERT INTO foods (id, name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g) VALUES
  -- Carnes
  (UUID(), 'Pechuga de pollo cocida',     165, 31.0,  3.6,  0.0),
  (UUID(), 'Tuto de pollo cocido',        209, 26.0, 11.0,  0.0),
  (UUID(), 'Carne molida cocida',         260, 24.0, 18.0,  0.0),
  (UUID(), 'Lomo de vacuno cocido',       250, 26.0, 15.0,  0.0),
  (UUID(), 'Lomo de cerdo cocido',        242, 27.0, 14.0,  0.0),
  (UUID(), 'Salmón cocido',               206, 22.0, 13.0,  0.0),
  (UUID(), 'Reineta cocida',              120, 24.0,  2.5,  0.0),
  (UUID(), 'Atún en conserva',            130, 26.0,  2.5,  0.0),

  -- Huevos y lácteos
  (UUID(), 'Huevo cocido',                155, 13.0, 11.0,  1.1),
  (UUID(), 'Clara de huevo cocida',        52, 10.9,  0.2,  0.7),
  (UUID(), 'Leche entera',                 61,  3.2,  3.3,  4.8),
  (UUID(), 'Yogur natural',                61,  3.5,  3.3,  4.7),
  (UUID(), 'Queso fresco',                300, 22.0, 24.0,  1.0),
  (UUID(), 'Queso rallado parmesano',     431, 38.0, 29.0,  4.0),

  -- Cereales y legumbres cocidos
  (UUID(), 'Arroz blanco cocido',         130,  2.7,  0.3, 28.0),
  (UUID(), 'Fideos cocidos',              131,  5.0,  0.6, 27.0),
  (UUID(), 'Avena cocida',                 71,  2.5,  1.5, 12.0),
  (UUID(), 'Porotos cocidos',             132,  8.7,  0.5, 24.0),
  (UUID(), 'Lentejas cocidas',            116,  9.0,  0.4, 20.0),
  (UUID(), 'Garbanzos cocidos',           139,  8.9,  2.6, 23.0),

  -- Verduras cocidas
  (UUID(), 'Papas cocidas',                87,  2.0,  0.1, 20.0),
  (UUID(), 'Camote cocido',                86,  1.6,  0.1, 20.0),
  (UUID(), 'Zapallo cocido',               26,  1.0,  0.1,  6.0),
  (UUID(), 'Brócoli cocido',               35,  2.4,  0.4,  7.0),
  (UUID(), 'Zanahoria cocida',             35,  0.8,  0.2,  8.0),
  (UUID(), 'Porotos verdes cocidos',       35,  1.9,  0.3,  7.0),
  (UUID(), 'Choclo cocido',                96,  3.4,  1.5, 21.0),

  -- Panes y masas
  (UUID(), 'Pan amasado',                 290,  9.0,  5.0, 53.0),
  (UUID(), 'Pan de molde blanco',         265,  8.0,  3.5, 49.0),
  (UUID(), 'Pan integral',                247,  9.5,  3.0, 47.0),
  (UUID(), 'Hallulla',                    300,  8.0,  6.0, 53.0),
  (UUID(), 'Marraqueta',                  280,  9.0,  2.0, 56.0),

  -- Frutas
  (UUID(), 'Palta (aguacate)',            160,  2.0, 15.0,  9.0),
  (UUID(), 'Plátano',                      89,  1.1,  0.3, 23.0),
  (UUID(), 'Manzana',                      52,  0.3,  0.2, 14.0),
  (UUID(), 'Naranja',                      47,  0.9,  0.1, 12.0),
  (UUID(), 'Uva',                          69,  0.7,  0.2, 18.0),

  -- Grasas y condimentos
  (UUID(), 'Aceite de oliva',             884,  0.0,100.0,  0.0),
  (UUID(), 'Mayonesa',                    700,  1.0, 77.0,  0.6),
  (UUID(), 'Mantequilla',                 717,  0.9, 81.0,  0.1),

  -- Otros
  (UUID(), 'Proteína en polvo (whey)',    400, 80.0,  5.0, 10.0),
  (UUID(), 'Maní tostado',                585, 24.0, 50.0, 16.0),
  (UUID(), 'Almendras',                   579, 21.0, 50.0, 22.0),
  (UUID(), 'Maní japonés',                500, 18.0, 35.0, 45.0);
