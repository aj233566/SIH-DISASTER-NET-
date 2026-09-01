import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Bootstrap Grid ONLY for responsive row/col grid layouts
import 'bootstrap/dist/css/bootstrap-grid.min.css';

// Midnight Operations Custom Styling
import './styles/global.css';
import './styles/sidebar.css';
import './styles/topbar.css';
import './styles/alerts.css';
import './styles/notifications.css';
import './styles/emergency.css';
import './styles/map.css';

// Providers
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { RoleProvider } from './context/RoleContext';
import { AlertProvider } from './context/AlertContext';

// Common Components
import Sidebar from './components/common/Sidebar';
import TopBar from './components/common/TopBar';

// Pages
import OverviewPage from './pages/OverviewPage';
import AlertsPage from './pages/AlertsPage';
import EmergencyResponsePage from './pages/EmergencyResponsePage';
import NotificationsPage from './pages/NotificationsPage';
import ResourcesPage from './pages/ResourcesPage';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/alerts':
        return {
          title: t('navigation.alerts'),
          eyebrow: 'EARLY WARNING & GEOTECHNICAL RISK'
        };
      case '/emergency':
        return {
          title: t('navigation.emergency'),
          eyebrow: 'AUTOMATED RESPONSE MATRIX'
        };
      case '/notifications':
        return {
          title: t('navigation.notifications'),
          eyebrow: 'MULTI-CHANNEL BROADCAST HUB'
        };
      case '/resources':
        return {
          title: t('navigation.resources'),
          eyebrow: 'RELIEF LOGISTICS & INFRASTRUCTURE'
        };
      case '/':
      default:
        return {
          title: t('navigation.overview'),
          eyebrow: 'EMERGENCY OPERATIONS COMMAND CENTER'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          pageTitle={pageInfo.title}
          pageEyebrow={pageInfo.eyebrow}
        />

        <main className="page-body">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/emergency" element={<EmergencyResponsePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="*" element={<OverviewPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <RoleProvider>
        <AlertProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </AlertProvider>
      </RoleProvider>
    </LanguageProvider>
  );
}

export default App;
