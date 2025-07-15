import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

const RecentInteractionsPanel = () => {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    axios
      .get('/interactions/recent')
      .then((res) => setInteractions(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card">
      <h3>Últimas Interacciones</h3>
      {interactions.length === 0 ? (
        <p>No hay interacciones recientes.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {interactions.map((item, index) => (
            <li key={index} style={{
              marginBottom: '0.5rem',
              borderBottom: '1px solid #ddd',
              paddingBottom: '0.5rem'
            }}>
              <strong>{item.Cliente}</strong> consultó <em>{item.Producto}</em><br/>
              <small>{new Date(item.Fecha_Interaccion).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentInteractionsPanel;
