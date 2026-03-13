import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#800000' }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src="/GCC-LOGO.png" 
            alt="GCC Logo" 
            height="50" 
            className="me-3"
            style={{ borderRadius: '50%' }}
          />
          <div className="d-flex flex-column justify-content-center">
            <div className="fw-bold mb-0">Goa Community Library</div>
          </div>
        </Link>
        <div className="navbar-nav ms-auto">
          <Link className="nav-link" to="/">
            Dashboard
          </Link>
          <Link className="nav-link" to="/register">
            Register
          </Link>
          <Link className="nav-link" to="/attendance">
            Attendance
          </Link>
          <Link className="nav-link" to="/active">
            Active Visitors
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
