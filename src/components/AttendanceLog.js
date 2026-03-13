import React, { useState } from 'react';
import axios from 'axios';

function AttendanceLog() {
  const [studentId, setStudentId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState('');

  const purposes = [
    "Study",
    "Research",
    "Borrow Books",
    "Used Computer",
    "Library Card Application"
  ];

  const searchStudent = async () => {
    try {
      console.log('Searching for student:', studentId);
      const response = await axios.get(`http://localhost:3001/api/students/search?q=${studentId}`);
      console.log('Search response:', response.data);
      
      if (response.data.length > 0) {
        setStudent(response.data[0]);
        setMessage('');
      } else {
        setStudent(null);
        setMessage('Student not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Error searching student');
    }
  };

  const handleCheckIn = async () => {
    if (!student || !purpose) {
      setMessage('Please select a student and purpose');
      return;
    }

    try {
      console.log('Checking in student:', { student_id: student.student_id, purpose });
      const response = await axios.post('http://localhost:3001/api/attendance/checkin', {
        student_id: student.student_id,
        purpose: purpose
      });
      console.log('Check-in response:', response.data);
      
      setMessage('Check-in successful!');
      // Reset form
      setStudentId('');
      setPurpose('');
      setStudent(null);
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage(error.response?.data?.error || 'Error during check-in');
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
          <h4 className="mb-0">Student Check-In</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Student ID</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter Student ID"
                  />
                  <button className="btn btn-secondary" onClick={searchStudent}>
                    Search
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Purpose</label>
                <select 
                  className="form-select"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="">Select Purpose</option>
                  {purposes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <button 
                className="btn text-white"
                style={{ backgroundColor: '#800000' }}
                onClick={handleCheckIn}
                disabled={!student || !purpose}
              >
                Check In
              </button>
            </div>
            <div className="col-md-6">
              {student && (
                <div className="card">
                  <div className="card-body">
                    <h5>Student Information</h5>
                    <p><strong>Name:</strong> {student.first_name} {student.last_name}</p>
                    <p><strong>Course:</strong> {student.course}</p>
                    <p><strong>Year & Section:</strong> {student.year_level}-{student.section}</p>
                  </div>
                </div>
              )}
              {message && (
                <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mt-3`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceLog;
