import { useEffect, useState } from 'react'
import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from 'react-router-dom'

import ReportIncident from './pages/ReportIncident'
import Incidents from './pages/Incidents'
import IncidentDetails from './pages/IncidentDetails'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <BrowserRouter>

      {!isOnline && (
        <div className="offline-banner">
          You are offline. New incident reports will be saved
          locally and can be synced when connection returns.
        </div>
      )}

      <nav className="navbar">

        <div className="navbar-brand">
          DisasterNet
        </div>

        <div className="navbar-links">

          <Link to="/">
            Report Incident
          </Link>

          <Link to="/incidents">
            Incidents
          </Link>

        </div>

      </nav>

      <Routes>

        <Route
          path="/"
          element={<ReportIncident />}
        />

        <Route
          path="/incidents"
          element={<Incidents />}
        />

        <Route
          path="/incidents/:id"
          element={<IncidentDetails />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App