import React, { useEffect, useState } from 'react';
import Auth from './pages/Auth';
import MarshalRegistration from './pages/MarshalRegistration';
import WorkerDashboard from './pages/WorkerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CreateRace from './pages/CreateRace';
import MarshalProfile from './pages/MarshalProfile';
import MarshalsView from './pages/MarshalsView';
import RaceManagement from './pages/RaceManagement';
import MarshalRatings from './pages/MarshalRatings';
import StatsDetail from './pages/StatsDetail';
import MarshalsManagement from './components/MarshalsManagement';
import ApplicationsManagement from './components/ApplicationsManagement';
import Notifications from './components/Notifications';
import RacesManagement from './pages/RacesManagement';
import SimpleMarshalTest from './components/SimpleMarshalTest';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const [statsType, setStatsType] = useState(null);

  useEffect(() => {
    // فحص وجود token في localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // تحديد الصفحة حسب نوع المستخدم
      if (parsedUser.userType === 'manager') {
        setCurrentPage('manager-dashboard');
      } else if (parsedUser.userType === 'worker') {
        setCurrentPage('worker-dashboard');
      }
    } else {
      setCurrentPage('auth');
    }
  }, []);

  const handlePageChange = (page, userData = null) => {
    setCurrentPage(page);
    if (userData) {
      if (page === 'stats-detail') {
        setStatsType(userData);
      } else {
        setUser(userData);
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'marshal-registration':
        return <MarshalRegistration onPageChange={handlePageChange} />;
      case 'manager-dashboard':
        return <ManagerDashboard onPageChange={handlePageChange} />;
      case 'worker-dashboard':
        return <WorkerDashboard onPageChange={handlePageChange} />;
      case 'create-race':
        return <CreateRace onPageChange={handlePageChange} />;
      case 'marshal-profile':
        return <MarshalProfile onPageChange={handlePageChange} />;
      case 'marshals-view':
        return <MarshalsView onPageChange={handlePageChange} />;
      case 'marshal-management':
        return <MarshalsManagement onPageChange={handlePageChange} />;
      case 'applications-management':
        return <ApplicationsManagement onPageChange={handlePageChange} />;
      case 'notifications':
        return <Notifications onPageChange={handlePageChange} />;
      case 'race-management':
        return <RaceManagement onPageChange={handlePageChange} />;
      case 'races-management':
        return <RacesManagement onPageChange={handlePageChange} />;
      case 'marshal-ratings':
        return <MarshalRatings onPageChange={handlePageChange} />;
      case 'stats-detail':
        return <StatsDetail onPageChange={handlePageChange} statsType={statsType} />;
      case 'test-marshal':
        return <SimpleMarshalTest onPageChange={handlePageChange} />;
      default:
        return <Auth onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
