import TopProductsChart from './components/TopProductsChart'; //consultas por productos LISTO
import ReunionsByProductChart from './components/ReunionsByProductChart';//sin uso
import ClientsCountCard from './components/ClientsCountCard'; //contador LISTO
import ClientsByMonthChart from './components/ClientsByMonthChart'; //grafica LISTO
import ReunionsByMonthChart from './components/ReunionsByMonthChart'; //grafica LISTO
import RecentInteractionsPanel from './components/RecentInteractionsPanel'; //panel LISTO
import ReunionsCountCard from './components/ReunionsCountCard'; //contador LISTO
import UniquePhonesCard from './components/UniquePhonesCard'; //contador LISTO
import RecentReunionsPanel from './components/RecentReunionsPanel';
import AverageMessagesCard from './components/AverageMessagesCard';
import ProductsByParentCategoryChart from './components/ProductsByParentCategoryChart';
import InteractionsByParentCategoryChart from './components/InteractionsByParentCategoryChart';

import { useState, useEffect } from 'react';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  if (!token) {
    return <Login onLogin={(newToken) => setToken(newToken)} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard InspectBOT</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>

      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <ClientsCountCard />
        <ReunionsCountCard />
        <UniquePhonesCard />
        <AverageMessagesCard />
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <InteractionsByParentCategoryChart />
        </div>
        <div className="card">
          <TopProductsChart />
        </div>
        
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <ReunionsByMonthChart />
        </div>
        <div className="card">
          <ClientsByMonthChart />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <RecentInteractionsPanel />
        </div>
        <div className="card">
          <RecentReunionsPanel />
        </div>
      </div>

    </div>
  );
}

export default App;
