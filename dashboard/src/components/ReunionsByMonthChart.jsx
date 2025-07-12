import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ReunionsByMonthChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/stats/reunions/by-month')
      .then((res) => {
        setData({
          labels: res.data.map((r) => r.mes),
          counts: res.data.map((r) => r.total),
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Reuniones por Mes',
        data: data.counts,
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        tension: 0.2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: '600px', height: '400px' }}>
      {data.labels.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default ReunionsByMonthChart;
