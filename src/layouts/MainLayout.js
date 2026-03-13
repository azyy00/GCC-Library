import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MainLayout() {
  return (
    <div className="app d-flex flex-column min-vh-100">
      <Navbar />
      <main className="main-content flex-grow-1">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <div className="container">
          <p className="mb-0">
            © {new Date().getFullYear()} Goa Community Library Management System. 
            Developed by <strong>Anthony B. Azuela</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
