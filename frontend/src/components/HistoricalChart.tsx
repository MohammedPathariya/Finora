import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  close_price: number;
}

interface HistoricalChartProps {
  data: ChartDataPoint[];
}

export function HistoricalChart({ data }: HistoricalChartProps) {
  if (!data || data.length === 0) {
    return <div>No historical data available.</div>;
  }

  // Format the data for the chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    price: item.close_price,
  }));

  return (
    <div style={{ width: '100%', height: 200, marginTop: '1rem' }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} />
          <Tooltip 
            contentStyle={{
              borderRadius: '0.5rem',
              border: '1px solid #e0e0e0',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US')}
          />
          <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}