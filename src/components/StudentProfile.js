import React from 'react';

function StudentProfile({ studentData, onClose }) {
  if (!studentData) return null;

  const { student, activities, total_visits } = studentData;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <div className="student-profile-overlay">
      <div className="student-profile-modal">
        <div className="modal-header">
          <h4 className="mb-0">Student Profile</h4>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        
        <div className="modal-body">
          {/* Student Information */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
                  <h5 className="mb-0">Student Information</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Student ID:</strong> {student.student_id}</p>
                      <p><strong>Name:</strong> {student.first_name} {student.middle_name} {student.last_name}</p>
                      <p><strong>Course:</strong> {student.course}</p>
                      <p><strong>Year & Section:</strong> {student.year_level}-{student.section}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Gender:</strong> {student.gender}</p>
                      <p><strong>Email:</strong> {student.email || 'N/A'}</p>
                      <p><strong>Address:</strong> {student.address || 'N/A'}</p>
                      <p><strong>Total Visits:</strong> <span className="badge bg-success">{total_visits}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              {/* Profile Picture */}
              <div className="card mb-3">
                <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
                  <h6 className="mb-0">Profile Picture</h6>
                </div>
                <div className="card-body text-center">
                  {student.profile_image ? (
                    <img 
                      src={student.profile_image.startsWith('http') ? student.profile_image : `http://localhost:3001${student.profile_image}`} 
                      alt={`${student.first_name} ${student.last_name}`}
                      className="img-fluid rounded-circle mb-2"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-2"
                      style={{ width: '120px', height: '120px', margin: '0 auto' }}
                    >
                      <i className="bi bi-person-fill text-white" style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  <div style={{ display: student.profile_image ? 'none' : 'block' }}>
                    <div 
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-2"
                      style={{ width: '120px', height: '120px', margin: '0 auto' }}
                    >
                      <i className="bi bi-person-fill text-white" style={{ fontSize: '3rem' }}></i>
                    </div>
                  </div>
                  <p className="mb-0 text-muted">
                    <small>{student.first_name} {student.last_name}</small>
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
                  <h6 className="mb-0">Quick Stats</h6>
                </div>
                <div className="card-body text-center">
                  <h3 className="text-primary">{total_visits}</h3>
                  <p className="mb-0">Total Visits</p>
                  <hr />
                  <p className="mb-0">
                    <small className="text-muted">
                      Last visit: {activities.length > 0 ? formatTime(activities[0].check_in) : 'Never'}
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activities History */}
          <div className="card">
            <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
              <h5 className="mb-0">Recent Activities</h5>
            </div>
            <div className="card-body">
              {activities.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No activities recorded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity, index) => (
                        <tr key={activity.id}>
                          <td>{formatTime(activity.check_in)}</td>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#800000' }}>{activity.purpose}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              activity.check_out ? 'bg-success' : 'bg-warning'
                            }`}>
                              {activity.status}
                            </span>
                          </td>
                          <td>
                            {activity.duration_minutes ? formatDuration(activity.duration_minutes) : 'Ongoing'}
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
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
