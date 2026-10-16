import * as tf from '@tensorflow/tfjs';

export interface ModelInput {
  hour: number;
  day_of_week: string;
  weather: string;
  vehicle_count: number;
  festival: boolean;
  accident_count: number;
  roadblock_flag: boolean;
  pedestrian_density: number;
}

const dayMap: Record<string, number> = {
  'Monday': 0,
  'Tuesday': 1,
  'Wednesday': 2,
  'Thursday': 3,
  'Friday': 4,
  'Saturday': 5,
  'Sunday': 6,
};

const weatherMap: Record<string, number> = {
  'Clear': 0,
  'Rainy': 1,
  'Foggy': 2,
  'Snowy': 3,
};

export function encodeInput(input: ModelInput): number[] {
  return [
    input.hour / 23,
    (dayMap[input.day_of_week] || 0) / 6,
    (weatherMap[input.weather] || 0) / 3,
    Math.min(input.vehicle_count / 600, 1),
    input.festival ? 1 : 0,
    Math.min(input.accident_count / 5, 1),
    input.roadblock_flag ? 1 : 0,
    Math.min(input.pedestrian_density / 400, 1),
  ];
}

let model: tf.LayersModel | null = null;

export async function createLSTMModel(): Promise<tf.LayersModel> {
  if (model) {
    return model;
  }

  model = tf.sequential({
    layers: [
      tf.layers.reshape({ inputShape: [8], targetShape: [1, 8] }),
      tf.layers.lstm({ units: 32, returnSequences: true }),
      tf.layers.lstm({ units: 16, returnSequences: false }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 3, activation: 'softmax' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

export async function predictTrafficDensity(input: ModelInput): Promise<{
  density: string;
  probabilities: { Low: number; Medium: number; High: number };
}> {
  const lstmModel = await createLSTMModel();
  const encodedInput = encodeInput(input);
  const inputTensor = tf.tensor2d([encodedInput], [1, 8]);

  const prediction = lstmModel.predict(inputTensor) as tf.Tensor;
  const probabilities = await prediction.data();

  inputTensor.dispose();
  prediction.dispose();

  const densityLabels = ['Low', 'Medium', 'High'];
  const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));

  return {
    density: densityLabels[maxIndex],
    probabilities: {
      Low: Math.round(probabilities[0] * 100),
      Medium: Math.round(probabilities[1] * 100),
      High: Math.round(probabilities[2] * 100),
    },
  };
}

export function calculateDelay(density: string, weather: string, vehicleCount: number): number {
  let baseDelay = 0;

  if (density === 'High') baseDelay = 25;
  else if (density === 'Medium') baseDelay = 10;
  else baseDelay = 2;

  const weatherMultiplier = weather === 'Rainy' ? 1.5 : weather === 'Foggy' ? 1.3 : weather === 'Snowy' ? 1.8 : 1.0;
  const vehicleMultiplier = vehicleCount > 400 ? 1.3 : vehicleCount > 250 ? 1.1 : 1.0;

  return Math.round(baseDelay * weatherMultiplier * vehicleMultiplier * 10) / 10;
}

export function calculateSafetyScore(
  density: string,
  accidentCount: number,
  vehicleCount: number,
  pedestrianDensity: number
): number {
  const trafficWeight = density === 'High' ? 30 : density === 'Medium' ? 15 : 5;
  const accidentWeight = accidentCount * 20;
  const speedVariance = vehicleCount > 400 ? 15 : vehicleCount > 250 ? 10 : 5;
  const pedestrianFactor = pedestrianDensity > 200 ? 10 : pedestrianDensity > 100 ? 5 : 0;

  const safetyScore = 100 - (trafficWeight + accidentWeight + speedVariance + pedestrianFactor);

  return Math.max(0, Math.min(100, Math.round(safetyScore * 10) / 10));
}
