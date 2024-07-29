import HomePage from './components/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/Dashboard';
import VehiculesList from './components/VehiculesList';
import VehiculesEdit from './components/VehiculesEdit';
import VehiculesAdd from './components/VehiculesAdd';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/vehicules" element={<VehiculesList />} />
          <Route path="/edit-vehicules/:id" element={<VehiculesEdit />} />
          <Route path="/add-vehicules" element={<VehiculesAdd />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;