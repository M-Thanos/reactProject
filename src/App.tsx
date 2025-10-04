import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './css/tailwind.css';  
import './css/style.css';   

import Loader from './common/Loader';
import ButtonDashboard from './pages/ButtonControl/ButtonDashboard' ;
import ButtonArea from './pages/ButtonControl/ButtonPage/ButtonArea';
import ClientButtonArea from './pages/ButtonControl/ClientPage/ClientButtonArea';
import MarketersListPage from './pages/MarketersListPage';

import DefaultLayout from './layout/DefaultLayout';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<ButtonDashboard />}>
          <Route index element={<ButtonArea />} />
        </Route>
        <Route 
          path="/client" 
          element={<ClientButtonArea showControls={true} />} 
        />
        <Route 
          path="/marketers-list" 
          element={<MarketersListPage />} 
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
