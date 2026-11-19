import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Bist from './pages/Bist';
import Banks from './pages/Banks';
import Crypto from './pages/Crypto';
import Forex from './pages/Forex';
import Metals from './pages/Metals';
import Economic from './pages/Economic';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import Analysis from './pages/Analysis';
import Detail from './pages/Detail';
import Alerts from './pages/Alerts';
import Watchlist from './pages/Watchlist';
import Compare from './pages/Compare';
import Heatmap from './pages/Heatmap';
import Calendar from './pages/Calendar';
import Tefas from './pages/Tefas';
import Tools from './pages/Tools';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/borsa" element={<Stocks />} />
        <Route path="/bist" element={<Bist />} />
        <Route path="/bankalar" element={<Banks />} />
        <Route path="/kripto" element={<Crypto />} />
        <Route path="/doviz" element={<Forex />} />
        <Route path="/metaller" element={<Metals />} />
        <Route path="/ekonomi" element={<Economic />} />
        <Route path="/portfoy" element={<Portfolio />} />
        <Route path="/haberler" element={<News />} />
        <Route path="/analiz" element={<Analysis />} />
        <Route path="/alarmlar" element={<Alerts />} />
        <Route path="/izleme" element={<Watchlist />} />
        <Route path="/karsilastir" element={<Compare />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/takvim" element={<Calendar />} />
        <Route path="/tefas" element={<Tefas />} />
        <Route path="/araclar" element={<Tools />} />
        <Route path="/detay/:type/:id" element={<Detail />} />
      </Routes>
    </Layout>
  );
}
