/*
  # Traffic Prediction System Database Schema

  1. New Tables
    - `traffic_data`
      - `id` (uuid, primary key)
      - `timestamp` (timestamptz) - when the traffic data was recorded
      - `day_of_week` (text) - day name (Monday, Tuesday, etc.)
      - `hour` (integer) - hour of day (0-23)
      - `weather` (text) - weather condition (Clear, Rainy, Foggy, Snowy)
      - `vehicle_count` (integer) - number of vehicles
      - `accident_count` (integer) - number of accidents
      - `roadblock_flag` (boolean) - whether there's a roadblock
      - `festival` (boolean) - whether it's a festival/holiday
      - `pedestrian_density` (integer) - number of pedestrians
      - `traffic_density` (text) - actual traffic density (Low, Medium, High)
      - `created_at` (timestamptz)

    - `predictions`
      - `id` (uuid, primary key)
      - `input_data` (jsonb) - stores input parameters
      - `predicted_density` (text) - predicted traffic density
      - `estimated_delay` (numeric) - delay in minutes
      - `safety_score` (numeric) - pedestrian safety score (0-100)
      - `model_used` (text) - which model made the prediction
      - `confidence` (numeric) - prediction confidence
      - `created_at` (timestamptz)

    - `model_performance`
      - `id` (uuid, primary key)
      - `model_name` (text) - model identifier
      - `accuracy` (numeric)
      - `rmse` (numeric)
      - `mae` (numeric)
      - `f1_score` (numeric)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (for demo purposes)
    - Add policies for authenticated insert access
*/

CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  day_of_week text NOT NULL,
  hour integer NOT NULL CHECK (hour >= 0 AND hour <= 23),
  weather text NOT NULL,
  vehicle_count integer NOT NULL DEFAULT 0,
  accident_count integer NOT NULL DEFAULT 0,
  roadblock_flag boolean NOT NULL DEFAULT false,
  festival boolean NOT NULL DEFAULT false,
  pedestrian_density integer NOT NULL DEFAULT 0,
  traffic_density text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_data jsonb NOT NULL,
  predicted_density text NOT NULL,
  estimated_delay numeric NOT NULL DEFAULT 0,
  safety_score numeric NOT NULL DEFAULT 0,
  model_used text NOT NULL DEFAULT 'LSTM',
  confidence numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text UNIQUE NOT NULL,
  accuracy numeric NOT NULL DEFAULT 0,
  rmse numeric NOT NULL DEFAULT 0,
  mae numeric NOT NULL DEFAULT 0,
  f1_score numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to traffic data"
  ON traffic_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to traffic data"
  ON traffic_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read access to predictions"
  ON predictions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to predictions"
  ON predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read access to model performance"
  ON model_performance FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated update to model performance"
  ON model_performance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to model performance"
  ON model_performance FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert initial model performance data
INSERT INTO model_performance (model_name, accuracy, rmse, mae, f1_score) VALUES
  ('Random Forest', 0.87, 12.5, 9.3, 0.85),
  ('XGBoost', 0.89, 11.2, 8.7, 0.88),
  ('GLM', 0.82, 15.3, 11.2, 0.80),
  ('LSTM', 0.91, 9.8, 7.5, 0.90)
ON CONFLICT (model_name) DO NOTHING;

-- Insert sample traffic data for visualization
INSERT INTO traffic_data (day_of_week, hour, weather, vehicle_count, accident_count, roadblock_flag, festival, pedestrian_density, traffic_density) VALUES
  ('Monday', 8, 'Clear', 450, 0, false, false, 120, 'High'),
  ('Monday', 12, 'Clear', 280, 1, false, false, 200, 'Medium'),
  ('Monday', 18, 'Clear', 520, 0, false, false, 150, 'High'),
  ('Tuesday', 8, 'Rainy', 380, 2, false, false, 80, 'High'),
  ('Tuesday', 12, 'Rainy', 240, 0, false, false, 100, 'Medium'),
  ('Wednesday', 8, 'Clear', 460, 0, false, false, 130, 'High'),
  ('Wednesday', 14, 'Clear', 210, 0, false, false, 180, 'Low'),
  ('Thursday', 8, 'Foggy', 420, 1, true, false, 90, 'High'),
  ('Friday', 18, 'Clear', 580, 0, false, true, 250, 'High'),
  ('Saturday', 12, 'Clear', 320, 0, false, false, 300, 'Medium'),
  ('Sunday', 14, 'Clear', 180, 0, false, false, 220, 'Low');
