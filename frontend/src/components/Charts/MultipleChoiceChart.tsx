import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MultipleChoiceStats } from '../../services/api';
import './MultipleChoiceChart.css';

interface MultipleChoiceChartProps {
  stats: MultipleChoiceStats[];
  questionText: string;
}

const COLORS = ['#FF6B35', '#FF8C42', '#FFA07A', '#FFB84D', '#1a1a1a', '#333333', '#666666', '#999999'];

export default function MultipleChoiceChart({ stats, questionText }: MultipleChoiceChartProps) {
  if (stats.length === 0) {
    return (
      <div className="chart-container">
        <h3>{questionText}</h3>
        <p className="no-data">No answers yet</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>{questionText}</h3>
      <div className="charts-wrapper">
        <div className="chart-item">
          <h4>Bar Chart</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="option" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-item">
          <h4>Pie Chart</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ option, percentage }) => `${option}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="stats-table">
        <h4>Ranking</h4>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Option</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={stat.option}>
                <td>{index + 1}</td>
                <td>{stat.option}</td>
                <td>{stat.count}</td>
                <td>{stat.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

