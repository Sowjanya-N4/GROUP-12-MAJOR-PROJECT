import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobPostingsList = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const fetchJobPostings = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      if (!token) {
        navigate('/company-login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/company/job-postings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setJobPostings(response.data);
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
      toast.error('Error fetching job postings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await axios.delete(`http://localhost:5000/api/company/job-postings/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          setJobPostings(jobPostings.filter(job => job._id !== jobId));
          toast.success('Job posting deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting job posting:', error);
        toast.error('Error deleting job posting');
      }
    }
  };

  const handleEdit = (job) => {
    navigate(`/company/job-postings/${job._id || job.id}/edit`);
  };

  const handleView = (job) => {
    navigate(`/company/job-postings/${job._id || job.id}`);
  };

  const handleCreateNew = () => {
    navigate('/company/job-posting-form');
  };


  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading job postings...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Job & Internship Postings</h1>
        <div style={styles.headerActions}>
          <button 
            style={styles.createButton}
            onClick={handleCreateNew}
          >
            + Create New Posting
          </button>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/company/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {jobPostings.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No job postings found</h3>
          <p>Create your first job posting to get started</p>
          <button 
            style={styles.createButton}
            onClick={handleCreateNew}
          >
            Create Job Posting
          </button>
        </div>
      ) : (
        <div style={styles.jobsGrid}>
          {jobPostings.map(job => (
            <div key={job._id || job.id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{job.jobTitle}</h3>
                <span style={styles.jobType}>{job.jobType}</span>
              </div>
              
              <div style={styles.jobInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Company:</span>
                  <span style={styles.infoValue}>{job.companyName}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Location:</span>
                  <span style={styles.infoValue}>{job.workMode} - {job.city}, {job.state}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Salary:</span>
                  <span style={styles.infoValue}>{job.salary}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Positions:</span>
                  <span style={styles.infoValue}>{job.numberOfPositions}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Deadline:</span>
                  <span style={styles.infoValue}>{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={styles.jobDescription}>
                <p>{job.jobDescription.substring(0, 150)}...</p>
              </div>

              <div style={styles.eligibility}>
                <h4 style={styles.eligibilityTitle}>Eligibility:</h4>
                <div style={styles.eligibilityInfo}>
                  <span>• {job.degreeRequired}</span>
                  <span>• Min CGPA: {job.minCGPA}</span>
                  <span>• Year: {job.graduationYear}</span>
                </div>
                {job.allowedBranches && job.allowedBranches.length > 0 && (
                  <div style={styles.branches}>
                    <strong>• Branches:</strong> {job.allowedBranches.join(', ')}
                  </div>
                )}
              </div>

              <div style={styles.jobActions}>
                <button 
                  style={styles.viewButton}
                  onClick={() => handleView(job)}
                >
                  👁️ View
                </button>
                <button 
                  style={styles.editButton}
                  onClick={() => handleEdit(job)}
                >
                  ✏️ Edit
                </button>
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDelete(job._id || job.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
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
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  jobCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  jobTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1a237e',
    margin: 0,
  },
  jobType: {
    padding: '4px 12px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  jobInfo: {
    marginBottom: '15px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    color: '#333',
  },
  jobDescription: {
    marginBottom: '15px',
    color: '#666',
    lineHeight: '1.5',
  },
  eligibility: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
  },
  eligibilityTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a237e',
    margin: '0 0 10px 0',
  },
  eligibilityInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '10px',
  },
  branches: {
    fontSize: '0.9rem',
    color: '#666',
  },
  jobActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  viewButton: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666',
  },
};

export default JobPostingsList;

// Modals
// Simple inline modal styles and elements appended at the bottom to keep file self-contained

