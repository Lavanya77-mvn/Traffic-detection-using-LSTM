import { useState, useEffect } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { supabase, TrafficData, ModelPerformance } from './lib/supabase';
import { predictTrafficDensity, calculateDelay, calculateSafetyScore, ModelInput } from './lib/trafficModel';
import TrafficTrendsChart from './components/TrafficTrendsChart';
import ModelComparisonChart from './components/ModelComparisonChart';
import PredictionResult from './components/PredictionResult';

function App() {
  const [hour, setHour] = useState<number>(8);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Monday');
  const [weather, setWeather] = useState<string>('Clear');
  const [vehicleCount, setVehicleCount] = useState<number>(300);
  const [festival, setFestival] = useState<boolean>(false);
  const [accidentCount, setAccidentCount] = useState<number>(0);
  const [roadblockFlag, setRoadblockFlag] = useState<boolean>(false);
  const [pedestrianDensity, setPedestrianDensity] = useState<number>(100);

  const [prediction, setPrediction] = useState<{
    density: string;
    delay: number;
    safetyScore: number;
    confidence: number;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: traffic } = await supabase
      .from('traffic_data')
      .select('*')
      .order('timestamp', { ascending: true })
      .limit(20);

    const { data: models } = await supabase
      .from('model_performance')
      .select('*')
      .order('accuracy', { ascending: false });

    if (traffic) setTrafficData(traffic);
    if (models) setModelPerformance(models);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const input: ModelInput = {
        hour,
        day_of_week: dayOfWeek,
        weather,
        vehicle_count: vehicleCount,
        festival,
        accident_count: accidentCount,
        roadblock_flag: roadblockFlag,
        pedestrian_density: pedestrianDensity,
      };

      const result = await predictTrafficDensity(input);
      const delay = calculateDelay(result.density, weather, vehicleCount);
      const safetyScore = calculateSafetyScore(result.density, accidentCount, vehicleCount, pedestrianDensity);

      const confidence = Math.max(...Object.values(result.probabilities));

      setPrediction({
        density: result.density,
        delay,
        safetyScore,
        confidence,
      });

      await supabase.from('predictions').insert({
        input_data: input,
        predicted_density: result.density,
        estimated_delay: delay,
        safety_score: safetyScore,
        model_used: 'LSTM',
        confidence,
      });
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Smart City Traffic Prediction
            </h1>
          </div>
          <p className="text-gray-600 ml-13">AI-powered traffic congestion prediction using LSTM deep learning</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Input Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time of Day: {hour}:00
                </label>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weather Condition</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Clear</option>
                  <option>Rainy</option>
                  <option>Foggy</option>
                  <option>Snowy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Count: {vehicleCount}
                </label>
                <input
                  type="range"
                  min="0"
                  max="600"
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accident Count: {accidentCount}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={accidentCount}
                  onChange={(e) => setAccidentCount(Number(e.target.value))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pedestrian Density: {pedestrianDensity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={pedestrianDensity}
                  onChange={(e) => setPedestrianDensity(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={festival}
                    onChange={(e) => setFestival(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Festival/Holiday</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roadblockFlag}
                    onChange={(e) => setRoadblockFlag(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Roadblock</span>
                </label>
              </div>

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Predicting...' : 'Predict Traffic'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {prediction && (
              <PredictionResult
                density={prediction.density}
                delay={prediction.delay}
                safetyScore={prediction.safetyScore}
                confidence={prediction.confidence}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trafficData.length > 0 && <TrafficTrendsChart data={trafficData} />}
          {modelPerformance.length > 0 && <ModelComparisonChart models={modelPerformance} />}
        </div>
      </div>
    </div>
  );
}

export default App;
