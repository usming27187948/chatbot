import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

const ReunionsByProductChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });

  useEffect(() => {
    axios
      .get('/reunions/by-product')
      .then((res) => {
        setData({
          labels: res.data.map(p => p.Producto),
          counts: res.data.map(p => p.total)
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Reuniones por Producto',
        data: data.counts,
        backgroundColor: 'rgba(153,102,255,0.6)',
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
        <Bar data={chartData} options={options} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default ReunionsByProductChart;
