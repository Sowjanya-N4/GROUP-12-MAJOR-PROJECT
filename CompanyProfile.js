import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    foundedYear: '',
    contactPerson: '',
    contactPersonEmail: '',
    contactPersonPhone: ''
  });
  const [errors, setErrors] = useState({});

  // Date limits for Founded Year (calendar input)
  const today = new Date();
  const currentYear = today.getFullYear();
  const maxFoundedDate = today.toISOString().slice(0, 10); // allow up to today (e.g., 2025-09-11)
  const minFoundedDate = '1800-01-01';

  const fetchCompanyProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('companyToken');
      if (!token) {
        navigate('/company-login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/company/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setFormData(response.data);
        setProfileExists(true);
        // Respect route state mode when profile exists
        const routeMode = location.state?.mode;
        if (routeMode === 'edit') {
          setEditing(true);
        } else if (routeMode === 'view') {
          setEditing(false);
        } else if (!response.data.companyName) {
          // First-time setup
          setEditing(true);
        }
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      if (error.response?.status === 404) {
        // Profile doesn't exist yet, show create form
        setProfileExists(false);
        // If no profile, always enter editing to create
        setEditing(true);
      } else {
        toast.error('Error fetching company profile');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location.state]);

  useEffect(() => {
    fetchCompanyProfile();
  }, [fetchCompanyProfile]);

  const onlyLettersAndSpaces = (text) => text.replace(/[^a-zA-Z\s]/g, '');
  const onlyDigits = (text) => text.replace(/\D/g, '');
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;
    // Field-specific sanitization
    if (name === 'companyName') {
      nextValue = onlyLettersAndSpaces(value);
    } else if (name === 'email') {
      nextValue = value.toLowerCase();
    } else if (name === 'phone') {
      nextValue = onlyDigits(value).slice(0, 10);
    } else if (name === 'industry' || name === 'city' || name === 'state' || name === 'contactPerson') {
      nextValue = onlyLettersAndSpaces(value);
    } else if (name === 'pincode') {
      nextValue = onlyDigits(value).slice(0, 6);
    } else if (name === 'contactPersonEmail') {
      nextValue = value.toLowerCase();
    } else if (name === 'contactPersonPhone') {
      nextValue = onlyDigits(value).slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: nextValue }));
    // Clear error for this field while typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Company Name: required, letters/spaces only
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (/[^a-zA-Z\s]/.test(formData.companyName)) {
      newErrors.companyName = 'Only alphabets and spaces allowed';
    }

    // Email: required, lowercase and must end with @gmail.com
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (formData.email !== formData.email.toLowerCase()) {
      newErrors.email = 'Email must be lowercase';
    } else if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Email must be a valid @gmail.com address';
    }

    // Phone: optional but if present must be 10 digits
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    // Industry/City/State/Contact Person: if present, letters/spaces only
    ['industry', 'city', 'state', 'contactPerson'].forEach((field) => {
      if (formData[field] && /[^a-zA-Z\s]/.test(formData[field])) {
        newErrors[field] = 'Only alphabets and spaces allowed';
      }
    });

    // Founded Year: if present, valid range
    if (formData.foundedYear) {
      const date = new Date(formData.foundedYear);
      const year = date.getFullYear();
      if (isNaN(date.getTime()) || year < 1800 || date.getTime() > today.getTime()) {
        newErrors.foundedYear = `Choose a valid date up to today (year 1800 to ${currentYear})`;
      }
    }

    // Pincode: if present, digits only 6 length
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    // Contact Person Email: if present, any valid email but lowercase
    if (formData.contactPersonEmail) {
      if (formData.contactPersonEmail !== formData.contactPersonEmail.toLowerCase()) {
        newErrors.contactPersonEmail = 'Email must be lowercase';
      } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.contactPersonEmail)) {
        newErrors.contactPersonEmail = 'Enter a valid email address';
      }
    }

    // Contact Person Phone: if present must be 10 digits
    if (formData.contactPersonPhone && !/^\d{10}$/.test(formData.contactPersonPhone)) {
      newErrors.contactPersonPhone = 'Phone must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('companyToken');
      const url = profileExists 
        ? 'http://localhost:5000/api/company/profile'
        : 'http://localhost:5000/api/company/profile';
      const method = profileExists ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(profileExists 
          ? 'Company profile updated successfully!' 
          : 'Company profile created successfully!');
        setProfileExists(true);
        setEditing(false);
        // Refresh the profile data
        fetchCompanyProfile();
      }
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast.error('Error saving company profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading company profile...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {profileExists ? 'Company Profile' : 'Create Company Profile'}
        </h1>
        <div style={styles.headerActions}>
          {!editing ? (
            <button 
              style={styles.editButton}
              onClick={() => setEditing(true)}
            >
              ✏️ {profileExists ? 'Edit Profile' : 'Create Profile'}
            </button>
          ) : (
            <div style={styles.editActions}>
              <button 
                style={styles.cancelButton}
                onClick={() => {
                  setEditing(false);
                  if (profileExists) {
                    fetchCompanyProfile();
                  }
                }}
              >
                Cancel
              </button>
              <button 
                style={styles.saveButton}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : (profileExists ? 'Save Changes' : 'Create Profile')}
              </button>
            </div>
          )}
          <button 
            style={styles.backButton}
            onClick={() => navigate('/company/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {(!profileExists || editing) && (
        <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
                required
              />
              {errors.companyName && <div style={styles.errorText}>{errors.companyName}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
                required
              />
              {errors.email && <div style={styles.errorText}>{errors.email}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
              />
              {errors.phone && <div style={styles.errorText}>{errors.phone}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
                placeholder="https://example.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
                placeholder="e.g., Technology, Healthcare, Finance"
              />
              {errors.industry && <div style={styles.errorText}>{errors.industry}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Size</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Founded Year</label>
              <input
                type="date"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
                min={minFoundedDate}
                max={maxFoundedDate}
              />
              {errors.foundedYear && <div style={styles.errorText}>{errors.foundedYear}</div>}
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Address Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={{...styles.input, height: '80px'}}
                disabled={!editing}
                placeholder="Street address, building, etc."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
              />
              {errors.city && <div style={styles.errorText}>{errors.city}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
              />
              {errors.state && <div style={styles.errorText}>{errors.state}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
                maxLength="6"
              />
              {errors.pincode && <div style={styles.errorText}>{errors.pincode}</div>}
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact Person Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Person Name</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
              />
              {errors.contactPerson && <div style={styles.errorText}>{errors.contactPerson}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Person Email</label>
              <input
                type="email"
                name="contactPersonEmail"
                value={formData.contactPersonEmail}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
              />
              {errors.contactPersonEmail && <div style={styles.errorText}>{errors.contactPersonEmail}</div>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Person Phone</label>
              <input
                type="tel"
                name="contactPersonPhone"
                value={formData.contactPersonPhone}
                onChange={handleInputChange}
                style={styles.input}
                disabled={!editing}
                maxLength="10"
              />
              {errors.contactPersonPhone && <div style={styles.errorText}>{errors.contactPersonPhone}</div>}
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Company Description</h2>
          <div style={styles.formGroup}>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={{...styles.input, height: '120px'}}
              disabled={!editing}
              placeholder="Describe your company, its mission, values, and what makes it unique..."
            />
          </div>
        </div>
        </form>
      )}

      {profileExists && !editing && (
        <div style={styles.profileDisplay}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Basic Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Company Name:</label>
                <span style={styles.infoValue}>{formData.companyName}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Email:</label>
                <span style={styles.infoValue}>{formData.email}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Phone:</label>
                <span style={styles.infoValue}>{formData.phone || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Website:</label>
                <span style={styles.infoValue}>
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" style={styles.link}>
                      {formData.website}
                    </a>
                  ) : 'Not provided'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Industry:</label>
                <span style={styles.infoValue}>{formData.industry || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Company Size:</label>
                <span style={styles.infoValue}>{formData.companySize || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Founded Year:</label>
                <span style={styles.infoValue}>{formData.foundedYear || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Address Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Address:</label>
                <span style={styles.infoValue}>{formData.address || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>City:</label>
                <span style={styles.infoValue}>{formData.city || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>State:</label>
                <span style={styles.infoValue}>{formData.state || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Pincode:</label>
                <span style={styles.infoValue}>{formData.pincode || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Person Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Contact Person:</label>
                <span style={styles.infoValue}>{formData.contactPerson || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Contact Email:</label>
                <span style={styles.infoValue}>{formData.contactPersonEmail || 'Not provided'}</span>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.infoLabel}>Contact Phone:</label>
                <span style={styles.infoValue}>{formData.contactPersonPhone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {formData.description && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Company Description</h2>
              <p style={styles.descriptionText}>{formData.description}</p>
            </div>
          )}
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
    alignItems: 'center',
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
  editActions: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    padding: '12px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  saveButton: {
    padding: '12px 20px',
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
  errorText: {
    color: '#d32f2f',
    fontSize: '0.85rem',
    marginTop: '6px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: '#f8f9fa',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666',
  },
  
  profileDisplay: {
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  infoItem: {
    marginBottom: '15px',
  },
  infoLabel: {
    display: 'block',
    fontWeight: '600',
    color: '#333',
    marginBottom: '5px',
  },
  infoValue: {
    color: '#666',
    fontSize: '16px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
  descriptionText: {
    color: '#666',
    lineHeight: '1.6',
    fontSize: '16px',
    margin: 0,
  },
};

export default CompanyProfile;
