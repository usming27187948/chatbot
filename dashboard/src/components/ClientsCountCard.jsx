import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

const ClientsCountCard = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios
      .get('/clients/count')
      .then((res) => setTotal(res.data.total))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card">
      <div className="cardTitle">Total de interacciones</div>
      <div className="cardValue">{total}</div>
    </div>
  );
};

export default ClientsCountCard;
