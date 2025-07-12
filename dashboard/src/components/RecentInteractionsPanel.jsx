import { useEffect, useState } from 'react';
import axios from 'axios';

const RecentInteractionsPanel = () => {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/stats/interactions/recent')
      .then((res) => setInteractions(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '1rem',
      borderRadius: '8px',
      width: '600px',
      background: '#f9f9f9'
    }}>
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
