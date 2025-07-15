import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';


const RecentReunionsPanel = () => {
  const [reunions, setReunions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/reunions/recent')
      .then((res) => setReunions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h3>📋 Últimas Reuniones Agendadas</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : reunions.length === 0 ? (
        <p>No hay reuniones recientes.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reunions.map((r, index) => (
            <li key={index} style={{
              marginBottom: '0.75rem',
              borderBottom: '1px solid #eee',
              paddingBottom: '0.5rem'
            }}>
              <strong>{r.Cliente}</strong> agendó <em>{r.Producto}</em><br />
              <small>{new Date(r.Fecha_Creacion).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentReunionsPanel;
