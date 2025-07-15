import { Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductsByParentCategoryChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/interactions/by-product-category')
      .then((res) => {
        setData({
          labels: res.data.map((r) => r.Categoria || 'Sin Categoría'),
          counts: res.data.map((r) => r.total)
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Cantidad de Productos',
        data: data.counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: '500px', margin: '2rem auto' }}>
      <h3>Productos por Categoría Madre</h3>
      {loading ? (
        <p>Cargando datos...</p>
      ) : data.labels.length > 0 ? (
        <Pie data={chartData} />
      ) : (
        <p>No hay datos disponibles.</p>
      )}
    </div>
  );
};

export default ProductsByParentCategoryChart;
