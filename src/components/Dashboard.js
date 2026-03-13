import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentProfile from './StudentProfile';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    activeVisitors: 0,
    visitsByPurpose: [],
    dailyVisits: [],
    courseDistribution: [],
    monthlyTrends: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [, setImportFile] = useState(null);
  const [importMessage, setImportMessage] = useState('');

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchMessage('Please enter a student ID');
      return;
    }

    try {
      setSearchMessage('Searching...');
      const response = await axios.get(`http://localhost:3001/api/students/profile/${searchTerm}`);
      setStudentProfile(response.data);
      setSearchMessage('');
    } catch (error) {
      console.error('Search error:', error);
      setSearchMessage(error.response?.data?.error || 'Student not found');
      setStudentProfile(null);
    }
  };

  const closeProfile = () => {
    setStudentProfile(null);
    setSearchTerm('');
    setSearchMessage('');
  };

  // Import students from Excel file
  const handleImportStudents = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportMessage('Processing file...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process and send data to backend
      const students = jsonData.map(row => ({
        student_id: row['Student ID'] || row['student_id'],
        first_name: row['First Name'] || row['first_name'],
        last_name: row['Last Name'] || row['last_name'],
        middle_name: row['Middle Name'] || row['middle_name'] || '',
        address: row['Address'] || row['address'] || '',
        email: row['Email'] || row['email'] || '',
        gender: row['Gender'] || row['gender'],
        course: row['Course'] || row['course'],
        year_level: row['Year Level'] || row['year_level'],
        section: row['Section'] || row['section']
      }));

      // Send to backend
      for (const student of students) {
        await axios.post('http://localhost:3001/api/students', student);
      }

      setImportMessage(`Successfully imported ${students.length} students!`);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Import error:', error);
      setImportMessage('Error importing students. Please check file format.');
    }
  };

  // Export student activities report
  const exportStudentActivities = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/attendance/export');
      const data = response.data;

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Student activities sheet
      const ws1 = XLSX.utils.json_to_sheet(data.activities);
      XLSX.utils.book_append_sheet(wb, ws1, 'Student Activities');

      // Statistics sheet
      const statsData = [
        { Metric: 'Total Visits', Value: data.totalVisits },
        { Metric: 'Active Visitors', Value: data.activeVisitors },
        { Metric: 'Export Date', Value: new Date().toLocaleString() }
      ];
      const ws2 = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Statistics');

      // Generate and download file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `student-activities-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    }
  };

  // Export charts as images
  const exportCharts = () => {
    const canvas = document.querySelector('#visitsChart');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `library-charts-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Download student import template
  const downloadTemplate = () => {
    // Create sample data for the template
    const templateData = [
      {
        'Student ID': '2023001',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Middle Name': 'Smith',
        'Address': '123 Main St, City',
        'Email': 'john.doe@email.com',
        'Gender': 'Male',
        'Course': 'BPED',
        'Year Level': 1,
        'Section': 'A'
      },
      {
        'Student ID': '2023002',
        'First Name': 'Jane',
        'Last Name': 'Smith',
        'Middle Name': 'Marie',
        'Address': '456 Park Ave, City',
        'Email': 'jane.smith@email.com',
        'Gender': 'Female',
        'Course': 'BECED',
        'Year Level': 2,
        'Section': 'B'
      },
      {
        'Student ID': '2023003',
        'First Name': 'Mike',
        'Last Name': 'Johnson',
        'Middle Name': '',
        'Address': '789 Oak St, City',
        'Email': 'mike.johnson@email.com',
        'Gender': 'Male',
        'Course': 'BCAED',
        'Year Level': 1,
        'Section': 'C'
      }
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // Student ID
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 15 }, // Middle Name
      { wch: 25 }, // Address
      { wch: 25 }, // Email
      { wch: 10 }, // Gender
      { wch: 10 }, // Course
      { wch: 12 }, // Year Level
      { wch: 10 }  // Section
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Student Template');

    // Generate and download the file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `student-import-template-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Prepare chart data
  const getChartData = () => {
    const purposeData = stats.visitsByPurpose || [];
    const courseData = stats.courseDistribution || [];
    const dailyData = stats.dailyVisits || [];

    return {
      purposeChart: {
        labels: purposeData.map(item => item.purpose),
        datasets: [{
          label: 'Visits',
          data: purposeData.map(item => item.count),
          backgroundColor: [
            '#800000',
            '#A0522D',
            '#CD853F',
            '#D2691E',
            '#B22222'
          ],
          borderColor: '#800000',
          borderWidth: 1
        }]
      },
      courseChart: {
        labels: courseData.map(item => item.course),
        datasets: [{
          label: 'Students',
          data: courseData.map(item => item.count),
          backgroundColor: [
            '#800000',
            '#A0522D',
            '#CD853F'
          ],
          borderColor: '#800000',
          borderWidth: 1
        }]
      },
      dailyChart: {
        labels: dailyData.map(item => item.date),
        datasets: [{
          label: 'Daily Visits',
          data: dailyData.map(item => item.visits),
          borderColor: '#800000',
          backgroundColor: 'rgba(128, 0, 0, 0.1)',
          tension: 0.1
        }]
      }
    };
  };

  const chartData = getChartData();

  return (
    <div className="container mt-4">
      {/* Header with Search and Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Analytical Dashboard</h2>
        
        <div className="d-flex align-items-center gap-3">
          {/* Import Students */}
          <div className="d-flex align-items-center gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportStudents}
              className="form-control"
              style={{ width: '200px' }}
              id="importFile"
            />
            <label htmlFor="importFile" className="btn btn-outline-success btn-sm">
              <i className="bi bi-upload"></i> Import
            </label>
            <button 
              className="btn btn-outline-info btn-sm"
              onClick={downloadTemplate}
              title="Download Excel template for student import"
            >
              <i className="bi bi-download"></i> Template
            </button>
          </div>

          {/* Export Reports */}
          <div className="btn-group">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={exportStudentActivities}
            >
              <i className="bi bi-download"></i> Export Report
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={exportCharts}
            >
              <i className="bi bi-image"></i> Export Charts
            </button>
          </div>

          {/* Student Search */}
          <div className="input-group" style={{ width: '300px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="btn btn-outline-danger" 
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
              style={{ borderColor: '#800000', color: '#800000' }}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {searchMessage && (
        <div className={`alert ${searchMessage.includes('not found') || searchMessage.includes('Error') ? 'alert-danger' : 'alert-info'} mb-3`}>
          {searchMessage}
        </div>
      )}

      {importMessage && (
        <div className={`alert ${importMessage.includes('Error') ? 'alert-danger' : 'alert-success'} mb-3`}>
          {importMessage}
        </div>
      )}

      {/* Import Instructions */}
      <div className="alert alert-info mb-4">
        <h6 className="mb-2"><i className="bi bi-info-circle"></i> Student Import Instructions:</h6>
        <div className="row">
          <div className="col-md-8">
            <ol className="mb-0">
              <li>Click <strong>"Template"</strong> to download the Excel template</li>
              <li>Fill in the template with your student data (keep the column headers exactly as they are)</li>
              <li>Save the file as .xlsx or .xls format</li>
              <li>Click <strong>"Choose File"</strong> and select your filled template</li>
              <li>Click <strong>"Import"</strong> to upload students to the system</li>
            </ol>
          </div>
          <div className="col-md-4">
            <div className="text-muted">
              <small>
                <strong>Required fields:</strong> Student ID, First Name, Last Name, Gender, Course, Year Level, Section<br/>
                <strong>Course options:</strong> BPED, BECED, BCAED<br/>
                <strong>Gender options:</strong> Male, Female, Other
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-white" style={{ backgroundColor: '#800000' }}>
            <div className="card-body text-center">
              <h3 className="mb-0">{stats.totalVisits}</h3>
              <p className="mb-0">Total Visits</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white" style={{ backgroundColor: '#A0522D' }}>
            <div className="card-body text-center">
              <h3 className="mb-0">{stats.activeVisitors}</h3>
              <p className="mb-0">Active Visitors</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white" style={{ backgroundColor: '#CD853F' }}>
            <div className="card-body text-center">
              <h3 className="mb-0">{stats.courseDistribution?.length || 0}</h3>
              <p className="mb-0">Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white" style={{ backgroundColor: '#D2691E' }}>
            <div className="card-body text-center">
              <h3 className="mb-0">{new Date().toLocaleDateString()}</h3>
              <p className="mb-0">Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row mb-4">
        {/* Visits by Purpose Chart */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
              <h5 className="mb-0">Visits by Purpose</h5>
            </div>
            <div className="card-body">
              <Bar 
                data={chartData.purposeChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Course Distribution Chart */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
              <h5 className="mb-0">Course Distribution</h5>
            </div>
            <div className="card-body">
              <Doughnut 
                data={chartData.courseChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Visits Trend Chart */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
              <h5 className="mb-0">Daily Visits Trend</h5>
            </div>
            <div className="card-body">
              <Line 
                data={chartData.dailyChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      {stats.visitsByPurpose.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header text-white" style={{ backgroundColor: '#800000' }}>
                <h5 className="mb-0">Detailed Statistics</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Purpose</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.visitsByPurpose.map((item, index) => (
                        <tr key={index}>
                          <td>{item.purpose}</td>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#800000' }}>
                              {item.count}
                            </span>
                          </td>
                          <td>
                            {((item.count / stats.totalVisits) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {studentProfile && (
        <StudentProfile 
          studentData={studentProfile} 
          onClose={closeProfile} 
        />
      )}
    </div>
  );
}

export default Dashboard;
