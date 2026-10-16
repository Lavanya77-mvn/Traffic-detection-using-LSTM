import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ModelPerformance } from '../lib/supabase';

interface ModelComparisonChartProps {
  models: ModelPerformance[];
}

export default function ModelComparisonChart({ models }: ModelComparisonChartProps) {
  const chartData = models.map((model) => ({
    name: model.model_name,
    Accuracy: (model.accuracy * 100).toFixed(1),
    'F1 Score': (model.f1_score * 100).toFixed(1),
    RMSE: model.rmse.toFixed(1),
    MAE: model.mae.toFixed(1),
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Model Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Accuracy" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="F1 Score" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {models.map((model) => (
          <div key={model.id} className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">{model.model_name}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Accuracy:</span>
                <span className="ml-1 font-semibold text-blue-600">
                  {(model.accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">F1:</span>
                <span className="ml-1 font-semibold text-green-600">
                  {(model.f1_score * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">RMSE:</span>
                <span className="ml-1 font-semibold text-orange-600">{model.rmse.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-gray-500">MAE:</span>
                <span className="ml-1 font-semibold text-red-600">{model.mae.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
