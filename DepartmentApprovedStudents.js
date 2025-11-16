import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepartmentApprovedStudents = () => {
  const navigate = useNavigate();
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("departmentToken");
    const info = localStorage.getItem("departmentInfo");
    
    if (!token) {
      navigate("/department-login");
      return;
    }

    if (info) {
      const deptInfo = JSON.parse(info);
      setDepartmentInfo(deptInfo);
      fetchApprovedStudents(deptInfo.department);
    }
  }, [navigate]);

  const fetchApprovedStudents = async (department) => {
    try {
      const deptCodeMap = {
        'CSE': 'CS',
        'EEE': 'EE',
        'ECE': 'EC',
        'CVE': 'CV',
        'ME': 'ME'
      };
      
      const usnCode = deptCodeMap[department] || department;
      
      // Fetch all students and filter by department and approval status
      const response = await axios.get('http://localhost:5000/api/profile');
      const allStudents = response.data || [];
      
      const usnPattern = new RegExp(`^4HG\\d{2}${usnCode}`);
      const departmentApprovedStudents = allStudents.filter(student => 
        usnPattern.test(student.usn) && student.isApproved === true
      );
      
      departmentApprovedStudents.sort((a, b) => (a.usn || '').localeCompare(b.usn || ''));
      
      console.log(`Found ${departmentApprovedStudents.length} approved students for ${department}`);
      
      setApprovedStudents(departmentApprovedStudents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching approved students:', error);
      toast.error('Error fetching approved students');
      setLoading(false);
    }
  };

  const handleViewDetails = async (usn) => {
    try {
      // Fetch full student details from API
      const response = await axios.get(`http://localhost:5000/api/profile/${usn}`);
      if (response.data.success) {
        setSelectedStudent(response.data.student);
        setShowDetailsModal(true);
      } else {
        // Fallback to local data if API fails
        const student = approvedStudents.find(s => s.usn === usn);
        setSelectedStudent(student);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      // Fallback to local data
      const student = approvedStudents.find(s => s.usn === usn);
      setSelectedStudent(student);
      setShowDetailsModal(true);
    }
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return <div style={styles.loading}>Loading Approved Students...</div>;
  }

  return (
    <div style={styles.pageContainer}>
      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeModal}>✕</button>
            <h2 style={styles.modalTitle}>Student Details</h2>
            
            <div style={styles.detailsContainer}>
              {/* Personal Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeader}>Personal Information</h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Name:</span>
                    <span style={styles.detailValue}>{selectedStudent.name || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>USN:</span>
                    <span style={styles.detailValue}>{selectedStudent.usn || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Email:</span>
                    <span style={styles.detailValue}>{selectedStudent.email || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Phone:</span>
                    <span style={styles.detailValue}>{selectedStudent.phone || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Gender:</span>
                    <span style={styles.detailValue}>{selectedStudent.gender || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Address:</span>
                    <span style={styles.detailValue}>{selectedStudent.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeader}>Academic Information</h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>College:</span>
                    <span style={styles.detailValue}>{selectedStudent.collegeName || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Semester:</span>
                    <span style={styles.detailValue}>{selectedStudent.currentSemester || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>CGPA:</span>
                    <span style={styles.detailValue}>{selectedStudent.cgpa || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Skills:</span>
                    <span style={styles.detailValue}>{selectedStudent.skills || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Interests:</span>
                    <span style={styles.detailValue}>{selectedStudent.interest || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Approval Information */}
              <div style={styles.section}>
                <h3 style={styles.sectionHeader}>Approval Status</h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Approved By:</span>
                    <span style={styles.detailValue}>{selectedStudent.approvedBy || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Approved Date:</span>
                    <span style={styles.detailValue}>
                      {selectedStudent.approvedAt ? new Date(selectedStudent.approvedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Status:</span>
                    <span style={{...styles.detailValue, color: '#4caf50'}}>✔ Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>COLLEGE PLACEMENT PORTAL</h1>
          <nav style={styles.nav}>
            <a href="/" style={styles.navLink}>Home</a>
            <a href="/aboutpage" style={styles.navLink}>About</a>
            <button onClick={() => navigate('/department/dashboard')} style={styles.navButtonActive}>
              Back to Dashboard
            </button>
            <div style={styles.profileIcon}>👤</div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Approved Students - {departmentInfo?.department}</h1>
        
        {/* Approved Count */}
        <div style={styles.countCard}>
          <div style={styles.countIcon}>✓</div>
          <div style={styles.countContent}>
            <div style={styles.countNumber}>{approvedStudents.length}</div>
            <div style={styles.countLabel}>Total Approved Students</div>
          </div>
        </div>

        {/* Students Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>S.No</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>USN</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Phone</th>
                <th style={styles.tableHeader}>Approved By</th>
                <th style={styles.tableHeader}>Approved Date</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.noData}>No approved students found</td>
                </tr>
              ) : (
                approvedStudents.map((student, index) => (
                  <tr key={student._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>{student.name || 'N/A'}</td>
                    <td style={styles.tableCell}>{student.usn || 'N/A'}</td>
                    <td style={styles.tableCell}>{student.email || 'N/A'}</td>
                    <td style={styles.tableCell}>{student.phone || 'N/A'}</td>
                    <td style={styles.tableCell}>{student.approvedBy || 'N/A'}</td>
                    <td style={styles.tableCell}>
                      {student.approvedAt ? new Date(student.approvedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={styles.tableCellActions}>
                      <button
                        onClick={() => handleViewDetails(student.usn)}
                        style={styles.viewButton}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#1e3a8a',
    color: 'white',
    padding: '20px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '2px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  navButtonActive: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  profileIcon: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: '#4ade80',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  pageTitle: {
    fontSize: '2rem',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: '30px',
    fontWeight: '700',
  },
  countCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    maxWidth: '500px',
    margin: '0 auto 30px',
    border: '3px solid #4caf50',
  },
  countIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
  },
  countContent: {
    flex: 1,
  },
  countNumber: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: '5px',
  },
  countLabel: {
    fontSize: '1.1rem',
    color: '#666',
    fontWeight: '500',
  },
  tableWrapper: {
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#1976d2',
  },
  tableHeader: {
    padding: '16px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
    transition: 'background-color 0.2s',
  },
  tableCell: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#333',
  },
  tableCellActions: {
    padding: '14px 16px',
    fontSize: '14px',
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
    fontSize: '16px',
  },
  viewButton: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666',
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '35px',
    maxWidth: '900px',
    width: '95%',
    maxHeight: '92vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  modalTitle: {
    margin: '0 0 25px 0',
    fontSize: '1.8rem',
    color: '#1976d2',
    fontWeight: '700',
    borderBottom: '3px solid #1976d2',
    paddingBottom: '10px',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
  },
  sectionHeader: {
    margin: '0 0 15px 0',
    fontSize: '1.3rem',
    color: '#1e3a8a',
    fontWeight: '600',
    borderBottom: '2px solid #1976d2',
    paddingBottom: '8px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#1976d2',
    fontWeight: '500',
    wordBreak: 'break-word',
  },
};

export default DepartmentApprovedStudents;
