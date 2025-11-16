import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Minimal SVG Profile Icon
const ProfileIcon = () => (
  <div style={styles.iconWrap}>
    <div style={styles.avatarCircle}>
      <svg
        height="32"
        width="32"
        viewBox="0 0 24 24"
        style={{ display: 'block', margin: 'auto' }}
      >
        <circle 
          cx="12" 
          cy="8" 
          r="5" 
          stroke="#666"
          strokeWidth="2" 
          fill="none"
        />
        <path
          d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7"
          stroke="#666"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  </div>
);

const StudentAppliedJobs = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const userUSN = localStorage.getItem('userUSN');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn || !userUSN) {
      navigate("/student-login");
      return;
    }
    setStudentInfo({ usn: userUSN });
    fetchApplications();
  }, [navigate, userUSN]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`http://localhost:5000/api/student/applications?usn=${userUSN}`);
      if (res.data.success && Array.isArray(res.data.applications)) {
        setApplications(res.data.applications);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
      setError('Failed to load applied opportunities');
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userUSN");
    navigate("/logout");
  };

  return (
    <div style={styles.container}>
      {/* Fixed Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.siteTitle}>COLLEGE PLACEMENT PORTAL</h1>
          </div>
          <div style={styles.headerRight}>
            <nav style={styles.navigation}>
              <a href="/" style={styles.navLink}>Home</a>
              <button style={styles.navButton} onClick={() => navigate('/aboutpage')}>About</button>
            </nav>
            <button 
              style={styles.backToDashboardBtn}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
            <div
              style={styles.profileContainer}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              tabIndex={0}
              role="button"
            >
              <ProfileIcon />
              {profileDropdownOpen && (
                <div style={styles.profileDropdown}>
                  <button 
                    style={styles.dropdownItem}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/dashboard');
                    }}
                  >
                    {studentInfo?.usn || 'Student'}
                  </button>
                  <button 
                    style={styles.dropdownItem}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>📄 My Applied Opportunities</h1>
        </div>

        {/* Table View of Applied Jobs */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>Loading applied opportunities...</div>
          ) : error && !loading ? (
            <div style={styles.error}>{error}</div>
          ) : applications.length === 0 ? (
            <div style={styles.emptyState}>
              <h3>No applications yet</h3>
              <p>You haven't applied to any jobs yet. Start browsing opportunities!</p>
              <button 
                style={styles.browseButton}
                onClick={() => navigate('/student-my-application')}
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeaderIndex}>No.</th>
                    <th style={styles.tableHeader}>Job Title</th>
                    <th style={styles.tableHeader}>Company</th>
                    <th style={styles.tableHeader}>City</th>
                    <th style={styles.tableHeader}>Date Applied</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => (
                    <tr key={app._id} style={styles.tableRow}>
                      <td style={styles.tableCellIndex}>{index + 1}</td>
                      <td style={styles.tableCell}>{app.jobTitle || app.job?.jobTitle}</td>
                      <td style={styles.tableCell}>{app.companyName || app.job?.companyName}</td>
                      <td style={styles.tableCell}>{app.city || app.job?.city}</td>
                      <td style={styles.tableCell}>
                        {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{
                        ...styles.tableCell,
                        color: app.status === 'Accepted' ? '#388e3c' : 
                               app.status === 'Rejected' ? '#d32f2f' : '#1976d2',
                        fontWeight: '600'
                      }}>
                        {app.status || 'Pending'}
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
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a237e',
    color: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    minHeight: '100px',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  siteTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    letterSpacing: '3px',
    textAlign: 'left',
    textTransform: 'uppercase',
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '500',
    padding: '12px 16px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
  },
  navButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '18px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  backToDashboardBtn: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginLeft: '10px',
  },
  profileContainer: {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '2.5px solid #00b6ff',
    backgroundColor: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileDropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 5px)',
    backgroundColor: '#2c387e',
    borderRadius: '6px',
    width: '180px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1500,
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    textAlign: 'left',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '140px auto 40px',
    padding: '0 20px',
  },
  pageHeader: {
    marginBottom: '30px',
  },
  pageTitle: {
    fontSize: '2.5rem',
    color: '#1976d2',
    margin: 0,
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '30px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#1976d2',
  },
  tableHeader: {
    padding: '14px 12px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
  },
  tableHeaderIndex: {
    padding: '14px 12px',
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    width: '80px',
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
  },
  tableCell: {
    padding: '14px 12px',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'left',
    fontSize: '0.95rem',
  },
  tableCellIndex: {
    padding: '14px 12px',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#666',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
    color: '#666',
  },
  error: {
    color: '#d32f2f',
    padding: '20px',
    textAlign: 'center',
    fontSize: '1.1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  browseButton: {
    marginTop: '20px',
    padding: '12px 30px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

export default StudentAppliedJobs;
