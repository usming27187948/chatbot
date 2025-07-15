import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

const UniquePhonesCard = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios
      .get('/clients/unique-phones')
      .then((res) => setTotal(res.data.total))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card">
      <div className="cardTitle">Clientes Totales</div>
      <div className="cardValue">{total}</div>
    </div>
  );
};

export default UniquePhonesCard;
