import { AlertCircle, Clock, Shield } from 'lucide-react';

interface PredictionResultProps {
  density: string;
  delay: number;
  safetyScore: number;
  confidence?: number;
}

export default function PredictionResult({ density, delay, safetyScore, confidence }: PredictionResultProps) {
  const getDensityColor = (density: string) => {
    switch (density) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Prediction Results</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Traffic Density</span>
          </div>
          <div className={`inline-block px-4 py-2 rounded-lg font-bold text-2xl border-2 ${getDensityColor(density)}`}>
            {density}
          </div>
          {confidence && (
            <div className="mt-2 text-xs text-blue-700">
              Confidence: {confidence.toFixed(1)}%
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-900">Estimated Delay</span>
          </div>
          <div className="text-3xl font-bold text-orange-700">
            {delay} <span className="text-lg">min</span>
          </div>
          <div className="mt-2 text-xs text-orange-700">
            Average travel time increase
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-900">Safety Score</span>
          </div>
          <div className={`text-3xl font-bold ${getSafetyColor(safetyScore)}`}>
            {safetyScore.toFixed(1)} <span className="text-lg">/100</span>
          </div>
          <div className="mt-2 text-xs text-green-700">
            Pedestrian safety index
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {density === 'High' && (
            <>
              <li>• Consider alternative routes or public transportation</li>
              <li>• Allow extra time for your journey</li>
            </>
          )}
          {density === 'Medium' && (
            <>
              <li>• Moderate traffic expected</li>
              <li>• Plan for potential delays</li>
            </>
          )}
          {density === 'Low' && (
            <>
              <li>• Good time to travel</li>
              <li>• Minimal delays expected</li>
            </>
          )}
          {safetyScore < 60 && <li>• Exercise caution - lower safety conditions</li>}
        </ul>
      </div>
    </div>
  );
}
