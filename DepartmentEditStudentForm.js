import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepartmentEditStudentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentData } = location.state || {};

  const [form, setForm] = useState({
    usn: '',
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
    area: '',
    category: '',
    caste: '',
    familyIncome: '',
    aadhar: '',
    department: '',
    currentSemester: '',
    tenthGrade: '',
    secondPUC: '',
    isDiploma: false,
    diplomaCGPA: '',
    semesters: Array(8).fill(''),
    internshipInterest: '',
    projects: '',
    internships: '',
    profilePhoto: null,
    resume: null
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [hasExistingPhoto, setHasExistingPhoto] = useState(false);
  const [hasExistingResume, setHasExistingResume] = useState(false);

  useEffect(() => {
    if (!studentData) {
      toast.error('No student data provided');
      navigate('/department-student-profile-form');
      return;
    }

    console.log('Received student data:', studentData);

    // Populate form with existing student data
    setForm({
      usn: studentData.usn || '',
      name: studentData.name || '',
      email: studentData.email || '',
      phone: studentData.phone || '',
      gender: studentData.gender || '',
      dob: studentData.dob ? new Date(studentData.dob).toISOString().split('T')[0] : '',
      address: studentData.address || '',
      area: studentData.area || '',
      category: studentData.category || '',
      caste: studentData.caste || '',
      familyIncome: studentData.familyIncome || '',
      aadhar: studentData.aadhar || '',
      department: studentData.department || '',
      currentSemester: studentData.currentSemester || '',
      tenthGrade: studentData.tenthGrade || '',
      secondPUC: studentData.secondPUC || '',
      isDiploma: studentData.isDiploma || false,
      diplomaCGPA: studentData.diplomaCGPA || '',
      semesters: Array.isArray(studentData.semesters) ? studentData.semesters.map(s => s || '') : Array(8).fill(''),
      internshipInterest: studentData.internshipInterest || '',
      projects: studentData.projects || '',
      internships: studentData.internships || '',
      profilePhoto: null,
      resume: null
    });

    // Set existing photo preview
    if (studentData.profilePhoto && studentData.profilePhoto !== 'pending-upload.jpg') {
      const photoUrl = `http://localhost:5000/api/profileform/uploads/${studentData.profilePhoto}`;
      setPreviewUrl(photoUrl);
      setHasExistingPhoto(true);
    }

    // Set existing resume info
    if (studentData.resume && studentData.resume !== 'pending-upload.pdf') {
      setResumeName(studentData.resume);
      setHasExistingResume(true);
    }
  }, [navigate, studentData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSemesterChange = (index, value) => {
    const newSemesters = [...form.semesters];
    newSemesters[index] = value;
    setForm(prev => ({ ...prev, semesters: newSemesters }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
      
      if (name === 'profilePhoto') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(files[0]);
      } else if (name === 'resume') {
        setResumeName(files[0].name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(form).forEach(key => {
        if (key === 'semesters') {
          formData.append(key, JSON.stringify(form[key]));
        } else if (key === 'profilePhoto' || key === 'resume') {
          if (form[key]) {
            formData.append(key, form[key]);
          }
        } else {
          formData.append(key, form[key]);
        }
      });

      const response = await axios.put(
        `http://localhost:5000/api/profileform/${studentData.usn}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Student profile updated successfully!');
        navigate('/department-student-profile-form');
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>COLLEGE PLACEMENT PORTAL</h1>
          <nav style={styles.nav}>
            <button onClick={() => navigate('/department-student-profile-form')} style={styles.backButton}>
              ← Back to List
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Edit Student Profile Form</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Profile Photo */}
          <div style={styles.photoSection}>
            <div style={styles.photoContainer}>
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" style={styles.profilePhoto} />
              ) : (
                <div style={styles.photoPlaceholder}>
                  <span style={styles.photoIcon}>📷</span>
                  <span>Profile Photo</span>
                </div>
              )}
            </div>
            <div style={styles.photoActions}>
              <label htmlFor="profilePhoto" style={styles.photoLabel}>
                📸 {hasExistingPhoto ? 'Change Photo' : 'Add Photo'}
              </label>
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>USN <span style={styles.required}>*</span></label>
                <input
                  type="text"
                  name="usn"
                  value={form.usn}
                  disabled
                  style={{...styles.input, backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email <span style={styles.required}>*</span></label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone <span style={styles.required}>*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  maxLength="10"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Gender <span style={styles.required}>*</span></label>
                <select name="gender" value={form.gender} onChange={handleChange} required style={styles.input}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth <span style={styles.required}>*</span></label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address <span style={styles.required}>*</span></label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Area <span style={styles.required}>*</span></label>
                <select name="area" value={form.area} onChange={handleChange} required style={styles.input}>
                  <option value="">Select Area</option>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category <span style={styles.required}>*</span></label>
                <select name="category" value={form.category} onChange={handleChange} required style={styles.input}>
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Caste <span style={styles.required}>*</span></label>
                <input
                  type="text"
                  name="caste"
                  value={form.caste}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Family Income <span style={styles.required}>*</span></label>
                <input
                  type="number"
                  name="familyIncome"
                  value={form.familyIncome}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Aadhar Number <span style={styles.required}>*</span></label>
                <input
                  type="text"
                  name="aadhar"
                  value={form.aadhar}
                  onChange={handleChange}
                  required
                  maxLength="12"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Academic Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current Semester <span style={styles.required}>*</span></label>
                <select name="currentSemester" value={form.currentSemester} onChange={handleChange} required style={styles.input}>
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>10th Grade % <span style={styles.required}>*</span></label>
                <input
                  type="number"
                  name="tenthGrade"
                  value={form.tenthGrade}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>2nd PUC % <span style={styles.required}>*</span></label>
                <input
                  type="number"
                  name="secondPUC"
                  value={form.secondPUC}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isDiploma"
                    checked={form.isDiploma}
                    onChange={handleChange}
                  />
                  <span style={{marginLeft: '8px'}}>Diploma Student</span>
                </label>
              </div>

              {form.isDiploma && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Diploma CGPA</label>
                  <input
                    type="number"
                    name="diplomaCGPA"
                    value={form.diplomaCGPA}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    step="0.01"
                    style={styles.input}
                  />
                </div>
              )}
            </div>

            {/* Semester Grades */}
            <div style={styles.semesterSection}>
              <h4 style={styles.subTitle}>Semester Grades (CGPA)</h4>
              <div style={styles.semesterGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem, index) => (
                  <div key={sem} style={styles.formGroup}>
                    <label style={styles.label}>Semester {sem}</label>
                    <input
                      type="number"
                      value={form.semesters[index]}
                      onChange={(e) => handleSemesterChange(index, e.target.value)}
                      min="0"
                      max="10"
                      step="0.01"
                      style={styles.input}
                      placeholder="CGPA"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Career Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Career Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Internship Interest <span style={styles.required}>*</span></label>
                <select name="internshipInterest" value={form.internshipInterest} onChange={handleChange} required style={styles.input}>
                  <option value="">Select Interest</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="DevOps">DevOps</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Projects</label>
                <textarea
                  name="projects"
                  value={form.projects}
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                  placeholder="Describe your projects"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Internships</label>
                <textarea
                  name="internships"
                  value={form.internships}
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                  placeholder="Describe your internship experience"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Resume</h3>
            <div style={styles.fileUpload}>
              {resumeName && (
                <p style={styles.fileName}>
                  Current Resume: <strong>{resumeName}</strong>
                  {hasExistingResume && (
                    <a 
                      href={`http://localhost:5000/api/profileform/uploads/${resumeName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.viewLink}
                    >
                      View
                    </a>
                  )}
                </p>
              )}
              <label htmlFor="resume" style={styles.fileLabel}>
                📄 {hasExistingResume ? 'Change Resume' : 'Upload Resume'} (PDF only)
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={styles.submitSection}>
            <button type="button" onClick={() => navigate('/department-student-profile-form')} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              💾 Update Profile
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
  backButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  pageTitle: {
    fontSize: '2rem',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: '30px',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
  },
  photoContainer: {
    width: '200px',
    height: '200px',
    marginBottom: '15px',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '4px solid #1976d2',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    border: '4px dashed #ddd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: '#fff',
  },
  photoIcon: {
    fontSize: '48px',
  },
  photoActions: {
    display: 'flex',
    gap: '10px',
  },
  photoLabel: {
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#1976d2',
    marginBottom: '20px',
    fontWeight: '600',
    borderBottom: '2px solid #1976d2',
    paddingBottom: '10px',
  },
  subTitle: {
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '15px',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  semesterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#f44336',
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  textarea: {
    padding: '10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  fileUpload: {
    textAlign: 'center',
    padding: '20px',
    border: '2px dashed #1976d2',
    borderRadius: '10px',
    backgroundColor: '#fff',
  },
  fileName: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
  },
  viewLink: {
    marginLeft: '10px',
    color: '#1976d2',
    textDecoration: 'none',
    fontWeight: '600',
  },
  fileLabel: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  submitSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '2px solid #e0e0e0',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  submitButton: {
    padding: '12px 30px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  semesterSection: {
    marginTop: '20px',
  },
};

export default DepartmentEditStudentForm;
