import { useEffect, useState } from 'react';
import axios from 'axios';

const ClientsCountCard = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/stats/clients/count')
      .then((res) => setTotal(res.data.total))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '1rem',
      width: '200px',
      textAlign: 'center',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h4>Total de Interacciones</h4>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{total}</p>
    </div>
  );
};

export default ClientsCountCard;
