import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActiveVisitors() {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchActiveVisitors();
  }, []);

  const fetchActiveVisitors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/attendance/active');
      setActiveVisitors(response.data);
    } catch (error) {
      console.error('Error fetching active visitors:', error);
      setMessage('Error fetching active visitors');
    }
  };

  const handleCheckout = async (id) => {
    try {
      await axios.post(`http://localhost:3001/api/attendance/checkout/${id}`);
      setMessage('Check-out successful!');
      fetchActiveVisitors(); // Refresh the list
    } catch (error) {
      console.error('Check-out error:', error);
      setMessage('Error during check-out');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Active Visitors</h4>
            <button 
              className="btn btn-light btn-sm" 
              onClick={fetchActiveVisitors}
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mb-3`}>
              {message}
            </div>
          )}

          {activeVisitors.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No active visitors at the moment.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Course & Year</th>
                    <th>Purpose</th>
                    <th>Check-in Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td>{visitor.student_id}</td>
                      <td>{visitor.first_name} {visitor.last_name}</td>
                      <td>{visitor.course} - {visitor.year_level}{visitor.section}</td>
                      <td>{visitor.purpose}</td>
                      <td>{formatTime(visitor.check_in)}</td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCheckout(visitor.id)}
                        >
                          Check Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActiveVisitors;
