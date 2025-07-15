import { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
//import axios from 'axios';
import axios from '../axiosInstance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopProductsChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });
  const chartRef = useRef();

  useEffect(() => {
    axios
      .get('/interactions/by-product')
      .then((res) => {
        setData({
          labels: res.data.map((p) => p.Nombre),
          counts: res.data.map((p) => p.total),
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Consultas por Producto',
        data: data.counts,
        backgroundColor: 'rgba(75,192,192,0.6)',
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
        <Bar ref={chartRef} data={chartData} options={options} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default TopProductsChart;
