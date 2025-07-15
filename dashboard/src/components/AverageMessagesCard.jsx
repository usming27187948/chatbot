import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

const AverageMessagesCard = () => {
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/messages/average')
      .then((res) => setAverage(res.data.promedio))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="cardTitle">Promedio de Mensajes</div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="cardValue">{average}</div>
      )}
    </div>
  );
};

export default AverageMessagesCard;
