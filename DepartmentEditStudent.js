import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Profile Icon Component
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

const DepartmentEditStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentData = location.state?.studentData;

  const [form, setForm] = useState({
    usn: '',
    name: '',
    phone: '',
    email: '',
    gender: '',
    skills: '',
    address: '',
    interest: '',
    collegeName: '',
    currentSemester: '',
    cgpa: '',
    profilePhoto: null,
    resume: null
  });

  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({ resume: null });
  const [hasExistingPhoto, setHasExistingPhoto] = useState(false);

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

    if (!studentData) {
      toast.error('No student data provided');
      navigate('/department-student-profile');
      return;
    }

    console.log('Received student data:', studentData);
    console.log('Profile photo data:', studentData.profilePhoto);
    console.log('Resume data:', studentData.resume);

    // Populate form with existing student data (StudentProfile fields only)
    setForm({
      usn: studentData.usn || '',
      name: studentData.name || '',
      phone: studentData.phone || '',
      email: studentData.email || '',
      gender: studentData.gender || '',
      skills: studentData.skills || '',
      address: studentData.address || '',
      interest: studentData.interest || '',
      collegeName: studentData.collegeName || '',
      currentSemester: studentData.currentSemester || '',
      cgpa: studentData.cgpa || '',
      profilePhoto: null,
      resume: null
    });

    // Set profile photo preview if exists
    if (studentData.profilePhoto && studentData.profilePhoto.filename) {
      const photoUrl = `http://localhost:5000/api/profile/uploads/${studentData.profilePhoto.filename}`;
      setPreviewUrl(photoUrl);
      setHasExistingPhoto(true);
      console.log('Loading existing profile photo:', photoUrl);
    } else {
      setPreviewUrl('https://via.placeholder.com/250');
      setHasExistingPhoto(false);
    }

    // Set resume info if exists
    if (studentData.resume && studentData.resume.filename) {
      setUploadedFiles({ resume: { name: studentData.resume.filename } });
      console.log('Loading existing resume:', studentData.resume.filename);
    }
  }, [navigate, studentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (name === 'profilePhoto' && files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, profilePhoto: 'Profile photo must be under 10MB' }));
        return;
      }
      setForm(prev => ({ ...prev, profilePhoto: file }));
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
      
      // Preview
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else if (name === 'resume' && files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, resume: 'Resume must be under 10MB' }));
        return;
      }
      setForm(prev => ({ ...prev, resume: file }));
      setUploadedFiles({ resume: file });
      setErrors(prev => ({ ...prev, resume: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('usn', form.usn);
      formDataToSend.append('name', form.name);
      formDataToSend.append('phone', form.phone);
      formDataToSend.append('email', form.email);
      formDataToSend.append('gender', form.gender);
      formDataToSend.append('skills', form.skills);
      formDataToSend.append('address', form.address);
      formDataToSend.append('interest', form.interest);
      formDataToSend.append('collegeName', form.collegeName);
      formDataToSend.append('currentSemester', form.currentSemester);
      formDataToSend.append('cgpa', form.cgpa);

      // Append files if new ones uploaded
      if (form.profilePhoto) {
        formDataToSend.append('profilePhoto', form.profilePhoto);
      }
      if (form.resume) {
        formDataToSend.append('resume', form.resume);
      }

      // Update via StudentProfile API
      const response = await axios.post(
        'http://localhost:5000/api/profile',
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        toast.success('Student profile updated successfully!');
        navigate('/department-student-profile');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.response?.data?.message || 'Error updating student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/department-student-profile');
  };

  const handleLogout = () => {
    localStorage.removeItem("departmentToken");
    localStorage.removeItem("departmentInfo");
    navigate("/logout");
  };

  return (
    <div style={styles.pageContainer}>
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
              <button style={styles.navButton} onClick={() => navigate('/department/dashboard')}>Dashboard</button>
            </nav>
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
                  <div style={styles.dropdownUsn}>{departmentInfo?.name || 'Department'}</div>
                  <button 
                    style={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{...styles.mainContent, paddingTop: '160px'}}> 
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>EDIT STUDENT PROFILE</h1>
        </div>

        {/* Profile Photo Section - Centered Square Shape */}
        <div style={styles.profilePhotoSection}>
          <div style={styles.photoContainer}>
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                style={styles.profilePhoto}
                onError={(e) => {
                  console.error('Error loading image:', previewUrl);
                  e.target.src = 'https://via.placeholder.com/250';
                }}
              />
            ) : (
              <div style={styles.placeholderPhoto}>
                <span style={styles.placeholderIcon}>👤</span>
                <span style={styles.placeholderText}>No Photo</span>
              </div>
            )}
            <div style={styles.uploadOverlay}>
              <label htmlFor="profilePhoto" style={styles.uploadLabel}>
                <span style={styles.cameraIcon}>📸</span>
                <span style={styles.uploadText}>Add Photo</span>
              </label>
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
            </div>
            {errors.profilePhoto && <span style={styles.errorText}>{errors.profilePhoto}</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            
            <div style={styles.formSection}>
              <label style={styles.label}>USN</label>
              <input
                type="text"
                name="usn"
                value={form.usn}
                onChange={handleChange}
                style={styles.input}
                required
                readOnly
              />
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter 10-digit phone number"
                value={form.phone}
                onChange={handleChange}
                maxLength="10"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Gmail address"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>Address</label>
              <textarea
                name="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
                style={{...styles.input, minHeight: '90px'}}
                required
              />
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>Area of Interest</label>
              <select
                name="interest"
                value={form.interest}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Interest</option>
                <option value="Software Development">Software Development</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="DevOps">DevOps</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Embedded Systems">Embedded Systems</option>
                <option value="VLSI">VLSI</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Academic Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Academic Information</h3>
            
            <div style={styles.formSection}>
              <label style={styles.label}>College Name</label>
              <input
                type="text"
                name="collegeName"
                placeholder="Enter college name"
                value={form.collegeName}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>Current Semester</label>
              <select
                name="currentSemester"
                value={form.currentSemester}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={styles.formSection}>
              <label style={styles.label}>CGPA</label>
              <input
                type="number"
                name="cgpa"
                placeholder="Enter CGPA (0-10)"
                value={form.cgpa}
                onChange={handleChange}
                style={styles.input}
                min="0"
                max="10"
                step="0.01"
              />
            </div>
          </div>

          {/* Skills Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Skills & Expertise</h3>
            
            <div style={styles.formSection}>
              <label style={styles.label}>Skills</label>
              <textarea
                name="skills"
                placeholder="Enter skills (comma separated)"
                value={form.skills}
                onChange={handleChange}
                style={{...styles.input, minHeight: '110px'}}
              />
              <small style={{color:'#666'}}>Example: Java, React, SQL</small>
            </div>
          </div>

          {/* File Upload Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Documents</h3>
            
            <div style={styles.formSection}>
              <label style={styles.label}>Resume</label>
              {uploadedFiles.resume && (
                <div style={styles.currentFileInfo}>
                  <span style={styles.currentFileLabel}>Current Resume:</span>
                  <a 
                    href={`http://localhost:5000/api/profile/uploads/${uploadedFiles.resume.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.resumeLink}
                  >
                    📄 {uploadedFiles.resume.name}
                  </a>
                </div>
              )}
              <div style={styles.fileUploadContainer}>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={styles.fileInputHidden}
                  id="resume"
                />
                <label htmlFor="resume" style={styles.fileUploadLabel}>
                  <span style={styles.uploadIcon}>📄</span>
                  {form.resume ? form.resume.name : (uploadedFiles.resume ? "Change Resume" : "Upload Resume")}
                </label>
                <p style={styles.helpText}>Maximum file size: 10MB</p>
              </div>
              {errors.resume && <span style={styles.errorText}>{errors.resume}</span>}
            </div>
          </div>

          {errors.submit && <div style={styles.errorBox}>{errors.submit}</div>}

          <div style={styles.formActions}>
            <button type="submit" style={styles.submitButton}>
              {loading ? 'Updating Profile...' : 'Update Profile'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
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
  headerLeft: { flex: 1 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  siteTitle: { margin: 0, fontSize: '28px', fontWeight: 'bold', letterSpacing: '3px', textAlign: 'left', textTransform: 'uppercase' },
  navigation: { display: 'flex', alignItems: 'center', gap: '15px' },
  navLink: { color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: '500', padding: '12px 16px', borderRadius: '6px', transition: 'all 0.3s ease' },
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
  iconWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
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
  profileContainer: {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
  dropdownUsn: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative',
  },
  pageHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  pageTitle: {
    fontSize: '2.2rem',
    color: '#1976d2',
    marginBottom: '10px',
    fontWeight: '700',
  },
  profilePhotoSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
  },
  photoContainer: {
    position: 'relative',
    width: '200px',
    height: '200px',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '4px solid #1976d2',
    display: 'block',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    border: '4px solid #1976d2',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  placeholderIcon: {
    fontSize: '60px',
    color: '#999',
  },
  placeholderText: {
    fontSize: '14px',
    color: '#999',
    fontWeight: '500',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
    borderRadius: '0 0 8px 8px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: 'white',
  },
  cameraIcon: {
    fontSize: '18px',
  },
  uploadText: {
    fontSize: '13px',
    color: 'white',
    fontWeight: '600',
  },
  fileInput: {
    display: 'none',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#1976d2',
    marginBottom: '20px',
    fontWeight: '600',
    borderBottom: '2px solid #1976d2',
    paddingBottom: '8px',
  },
  formSection: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  },
  fileUploadContainer: {
    marginTop: '8px',
  },
  fileInputHidden: {
    display: 'none',
  },
  fileUploadLabel: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#f0f0f0',
    border: '2px dashed #1976d2',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1976d2',
    transition: 'all 0.3s',
  },
  uploadIcon: {
    marginRight: '8px',
  },
  helpText: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
  },
  currentFileInfo: {
    backgroundColor: '#e3f2fd',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  currentFileLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1976d2',
  },
  currentFileName: {
    fontSize: '13px',
    color: '#333',
  },
  resumeLink: {
    fontSize: '13px',
    color: '#1976d2',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s',
  },
  errorText: {
    display: 'block',
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '5px',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '30px',
  },
  submitButton: {
    padding: '12px 30px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: 'white',
    color: '#666',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};

export default DepartmentEditStudent;
