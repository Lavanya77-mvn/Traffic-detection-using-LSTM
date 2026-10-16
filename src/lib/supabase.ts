import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TrafficData {
  id: string;
  timestamp: string;
  day_of_week: string;
  hour: number;
  weather: string;
  vehicle_count: number;
  accident_count: number;
  roadblock_flag: boolean;
  festival: boolean;
  pedestrian_density: number;
  traffic_density: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  input_data: Record<string, unknown>;
  predicted_density: string;
  estimated_delay: number;
  safety_score: number;
  model_used: string;
  confidence: number;
  created_at: string;
}

export interface ModelPerformance {
  id: string;
  model_name: string;
  accuracy: number;
  rmse: number;
  mae: number;
  f1_score: number;
  updated_at: string;
}
