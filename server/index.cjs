require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_DATABASE || '12123',
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── FOODS ────────────────────────────────────────────

app.get('/api/foods', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM foods ORDER BY name');
  res.json(rows.map(normalizeFood));
});

app.post('/api/foods', async (req, res) => {
  const { name, caloriesPer100g, proteinPer100g, fatPer100g, carbsPer100g, fiberPer100g } = req.body;
  const id = uuidv4();
  await pool.query(
    'INSERT INTO foods (id, name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g) VALUES (?,?,?,?,?,?,?)',
    [id, name, caloriesPer100g, proteinPer100g, fatPer100g, carbsPer100g, fiberPer100g || 0]
  );
  const [rows] = await pool.query('SELECT * FROM foods WHERE id = ?', [id]);
  res.status(201).json(normalizeFood(rows[0]));
});

app.put('/api/foods/:id', async (req, res) => {
  const { name, caloriesPer100g, proteinPer100g, fatPer100g, carbsPer100g, fiberPer100g } = req.body;
  await pool.query(
    'UPDATE foods SET name=?, calories_per_100g=?, protein_per_100g=?, fat_per_100g=?, carbs_per_100g=?, fiber_per_100g=? WHERE id=?',
    [name, caloriesPer100g, proteinPer100g, fatPer100g, carbsPer100g, fiberPer100g || 0, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM foods WHERE id = ?', [req.params.id]);
  res.json(normalizeFood(rows[0]));
});

app.delete('/api/foods/:id', async (req, res) => {
  await pool.query('DELETE FROM foods WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ─── FOOD ENTRIES ─────────────────────────────────────

app.get('/api/food-entries', async (req, res) => {
  let query = 'SELECT * FROM food_entries';
  const params = [];
  const conditions = [];
  if (req.query.date) {
    conditions.push('DATE(datetime) = ?');
    params.push(req.query.date);
  }
  if (req.query.dateFrom) {
    conditions.push('DATE(datetime) >= ?');
    params.push(req.query.dateFrom);
  }
  if (req.query.dateTo) {
    conditions.push('DATE(datetime) <= ?');
    params.push(req.query.dateTo);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY datetime DESC';
  const [rows] = await pool.query(query, params);
  res.json(rows.map(normalizeFoodEntry));
});

app.post('/api/food-entries', async (req, res) => {
  const { foodItemId, grams, datetime } = req.body;
  const id = uuidv4();
  await pool.query(
    'INSERT INTO food_entries (id, food_item_id, grams, datetime) VALUES (?,?,?,?)',
    [id, foodItemId, grams, datetime]
  );
  const [rows] = await pool.query('SELECT * FROM food_entries WHERE id = ?', [id]);
  res.status(201).json(normalizeFoodEntry(rows[0]));
});

app.delete('/api/food-entries/:id', async (req, res) => {
  await pool.query('DELETE FROM food_entries WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ─── MOVEMENT ENTRIES ─────────────────────────────────

app.get('/api/movement-entries', async (req, res) => {
  let query = 'SELECT * FROM movement_entries';
  const params = [];
  const conditions = [];
  if (req.query.date) {
    conditions.push('DATE(datetime) = ?');
    params.push(req.query.date);
  }
  if (req.query.dateFrom) {
    conditions.push('DATE(datetime) >= ?');
    params.push(req.query.dateFrom);
  }
  if (req.query.dateTo) {
    conditions.push('DATE(datetime) <= ?');
    params.push(req.query.dateTo);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY datetime DESC';
  const [rows] = await pool.query(query, params);
  res.json(rows.map(normalizeMovementEntry));
});

app.post('/api/movement-entries', async (req, res) => {
  const { description, caloriesBurned, datetime } = req.body;
  const id = uuidv4();
  await pool.query(
    'INSERT INTO movement_entries (id, description, calories_burned, datetime) VALUES (?,?,?,?)',
    [id, description, caloriesBurned, datetime]
  );
  const [rows] = await pool.query('SELECT * FROM movement_entries WHERE id = ?', [id]);
  res.status(201).json(normalizeMovementEntry(rows[0]));
});

app.delete('/api/movement-entries/:id', async (req, res) => {
  await pool.query('DELETE FROM movement_entries WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ─── WORKOUT ─────────────────────────────────────────

app.get('/api/workouts', async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  let query = 'SELECT * FROM workout_entries';
  const params = [];
  if (dateFrom && dateTo) {
    query += ' WHERE entry_date >= ? AND entry_date <= ?';
    params.push(dateFrom, dateTo);
  }
  query += ' ORDER BY entry_date';
  const [rows] = await pool.query(query, params);
  res.json(rows.map(normalizeWorkout));
});

app.get('/api/workout/:date', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM workout_entries WHERE entry_date = ?', [req.params.date]);
  if (rows.length === 0) {
    return res.json({ entryDate: req.params.date, wentToGym: false, bodyParts: [], notes: '' });
  }
  res.json(normalizeWorkout(rows[0]));
});

app.put('/api/workout/:date', async (req, res) => {
  const { wentToGym, bodyParts, notes } = req.body;
  await pool.query(
    `INSERT INTO workout_entries (id, entry_date, went_to_gym, body_parts, notes)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE went_to_gym=?, body_parts=?, notes=?`,
    [uuidv4(), req.params.date, wentToGym, JSON.stringify(bodyParts || []), notes || '',
     wentToGym, JSON.stringify(bodyParts || []), notes || '']
  );
  const [rows] = await pool.query('SELECT * FROM workout_entries WHERE entry_date = ?', [req.params.date]);
  res.json(normalizeWorkout(rows[0]));
});

// ─── WEIGHT ──────────────────────────────────────────

app.get('/api/weights', async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  let query = 'SELECT * FROM weight_entries';
  const params = [];
  if (dateFrom && dateTo) {
    query += ' WHERE entry_date >= ? AND entry_date <= ?';
    params.push(dateFrom, dateTo);
  }
  query += ' ORDER BY entry_date';
  const [rows] = await pool.query(query, params);
  res.json(rows.map(normalizeWeight));
});

app.get('/api/weight/:date', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM weight_entries WHERE entry_date = ?', [req.params.date]);
  if (rows.length === 0) return res.json(null);
  res.json(normalizeWeight(rows[0]));
});

app.put('/api/weight/:date', async (req, res) => {
  const { weightKg } = req.body;
  await pool.query(
    `INSERT INTO weight_entries (id, entry_date, weight_kg)
     VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE weight_kg=?`,
    [uuidv4(), req.params.date, weightKg, weightKg]
  );
  const [rows] = await pool.query('SELECT * FROM weight_entries WHERE entry_date = ?', [req.params.date]);
  res.json(normalizeWeight(rows[0]));
});

// ─── GOALS ────────────────────────────────────────────

// ─── MEASUREMENTS ────────────────────────────────────

app.get('/api/measurements', async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  let query = 'SELECT * FROM body_measurements';
  const params = [];
  if (dateFrom && dateTo) {
    query += ' WHERE entry_date >= ? AND entry_date <= ?';
    params.push(dateFrom, dateTo);
  }
  query += ' ORDER BY entry_date';
  const [rows] = await pool.query(query, params);
  res.json(rows.map(normalizeMeasurement));
});

app.get('/api/measurement/:date', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM body_measurements WHERE entry_date = ?', [req.params.date]);
  if (rows.length === 0) return res.json(null);
  res.json(normalizeMeasurement(rows[0]));
});

app.put('/api/measurement/:date', async (req, res) => {
  const { waistCm, hipCm } = req.body;
  await pool.query(
    `INSERT INTO body_measurements (id, entry_date, waist_cm, hip_cm)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE waist_cm=?, hip_cm=?`,
    [uuidv4(), req.params.date, waistCm, hipCm, waistCm, hipCm]
  );
  const [rows] = await pool.query('SELECT * FROM body_measurements WHERE entry_date = ?', [req.params.date]);
  res.json(normalizeMeasurement(rows[0]));
});

// ─── GOALS ────────────────────────────────────────────

app.get('/api/goal', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM daily_goals WHERE id = 1');
  if (rows.length === 0) {
    return res.json({ calories: 2000, protein: 150, fat: 65, carbs: 200, fiber: 25, heightCm: 170, age: 30, gender: 'male', locale: 'es-CL' });
  }
  res.json(normalizeGoal(rows[0]));
});

app.put('/api/goal', async (req, res) => {
  const { calories, protein, fat, carbs, fiber, heightCm, age, gender, initialWeightKg, locale } = req.body;
  await pool.query(
    'INSERT INTO daily_goals (id, calories, protein, fat, carbs, fiber, height_cm, age, gender, initial_weight_kg, locale) VALUES (1,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE calories=?, protein=?, fat=?, carbs=?, fiber=?, height_cm=?, age=?, gender=?, initial_weight_kg=?, locale=?',
    [calories, protein, fat, carbs, fiber, heightCm, age, gender, initialWeightKg, locale || 'es-CL', calories, protein, fat, carbs, fiber, heightCm, age, gender, initialWeightKg, locale || 'es-CL']
  );
  const [rows] = await pool.query('SELECT * FROM daily_goals WHERE id = 1');
  res.json(normalizeGoal(rows[0]));
});

// ─── NORMALIZERS ──────────────────────────────────────

function normalizeFood(row) {
  return {
    id: row.id,
    name: row.name,
    caloriesPer100g: row.calories_per_100g,
    proteinPer100g: parseFloat(row.protein_per_100g),
    fatPer100g: parseFloat(row.fat_per_100g),
    carbsPer100g: parseFloat(row.carbs_per_100g),
    fiberPer100g: parseFloat(row.fiber_per_100g || 0),
  };
}

function toLocalDatetime(dt) {
  if (typeof dt === 'string') return dt.slice(0, 16).replace(' ', 'T');
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const h = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

function normalizeFoodEntry(row) {
  return {
    id: row.id,
    foodItemId: row.food_item_id,
    grams: parseFloat(row.grams),
    datetime: toLocalDatetime(row.datetime),
  };
}

function normalizeMovementEntry(row) {
  return {
    id: row.id,
    description: row.description,
    caloriesBurned: row.calories_burned,
    datetime: toLocalDatetime(row.datetime),
  };
}

function normalizeWorkout(row) {
  return {
    id: row.id,
    entryDate: row.entry_date instanceof Date ? row.entry_date.toISOString().slice(0, 10) : row.entry_date,
    wentToGym: Boolean(row.went_to_gym),
    bodyParts: typeof row.body_parts === 'string' ? JSON.parse(row.body_parts) : (row.body_parts || []),
    notes: row.notes || '',
  };
}

function normalizeWeight(row) {
  return {
    id: row.id,
    entryDate: row.entry_date instanceof Date ? row.entry_date.toISOString().slice(0, 10) : row.entry_date,
    weightKg: parseFloat(row.weight_kg),
  };
}

function normalizeMeasurement(row) {
  return {
    id: row.id,
    entryDate: row.entry_date instanceof Date ? row.entry_date.toISOString().slice(0, 10) : row.entry_date,
    waistCm: row.waist_cm ? parseFloat(row.waist_cm) : null,
    hipCm: row.hip_cm ? parseFloat(row.hip_cm) : null,
  };
}

function normalizeGoal(row) {
  return {
    calories: row.calories,
    protein: parseFloat(row.protein),
    fat: parseFloat(row.fat),
    carbs: parseFloat(row.carbs),
    fiber: row.fiber || 25,
    heightCm: row.height_cm || 170,
    age: row.age || 30,
    gender: row.gender || 'male',
    initialWeightKg: row.initial_weight_kg ? parseFloat(row.initial_weight_kg) : null,
    locale: row.locale || 'es-CL',
  };
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
