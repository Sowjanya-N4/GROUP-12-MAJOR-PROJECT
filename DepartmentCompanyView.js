import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobPostingView from '../company/JobPostingView';

// Minimal SVG Profile Icon ONLY (matches your image)
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

const DepartmentCompanyView = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showCompanyProfiles, setShowCompanyProfiles] = useState(false);
  const [companyProfiles, setCompanyProfiles] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("departmentToken");
    const info = localStorage.getItem("departmentInfo");
    
    if (!token) {
      navigate("/department-login");
      return;
    }

    if (info) {
      setDepartmentInfo(JSON.parse(info));
    }
    
    fetchJobPostings();
  }, [navigate]);

  const fetchJobPostings = async () => {
    try {
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

  const fetchCompanyProfiles = async () => {
    try {
      setCompanyLoading(true);
      const response = await axios.get('http://localhost:5000/api/company-profile/all');
      if (response.data.success) {
        setCompanyProfiles(response.data.profiles);
      }
    } catch (error) {
      console.error('Error fetching company profiles:', error);
      toast.error('Error fetching company profiles');
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
  };

  const handleCloseJobView = () => {
    setSelectedJob(null);
  };

  const handleViewCompanyProfiles = () => {
    setShowCompanyProfiles(true);
    fetchCompanyProfiles();
  };

  const handleCloseCompanyProfiles = () => {
    setShowCompanyProfiles(false);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  if (selectedJob) {
    return (
      <JobPostingView 
        jobPosting={selectedJob} 
        onClose={handleCloseJobView}
        isDepartmentView={true}
      />
    );
  }

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
            
            {/* Back to Dashboard Button */}
            <button 
              style={styles.backToDashboardBtn}
              onClick={() => navigate('/department/dashboard')}
            >
              Back to Dashboard
            </button>
            
            {/* Profile Icon & Dropdown */}
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
                      navigate('/department/dashboard');
                    }}
                  >
                    {departmentInfo?.name || 'Department Staff'}
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
          
          <h1 style={styles.pageTitle}>Company Job Postings</h1>
        </div>

        {/* Company Statistics */}
        <div style={styles.statsSection}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💼</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{jobPostings.length}</h3>
              <p style={styles.statLabel}>Active Jobs</p>
            </div>
          </div>
          <div style={{...styles.statCard, ...styles.clickableStat}} onClick={handleViewCompanyProfiles}>
            <div style={styles.statIcon}>🏢</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{new Set(jobPostings.map(job => job.companyName)).size}</h3>
              <p style={styles.statLabel}>Companies (Click to view profiles)</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{jobPostings.reduce((sum, job) => sum + (job.numberOfPositions || 0), 0)}</h3>
              <p style={styles.statLabel}>Total Positions</p>
            </div>
          </div>
        </div>

        {/* Job Postings Grid */}
        {loading ? (
          <div style={styles.loading}>Loading job postings...</div>
        ) : jobPostings.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No job postings available</h3>
            <p>Check back later for new opportunities</p>
          </div>
        ) : (
          <div style={styles.jobsGrid}>
            {jobPostings.map(job => (
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
                    onClick={() => handleViewJob(job)}
                  >
                    View Details
                  </button>
                  <button 
                    style={styles.manageButton}
                    onClick={() => navigate('/company/job-postings')}
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Company Profiles Modal */}
        {showCompanyProfiles && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Company Profiles</h2>
                <button 
                  style={styles.closeButton}
                  onClick={handleCloseCompanyProfiles}
                >
                  ✕
                </button>
              </div>
              
              <div style={styles.modalBody}>
                {companyLoading ? (
                  <div style={styles.loading}>Loading company profiles...</div>
                ) : companyProfiles.length === 0 ? (
                  <div style={styles.emptyState}>
                    <h3>No company profiles found</h3>
                    <p>No companies have created their profiles yet</p>
                  </div>
                ) : (
                  <div style={styles.companyProfilesGrid}>
                    {companyProfiles.map(company => (
                      <div key={company._id} style={styles.companyProfileCard}>
                        <div style={styles.companyProfileHeader}>
                          <h3 style={styles.companyProfileName}>{company.companyName}</h3>
                          <span style={styles.companyIndustry}>{company.industry}</span>
                        </div>
                        
                        <div style={styles.companyProfileInfo}>
                          <div style={styles.companyInfoRow}>
                            <span style={styles.companyInfoLabel}>Email:</span>
                            <span style={styles.companyInfoValue}>{company.email}</span>
                          </div>
                          <div style={styles.companyInfoRow}>
                            <span style={styles.companyInfoLabel}>Phone:</span>
                            <span style={styles.companyInfoValue}>{company.phone || 'Not provided'}</span>
                          </div>
                          <div style={styles.companyInfoRow}>
                            <span style={styles.companyInfoLabel}>Website:</span>
                            <span style={styles.companyInfoValue}>
                              {company.website ? (
                                <a href={company.website} target="_blank" rel="noopener noreferrer" style={styles.websiteLink}>
                                  {company.website}
                                </a>
                              ) : 'Not provided'}
                            </span>
                          </div>
                          <div style={styles.companyInfoRow}>
                            <span style={styles.companyInfoLabel}>Location:</span>
                            <span style={styles.companyInfoValue}>
                              {company.city && company.state ? `${company.city}, ${company.state}` : 'Not provided'}
                            </span>
                          </div>
                          <div style={styles.companyInfoRow}>
                            <span style={styles.companyInfoLabel}>Company Size:</span>
                            <span style={styles.companyInfoValue}>{company.companySize || 'Not provided'}</span>
                          </div>
                          <div style={styles.companyInfoRow}>
                            <span style={styles.companyInfoLabel}>Founded:</span>
                            <span style={styles.companyInfoValue}>{company.foundedYear || 'Not provided'}</span>
                          </div>
                        </div>

                        {company.description && (
                          <div style={styles.companyDescription}>
                            <h4 style={styles.descriptionTitle}>About Company:</h4>
                            <p style={styles.descriptionText}>{company.description}</p>
                          </div>
                        )}

                        <div style={styles.contactPersonInfo}>
                          <h4 style={styles.contactTitle}>Contact Person:</h4>
                          <div style={styles.contactDetails}>
                            <div style={styles.contactRow}>
                              <span style={styles.contactLabel}>Name:</span>
                              <span style={styles.contactValue}>{company.contactPerson || 'Not provided'}</span>
                            </div>
                            <div style={styles.contactRow}>
                              <span style={styles.contactLabel}>Email:</span>
                              <span style={styles.contactValue}>{company.contactPersonEmail || 'Not provided'}</span>
                            </div>
                            <div style={styles.contactRow}>
                              <span style={styles.contactLabel}>Phone:</span>
                              <span style={styles.contactValue}>{company.contactPersonPhone || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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
    '&:hover': {
      backgroundColor: '#f57c00',
      transform: 'translateY(-1px)',
    },
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
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#5a6268',
    },
  },
  pageTitle: {
    fontSize: '2.5rem',
    color: '#1976d2',
    margin: 0,
    fontWeight: 'bold',
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
  clickableStat: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
      borderColor: '#1976d2',
    },
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
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    },
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
    '&:hover': {
      backgroundColor: '#138496',
    },
  },
  manageButton: {
    padding: '10px 20px',
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#e0a800',
    },
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
  // Company Profiles Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '100%',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1a237e',
    fontWeight: 'bold',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666',
    padding: '5px',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e0e0e0',
      color: '#333',
    },
  },
  modalBody: {
    padding: '25px',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  companyProfilesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  companyProfileCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  companyProfileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #ddd',
  },
  companyProfileName: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#1a237e',
    fontWeight: 'bold',
  },
  companyIndustry: {
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  companyProfileInfo: {
    marginBottom: '15px',
  },
  companyInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    padding: '5px 0',
  },
  companyInfoLabel: {
    fontWeight: '600',
    color: '#666',
    fontSize: '0.9rem',
    minWidth: '100px',
  },
  companyInfoValue: {
    color: '#333',
    fontSize: '0.9rem',
    flex: 1,
    textAlign: 'right',
  },
  websiteLink: {
    color: '#1976d2',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  companyDescription: {
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  descriptionTitle: {
    margin: '0 0 8px 0',
    fontSize: '1rem',
    color: '#1a237e',
    fontWeight: '600',
  },
  descriptionText: {
    margin: 0,
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  contactPersonInfo: {
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  contactTitle: {
    margin: '0 0 10px 0',
    fontSize: '1rem',
    color: '#1a237e',
    fontWeight: '600',
  },
  contactDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  contactRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  contactLabel: {
    fontWeight: '600',
    color: '#666',
    fontSize: '0.8rem',
    minWidth: '80px',
  },
  contactValue: {
    color: '#333',
    fontSize: '0.8rem',
    flex: 1,
    textAlign: 'right',
  },
};

export default DepartmentCompanyView;
