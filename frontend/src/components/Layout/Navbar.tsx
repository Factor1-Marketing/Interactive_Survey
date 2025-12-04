import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/admin" className="navbar-brand">
          <img src="/Factor1_Logo_201910.jpg" alt="Factor1" className="navbar-logo" />
          <span>Questionnaire App</span>
        </Link>
        <div className="navbar-links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/create">Create Questionnaire</Link>
        </div>
      </div>
    </nav>
  );
}

