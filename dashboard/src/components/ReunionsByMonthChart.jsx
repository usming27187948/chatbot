import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';
import DatePicker from 'react-datepicker';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ReunionsByMonthChart = () => {
  const [data, setData] = useState({ labels: [], counts: [] });
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1)); // 1 Jan current year
  const [endDate, setEndDate] = useState(new Date());

  const fetchData = () => {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    if (end < start) {
      alert('La fecha final no puede ser menor que la fecha inicial.');
      return;
    }

    setLoading(true);

    axios
      .get(`/reunions/by-month?startDate=${start}&endDate=${end}`)
      .then((res) => {
        setData({
          labels: res.data.map((r) => r.mes),
          counts: res.data.map((r) => r.total),
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
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
    <div style={{ width: '600px', margin: '2rem 0' }}>
      <h3>Reuniones por Mes</h3>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <label>Desde: </label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="yyyy-MM-dd" />
        </div>
        <div>
          <label>Hasta: </label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="yyyy-MM-dd" />
        </div>
        <button onClick={fetchData}>Actualizar</button>
      </div>

      <div style={{ height: '400px' }}>
        {loading ? (
          <p>Cargando datos...</p>
        ) : data.labels.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p>No hay datos en el rango seleccionado.</p>
        )}
      </div>
    </div>
  );
};

export default ReunionsByMonthChart;
