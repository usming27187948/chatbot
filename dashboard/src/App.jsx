import TopProductsChart from './components/TopProductsChart'; //consultas por productos LISTO
import ReunionsByProductChart from './components/ReunionsByProductChart';//sin uso
import ClientsCountCard from './components/ClientsCountCard'; //contador LISTO
import ClientsByMonthChart from './components/ClientsByMonthChart'; //grafica LISTO
import ReunionsByMonthChart from './components/ReunionsByMonthChart'; //grafica LISTO
import RecentInteractionsPanel from './components/RecentInteractionsPanel'; //panel LISTO
import ReunionsCountCard from './components/ReunionsCountCard'; //contador LISTO
import UniquePhonesCard from './components/UniquePhonesCard'; //contador LISTO


function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard InspectBOT</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <ClientsCountCard />
        <ReunionsCountCard />
        <UniquePhonesCard />
      </div>
      
      <TopProductsChart />

      <div style={{ marginTop: '2rem' }}>
        <ReunionsByMonthChart />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <ClientsByMonthChart />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <RecentInteractionsPanel />
      </div>


    </div>
  );
}

export default App;
