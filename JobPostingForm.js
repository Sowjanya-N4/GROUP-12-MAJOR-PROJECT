import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobPostingForm = ({ initialData = null, mode = 'create', onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Get logged-in company info
  const getCompanyName = () => {
    try {
      const companyInfo = localStorage.getItem('companyInfo');
      if (companyInfo) {
        const company = JSON.parse(companyInfo);
        return company.name || company.companyName || '';
      }
    } catch (error) {
      console.error('Error parsing company info:', error);
    }
    return '';
  };

  const [formData, setFormData] = useState(initialData ? {
    jobTitle: initialData.jobTitle || '',
    companyName: initialData.companyName || getCompanyName(),
    jobDescription: initialData.jobDescription || '',
    jobType: initialData.jobType || 'Permanent',
    location: initialData.location || '',
    workMode: initialData.workMode || 'Onsite',
    city: initialData.city || '',
    state: initialData.state || '',
    salary: initialData.salary || '',
    bonusInfo: initialData.bonusInfo || '',
    degreeRequired: initialData.degreeRequired || '',
    allowedBranches: initialData.allowedBranches || [],
    graduationYear: initialData.graduationYear || '',
    minCGPA: initialData.minCGPA ? String(initialData.minCGPA) : '',
    requiredSkills: initialData.requiredSkills || [],
    certifications: initialData.certifications || [],
    backlogAllowed: initialData.backlogAllowed || false,
    selectionProcess: {
      prePlacementTalk: initialData.selectionProcess?.prePlacementTalk || false,
      writtenTest: initialData.selectionProcess?.writtenTest || false,
      groupDiscussion: initialData.selectionProcess?.groupDiscussion || false,
      technicalInterview: initialData.selectionProcess?.technicalInterview || false,
      hrInterview: initialData.selectionProcess?.hrInterview || false
    },
    numberOfPositions: initialData.numberOfPositions ? String(initialData.numberOfPositions) : '',
    applicationDeadline: initialData.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().substring(0,10) : '',
    documentsRequired: initialData.documentsRequired || [],
    recruiterName: initialData.recruiterName || '',
    recruiterEmail: initialData.recruiterEmail || '',
    recruiterPhone: initialData.recruiterPhone || '',
    additionalNotes: initialData.additionalNotes || ''
  } : {
    jobTitle: '',
    companyName: getCompanyName(),
    jobDescription: '',
    jobType: 'Permanent',
    location: '',
    workMode: 'Onsite',
    city: '',
    state: '',
    salary: '',
    bonusInfo: '',
    degreeRequired: '',
    allowedBranches: [],
    graduationYear: '',
    minCGPA: '',
    requiredSkills: [],
    certifications: [],
    backlogAllowed: false,
    selectionProcess: {
      prePlacementTalk: false,
      writtenTest: false,
      groupDiscussion: false,
      technicalInterview: false,
      hrInterview: false
    },
    numberOfPositions: '',
    applicationDeadline: '',
    documentsRequired: [],
    recruiterName: '',
    recruiterEmail: '',
    recruiterPhone: '',
    additionalNotes: ''
  });

  const handleInputChange = (e) => {
    if (mode === 'view') return; // Don't allow changes in view mode
    
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('selectionProcess.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        selectionProcess: {
          ...prev.selectionProcess,
          [field]: checked
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'recruiterPhone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        recruiterPhone: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayInput = (field, value) => {
    if (mode === 'view') return; // Don't allow changes in view mode
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const getInputProps = (name, type = 'text') => ({
    name,
    type,
    disabled: mode === 'view',
    readOnly: mode === 'view'
  });

  const removeArrayItem = (field, index) => {
    if (mode === 'view') return; // Don't allow changes in view mode
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // validate phone length if provided
      if (formData.recruiterPhone && formData.recruiterPhone.length !== 10) {
        toast.error('Recruiter phone must be exactly 10 digits');
        setLoading(false);
        return;
      }

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Fallback to original behavior
        const token = localStorage.getItem('companyToken');
        if (!token) {
          toast.error('Please login again');
          return;
        }

        const response = await axios.post('http://localhost:5000/api/company/job-postings', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 201 || response.status === 200) {
          toast.success('Job posting created successfully!');
          navigate('/company/dashboard');
        }
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      toast.error(error.response?.data?.message || 'Error creating job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={mode === 'view' ? styles.viewContainer : styles.container}>
      {mode !== 'view' && (
        <div style={styles.header}>
          <h1 style={styles.title}>
            {mode === 'create' ? 'Create Job Posting' : 'Edit Job Posting'}
          </h1>
          <button style={styles.backButton} onClick={onCancel || (() => navigate('/company/dashboard'))}>
            ← Back to Dashboard
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                style={styles.input}
                disabled={mode === 'view'}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  backgroundColor: '#e9ecef',
                  cursor: 'not-allowed',
                  color: '#000',
                  fontWeight: '500'
                }}
                readOnly
                disabled
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Job Type *</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                style={styles.input}
                required
              >
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Work Mode *</label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleInputChange}
                style={styles.input}
                required
              >
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Description *</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              style={{...styles.input, height: '120px'}}
              placeholder="Describe the role, responsibilities, and required skills..."
              required
            />
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Compensation</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Salary/Compensation *</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="e.g., 8-12 LPA"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bonus Information</label>
              <input
                type="text"
                name="bonusInfo"
                value={formData.bonusInfo}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="e.g., Performance bonus, ESOPs"
              />
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Eligibility Criteria</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Degree Required *</label>
              <input
                type="text"
                name="degreeRequired"
                value={formData.degreeRequired}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="e.g., B.Tech, B.E, M.Tech"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Graduation Year *</label>
              <input
                type="text"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="e.g., 2024, 2025"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Minimum CGPA *</label>
              <input
                type="number"
                name="minCGPA"
                value={formData.minCGPA}
                onChange={handleInputChange}
                style={styles.input}
                step="0.1"
                min="0"
                max="10"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Backlog Allowed</label>
              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="backlogAllowed"
                  checked={formData.backlogAllowed}
                  onChange={handleInputChange}
                  style={styles.checkbox}
                />
                <span>Yes, backlogs are allowed</span>
              </div>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Allowed Branches/Streams *</label>
            <div style={styles.arrayInput}>
              <input
                type="text"
                placeholder="Add branch (e.g., Computer Science)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput('allowedBranches', e.target.value);
                    e.target.value = '';
                  }
                }}
                style={styles.input}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  handleArrayInput('allowedBranches', input.value);
                  input.value = '';
                }}
                style={styles.addButton}
              >
                Add
              </button>
            </div>
            <div style={styles.arrayDisplay}>
              {formData.allowedBranches.map((branch, index) => (
                <span key={index} style={styles.arrayItem}>
                  {branch}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('allowedBranches', index)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Required Skills</label>
            <div style={styles.arrayInput}>
              <input
                type="text"
                placeholder="Add skill (e.g., React, Python)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput('requiredSkills', e.target.value);
                    e.target.value = '';
                  }
                }}
                style={styles.input}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  handleArrayInput('requiredSkills', input.value);
                  input.value = '';
                }}
                style={styles.addButton}
              >
                Add
              </button>
            </div>
            <div style={styles.arrayDisplay}>
              {formData.requiredSkills.map((skill, index) => (
                <span key={index} style={styles.arrayItem}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requiredSkills', index)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Selection Process</h2>
          <div style={styles.checkboxGrid}>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="selectionProcess.prePlacementTalk"
                checked={formData.selectionProcess.prePlacementTalk}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              <span>Pre-placement Talk</span>
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="selectionProcess.writtenTest"
                checked={formData.selectionProcess.writtenTest}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              <span>Written Test</span>
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="selectionProcess.groupDiscussion"
                checked={formData.selectionProcess.groupDiscussion}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              <span>Group Discussion</span>
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="selectionProcess.technicalInterview"
                checked={formData.selectionProcess.technicalInterview}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              <span>Technical Interview</span>
            </div>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="selectionProcess.hrInterview"
                checked={formData.selectionProcess.hrInterview}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              <span>HR Interview</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Additional Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Positions *</label>
              <input
                type="number"
                name="numberOfPositions"
                value={formData.numberOfPositions}
                onChange={handleInputChange}
                style={styles.input}
                min="1"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Application Deadline *</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recruiter Contact Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Recruiter Name *</label>
              <input
                type="text"
                name="recruiterName"
                value={formData.recruiterName}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Recruiter Email *</label>
              <input
                type="email"
                name="recruiterEmail"
                value={formData.recruiterEmail}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Recruiter Phone</label>
              <input
                type="tel"
                name="recruiterPhone"
                value={formData.recruiterPhone}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Additional Notes</h2>
          <div style={styles.formGroup}>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              style={{...styles.input, height: '100px'}}
              placeholder="Any additional instructions or notes for applicants..."
            />
          </div>
        </div>

        {mode !== 'view' && (
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onCancel || (() => navigate('/company/dashboard'))}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : 
               (mode === 'edit' ? 'Update Job Posting' : 'Create Job Posting')}
            </button>
          </div>
        )}
        {mode === 'view' && (
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onCancel || (() => navigate('/company/dashboard'))}
              style={styles.cancelButton}
            >
              Close
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  viewContainer: {
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
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  form: {
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  section: {
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
  },
  arrayInput: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  addButton: {
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  arrayDisplay: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  arrayItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#e9ecef',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '14px',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'flex-end',
    marginTop: '30px',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

export default JobPostingForm;
