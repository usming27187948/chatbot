import { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

const ReunionsCountCard = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios
      .get('/reunions/count')
      .then((res) => setTotal(res.data.total))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card">
      <div className="cardTitle">Total de Reuniones</div>
      <div className="cardValue">{total}</div>
    </div>
  );
};

export default ReunionsCountCard;
