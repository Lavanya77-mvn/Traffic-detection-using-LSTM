import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrafficData } from '../lib/supabase';

interface TrafficTrendsChartProps {
  data: TrafficData[];
}

export default function TrafficTrendsChart({ data }: TrafficTrendsChartProps) {
  const chartData = data.map((item) => ({
    time: `${item.day_of_week.slice(0, 3)} ${item.hour}:00`,
    vehicles: item.vehicle_count,
    density: item.traffic_density === 'High' ? 3 : item.traffic_density === 'Medium' ? 2 : 1,
    pedestrians: item.pedestrian_density,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Traffic Trends Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="time" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="vehicles"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Vehicle Count"
            dot={{ fill: '#3b82f6', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pedestrians"
            stroke="#10b981"
            strokeWidth={2}
            name="Pedestrians"
            dot={{ fill: '#10b981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
