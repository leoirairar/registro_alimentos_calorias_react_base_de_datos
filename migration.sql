CREATE TABLE workout_entries (
  id VARCHAR(36) PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  went_to_gym BOOLEAN NOT NULL DEFAULT FALSE,
  body_parts JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
