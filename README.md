# Registro de Alimento y Calorías

App web para registrar tu alimentación diaria, calcular macros (proteínas, grasas, carbohidratos), tracking de peso, gym y pasos desde Apple Watch.

## 🚀 Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + MySQL
- **Persistencia:** MySQL

## ✨ Funcionalidades

- 📊 **Dashboard mensual** — calendario con calorías por día, peso, días de gym
- 🥩 **Registro de alimentos** — buscador inteligente, cálculo automático de macros por gramos
- 🏋️ **Gimnasio** — marca qué músculos entrenaste (pecho, espalda, piernas, etc.)
- ⚖️ **Peso diario** — registro de peso en ayuno con variación mensual
- 🚶 **Pasos Apple Watch** — sincroniza tus pasos y calorías quemadas
- 🎯 **Metas diarias** — configura tus objetivos de calorías, proteínas, grasas y carbs
- 📋 **Análisis del día** — feedback automático: ¿cumpliste proteína? ¿déficit? ¿qué falta?

## 🗄️ Base de datos

```
12123
├── foods              → Alimentos con info nutricional x 100g
├── food_entries       → Registro diario de comidas
├── movement_entries   → Cardio y pasos
├── workout_entries    → Entrenamiento de gym
├── weight_entries     → Peso diario
└── daily_goals        → Metas del usuario
```

## 🖥️ Capturas

| Dashboard | Registro diario | Alimentos |
|---|---|---|
| Calendario mensual con calorías, peso y gym | Agregar comidas, peso, gym y pasos | CRUD de alimentos con buscador |

## 🛠️ Instalación

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/registro_alimentos_calorias_react_base_de_datos.git
cd "registro_alimentos_calorias_react_base_de_datos"

# 2. Base de datos
mysql -u root -p < schema.sql

# 3. Backend
cd server
npm install
cd ..

# 4. Frontend
npm install

# 5. Iniciar
npm run dev
```

Abrir `http://localhost:5173`
