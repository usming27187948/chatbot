import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ClientsByMonthChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/stats/clients/by-month')
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
        label: 'Interacciones por Mes',
        data: data.counts,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
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

export default ClientsByMonthChart;
