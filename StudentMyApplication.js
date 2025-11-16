import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const StudentMyApplication = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedLoading, setAppliedLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('apply'); // 'apply' or 'table'
  const [studentInfo, setStudentInfo] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  // Filters (copied from listings)
  const [filters, setFilters] = useState({
    jobType: '',
    workMode: '',
    city: '',
    state: '',
    minCGPA: '',
    graduationYear: '',
    allowedBranches: '',
    requiredSkills: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const userUSN = localStorage.getItem('userUSN');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn || !userUSN) {
      navigate("/student-login");
      return;
    }
    setStudentInfo({ usn: userUSN });
    // Check URL params for view mode
    const viewParam = searchParams.get('view');
    if (viewParam === 'table') {
      setViewMode('table');
    }
    fetchJobPostings();
    fetchApplications();
  }, [navigate, userUSN, searchParams]);

  // Refresh applications when switching to table view
  useEffect(() => {
    if (viewMode === 'table') {
      fetchApplications();
    }
  }, [viewMode]);

  const fetchJobPostings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/student/job-postings');
      if (response.data.success) {
        setJobPostings(response.data.jobPostings);
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
      toast.error('Error fetching job postings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) queryParams.append(key, value);
      });
      const response = await axios.get(`http://localhost:5000/api/student/job-postings/search/filter?${queryParams.toString()}`);
      if (response.data.success) {
        setJobPostings(response.data.jobPostings);
      }
    } catch (error) {
      console.error('Error filtering job postings:', error);
      toast.error('Error filtering job postings');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      jobType: '',
      workMode: '',
      city: '',
      state: '',
      minCGPA: '',
      graduationYear: '',
      allowedBranches: '',
      requiredSkills: ''
    });
    fetchJobPostings();
  };

  const fetchApplications = async () => {
    try {
      setAppliedLoading(true);
      setError('');
      const res = await axios.get(`http://localhost:5000/api/student/applications?usn=${userUSN}`);
      if (res.data.success && Array.isArray(res.data.applications)) {
        setApplications(res.data.applications);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
      setError('Failed to load applied opportunities');
    } finally {
      setAppliedLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userUSN");
    navigate("/logout");
  };

  // Filter out already applied jobs
  const appliedJobIds = new Set(applications.map(app => app.jobId || app.job?._id));
  const availableJobs = jobPostings.filter(job => !appliedJobIds.has(job._id));

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
          <h1 style={styles.pageTitle}>My Applications</h1>
          <div style={styles.viewToggle}>
            <button 
              style={{...styles.toggleButton, ...(viewMode === 'apply' ? styles.toggleButtonActive : {})}}
              onClick={() => setViewMode('apply')}
            >
              Browse & Apply
            </button>
            <button 
              style={{...styles.toggleButton, ...(viewMode === 'table' ? styles.toggleButtonActive : {})}}
              onClick={() => setViewMode('table')}
            >
              My Applications
            </button>
          </div>
        </div>

        {viewMode === 'apply' ? (
          <>
            {/* Filters */}
            <div style={styles.filtersContainer}>
              <h3 style={styles.filtersTitle}>Filter Jobs</h3>
              <div style={styles.filtersGrid}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Job Type</label>
                  <select name="jobType" value={filters.jobType} onChange={handleFilterChange} style={styles.filterInput}>
                    <option value="">All Types</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Work Mode</label>
                  <select name="workMode" value={filters.workMode} onChange={handleFilterChange} style={styles.filterInput}>
                    <option value="">All Modes</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>City</label>
                  <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="Enter city" style={styles.filterInput} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>State</label>
                  <input type="text" name="state" value={filters.state} onChange={handleFilterChange} placeholder="Enter state" style={styles.filterInput} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Min CGPA</label>
                  <input type="number" name="minCGPA" value={filters.minCGPA} onChange={handleFilterChange} placeholder="e.g., 7.0" step="0.1" min="0" max="10" style={styles.filterInput} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Graduation Year</label>
                  <input type="text" name="graduationYear" value={filters.graduationYear} onChange={handleFilterChange} placeholder="e.g., 2024" style={styles.filterInput} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Branches (comma-separated)</label>
                  <input type="text" name="allowedBranches" value={filters.allowedBranches} onChange={handleFilterChange} placeholder="e.g., Computer Science, IT" style={styles.filterInput} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Skills (comma-separated)</label>
                  <input type="text" name="requiredSkills" value={filters.requiredSkills} onChange={handleFilterChange} placeholder="e.g., React, Python" style={styles.filterInput} />
                </div>
              </div>
              <div style={styles.filterActions}>
                <button style={styles.applyButton} onClick={applyFilters}>Apply Filters</button>
                <button style={styles.clearButton} onClick={clearFilters}>Clear Filters</button>
              </div>
            </div>
            {/* Job Statistics */}
            <div style={styles.statsSection}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💼</div>
                <div style={styles.statContent}>
                  <h3 style={styles.statNumber}>{availableJobs.length}</h3>
                  <p style={styles.statLabel}>Available Jobs</p>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏢</div>
                <div style={styles.statContent}>
                  <h3 style={styles.statNumber}>{new Set(availableJobs.map(job => job.companyName)).size}</h3>
                  <p style={styles.statLabel}>Companies</p>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <div style={styles.statContent}>
                  <h3 style={styles.statNumber}>{availableJobs.reduce((sum, job) => sum + (job.numberOfPositions || 0), 0)}</h3>
                  <p style={styles.statLabel}>Total Positions</p>
                </div>
              </div>
            </div>

            {/* Job Postings Grid */}
            {loading ? (
              <div style={styles.loading}>Loading job postings...</div>
            ) : availableJobs.length === 0 ? (
              <div style={styles.emptyState}>
                <h3>No job postings available</h3>
                <p>Check back later for new opportunities</p>
              </div>
            ) : (
              <div style={styles.jobsGrid}>
                {availableJobs.map(job => (
                  <div key={job._id} style={styles.jobCard}>
                    <div style={styles.jobHeader}>
                      <h3 style={styles.jobTitle}>{job.jobTitle}</h3>
                      <div style={styles.jobBadges}>
                        <span style={styles.jobType}>{job.jobType}</span>
                        <span style={styles.workMode}>{job.workMode}</span>
                      </div>
                    </div>
                    
                    <div style={styles.companyInfo}>
                      <h4 style={styles.companyName}>{job.companyName}</h4>
                      <p style={styles.location}>📍 {job.city}, {job.state}</p>
                    </div>

                    <div style={styles.jobDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Salary:</span>
                        <span style={styles.detailValue}>{job.salary}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Positions:</span>
                        <span style={styles.detailValue}>{job.numberOfPositions}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Deadline:</span>
                        <span style={styles.detailValue}>
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={styles.jobDescription}>
                      <p>{job.jobDescription.substring(0, 150)}...</p>
                    </div>

                    <div style={styles.jobActions}>
                      <button 
                        style={styles.viewButton}
                        onClick={() => navigate(`/student-job-postings/${job._id}`)}
                      >
                        View Details
                      </button>
                      <button 
                        style={{
                          ...styles.applyButton,
                          backgroundColor: new Date(job.applicationDeadline) < new Date() ? '#6c757d' : '#28a745',
                          cursor: new Date(job.applicationDeadline) < new Date() ? 'not-allowed' : 'pointer'
                        }}
                        disabled={new Date(job.applicationDeadline) < new Date()}
                        onClick={() => navigate(`/apply/${job._id}`)}
                      >
                        {new Date(job.applicationDeadline) < new Date() ? 'Expired' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Table View of Applied Jobs */}
            <div style={styles.tableContainer}>
              {appliedLoading ? (
                <div style={styles.loading}>Loading applied opportunities...</div>
              ) : error && !appliedLoading ? (
                <div style={styles.error}>{error}</div>
              ) : applications.length === 0 ? (
                <div style={styles.emptyState}>
                  <h3>No applications yet</h3>
                  <p>Browse opportunities and apply to see them here</p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeader}>Job Title</th>
                        <th style={styles.tableHeader}>Company</th>
                        <th style={styles.tableHeader}>City</th>
                        <th style={styles.tableHeader}>Date Applied</th>
                        <th style={styles.tableHeader}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app._id}>
                          <td style={styles.tableCell}>{app.jobTitle || app.job?.jobTitle}</td>
                          <td style={styles.tableCell}>{app.companyName || app.job?.companyName}</td>
                          <td style={styles.tableCell}>{app.city || app.job?.city}</td>
                          <td style={styles.tableCell}>
                            {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{
                            ...styles.tableCell,
                            color: app.status === 'Accepted' ? '#388e3c' : 
                                   app.status === 'Rejected' ? '#d32f2f' : '#1976d2'
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
          </>
        )}
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
    margin: '100px auto 0',
    padding: '0 20px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  filtersTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: '20px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  filterGroup: { display: 'flex', flexDirection: 'column' },
  filterLabel: { marginBottom: '5px', fontWeight: 600, color: '#333' },
  filterInput: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' },
  filterActions: { display: 'flex', gap: '15px', justifyContent: 'flex-end' },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  pageTitle: {
    fontSize: '2.5rem',
    color: '#1976d2',
    margin: 0,
    fontWeight: 'bold',
  },
  viewToggle: {
    display: 'flex',
    gap: '10px',
  },
  toggleButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#1976d2',
    border: '2px solid #1976d2',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  toggleButtonActive: {
    backgroundColor: '#1976d2',
    color: 'white',
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  statIcon: {
    fontSize: '2.5rem',
    width: '60px',
    textAlign: 'center',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  jobCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  jobTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1a237e',
    margin: 0,
    flex: 1,
  },
  jobBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  jobType: {
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  workMode: {
    padding: '4px 8px',
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  companyInfo: {
    marginBottom: '15px',
  },
  companyName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 5px 0',
  },
  location: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
  jobDetails: {
    marginBottom: '15px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#666',
    fontSize: '0.9rem',
  },
  detailValue: {
    color: '#333',
    fontSize: '0.9rem',
  },
  jobDescription: {
    marginBottom: '20px',
    color: '#666',
    lineHeight: '1.5',
    fontSize: '0.9rem',
  },
  jobActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  viewButton: {
    padding: '10px 20px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  },
  applyButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '20px',
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
    padding: '12px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'left',
  },
  error: {
    color: '#d32f2f',
    padding: '20px',
    textAlign: 'center',
  },
};

export default StudentMyApplication;
