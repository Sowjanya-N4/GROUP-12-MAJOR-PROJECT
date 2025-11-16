import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobPostingView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jobPosting, setJobPosting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobPosting();
  }, [id]);

  const fetchJobPosting = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      if (!token) {
        navigate('/company-login');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/company/job-postings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setJobPosting(response.data);
      }
    } catch (error) {
      console.error('Error fetching job posting:', error);
      toast.error('Error fetching job posting');
      navigate('/company/job-postings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/company/job-postings/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await axios.delete(`http://localhost:5000/api/company/job-postings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          toast.success('Job posting deleted successfully');
          navigate('/company/job-postings');
        }
      } catch (error) {
        console.error('Error deleting job posting:', error);
        toast.error('Error deleting job posting');
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading job posting...</div>
      </div>
    );
  }

  if (!jobPosting) {
    return (
      <div style={styles.error}>
        <h2>Job posting not found</h2>
        <button style={styles.backButton} onClick={() => navigate('/company/job-postings')}>
          ← Back to Job Postings
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Job Posting Details</h1>
        <div style={styles.headerActions}>
          <button style={styles.editButton} onClick={handleEdit}>
            ✏️ Edit
          </button>
          <button style={styles.deleteButton} onClick={handleDelete}>
            🗑️ Delete
          </button>
          <button style={styles.backButton} onClick={() => navigate('/company/job-postings')}>
            ← Back to Job Postings
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Basic Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.label}>Job Title:</label>
              <span style={styles.value}>{jobPosting.jobTitle}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Company Name:</label>
              <span style={styles.value}>{jobPosting.companyName}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Job Type:</label>
              <span style={styles.value}>{jobPosting.jobType}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Work Mode:</label>
              <span style={styles.value}>{jobPosting.workMode}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Location:</label>
              <span style={styles.value}>{jobPosting.city}, {jobPosting.state}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Status:</label>
              <span style={styles.statusBadge}>{jobPosting.status}</span>
            </div>
          </div>
          <div style={styles.infoItem}>
            <label style={styles.label}>Job Description:</label>
            <p style={styles.description}>{jobPosting.jobDescription}</p>
          </div>
        </div>

        {/* Compensation */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Compensation</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.label}>Salary:</label>
              <span style={styles.value}>{jobPosting.salary}</span>
            </div>
            {jobPosting.bonusInfo && (
              <div style={styles.infoItem}>
                <label style={styles.label}>Bonus Information:</label>
                <span style={styles.value}>{jobPosting.bonusInfo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Eligibility Criteria</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.label}>Degree Required:</label>
              <span style={styles.value}>{jobPosting.degreeRequired}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Graduation Year:</label>
              <span style={styles.value}>{jobPosting.graduationYear}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Minimum CGPA:</label>
              <span style={styles.value}>{jobPosting.minCGPA}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Backlog Allowed:</label>
              <span style={styles.value}>{jobPosting.backlogAllowed ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          {jobPosting.allowedBranches && jobPosting.allowedBranches.length > 0 && (
            <div style={styles.infoItem}>
              <label style={styles.label}>Allowed Branches:</label>
              <div style={styles.tags}>
                {jobPosting.allowedBranches.map((branch, index) => (
                  <span key={index} style={styles.tag}>{branch}</span>
                ))}
              </div>
            </div>
          )}

          {jobPosting.requiredSkills && jobPosting.requiredSkills.length > 0 && (
            <div style={styles.infoItem}>
              <label style={styles.label}>Required Skills:</label>
              <div style={styles.tags}>
                {jobPosting.requiredSkills.map((skill, index) => (
                  <span key={index} style={styles.tag}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {jobPosting.certifications && jobPosting.certifications.length > 0 && (
            <div style={styles.infoItem}>
              <label style={styles.label}>Certifications:</label>
              <div style={styles.tags}>
                {jobPosting.certifications.map((cert, index) => (
                  <span key={index} style={styles.tag}>{cert}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selection Process */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Selection Process</h2>
          <div style={styles.selectionProcess}>
            {Object.entries(jobPosting.selectionProcess || {}).map(([key, value]) => (
              <div key={key} style={styles.processItem}>
                <span style={styles.processLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </span>
                <span style={styles.processValue}>{value ? 'Yes' : 'No'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Additional Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.label}>Number of Positions:</label>
              <span style={styles.value}>{jobPosting.numberOfPositions}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Application Deadline:</label>
              <span style={styles.value}>
                {new Date(jobPosting.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          {jobPosting.documentsRequired && jobPosting.documentsRequired.length > 0 && (
            <div style={styles.infoItem}>
              <label style={styles.label}>Documents Required:</label>
              <ul style={styles.documentsList}>
                {jobPosting.documentsRequired.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recruiter Contact Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recruiter Contact Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.label}>Recruiter Name:</label>
              <span style={styles.value}>{jobPosting.recruiterName}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Recruiter Email:</label>
              <span style={styles.value}>{jobPosting.recruiterEmail}</span>
            </div>
            {jobPosting.recruiterPhone && (
              <div style={styles.infoItem}>
                <label style={styles.label}>Recruiter Phone:</label>
                <span style={styles.value}>{jobPosting.recruiterPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        {jobPosting.additionalNotes && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Additional Notes</h2>
            <p style={styles.description}>{jobPosting.additionalNotes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Timestamps</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.label}>Created:</label>
              <span style={styles.value}>
                {new Date(jobPosting.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Last Updated:</label>
              <span style={styles.value}>
                {new Date(jobPosting.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a237e',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '15px',
  },
  editButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: '12px 24px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  backButton: {
    padding: '12px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  section: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '10px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  infoItem: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: '#333',
    marginBottom: '5px',
  },
  value: {
    color: '#666',
    fontSize: '16px',
  },
  description: {
    color: '#666',
    lineHeight: '1.6',
    margin: 0,
  },
  statusBadge: {
    padding: '4px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '5px',
  },
  tag: {
    padding: '4px 12px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '15px',
    fontSize: '0.9rem',
  },
  selectionProcess: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  processItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
  },
  processLabel: {
    fontWeight: '500',
    color: '#333',
  },
  processValue: {
    color: '#666',
  },
  documentsList: {
    margin: '5px 0 0 20px',
    color: '#666',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666',
  },
};

export default JobPostingView;
