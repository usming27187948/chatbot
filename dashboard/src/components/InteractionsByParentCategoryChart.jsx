import { useEffect, useState } from 'react';
import axios from '../axiosInstance';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const InteractionsByParentCategoryChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/interactions/by-parent-category')
      .then((res) => {
        setData({
          labels: res.data.map((r) => r.Categoria_Madre || 'Sin Categoría'),
          counts: res.data.map((r) => r.total),
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Consultas por Categoría Madre',
        data: data.counts,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899'
        ],
      },
    ],
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 w-full md:w-[600px] mt-6">
      <h3 className="text-lg font-semibold mb-4">Consultas por Categoría Madre</h3>
      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : data.labels.length > 0 ? (
        <Pie data={chartData} />
      ) : (
        <p className="text-gray-500">No hay datos disponibles.</p>
      )}
    </div>
  );
};

export default InteractionsByParentCategoryChart;
