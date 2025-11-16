import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import './components/department/DepartmentDashboard.css';

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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [studentUSN, setStudentUSN] = useState("");

  useEffect(() => {
    // Try to load basic student profile (if exists) to compute completeness
    const userUSN = localStorage.getItem("userUSN");
    setStudentUSN(userUSN || "");
    if (!userUSN) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${userUSN}`);
        if (res.data?.success && res.data.student) {
          const s = res.data.student;
          const required = [s.usn, s.name, s.email, s.phone, s.skills];
          const filled = required.filter(Boolean).length;
          const pct = Math.round((filled / required.length) * 100);
          setProfileCompletion(pct);
        } else {
          setProfileCompletion(0);
        }
      } catch (e) {
        setProfileCompletion(0);
      }
    };
    fetchProfile();
  }, []);

  // Click-away handler for dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".profile-dropdown-anchor")) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileDropdownOpen]);

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
            {/* Profile Icon & Dropdown */}
            <div
              className="profile-dropdown-anchor"
              style={styles.profileContainer}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              tabIndex={0}
              role="button"
            >
              <ProfileIcon />
              {profileDropdownOpen && (
                <div style={styles.profileDropdown}>
                  <div style={styles.dropdownUsn}>{studentUSN || 'Student'}</div>
                  <button 
                    style={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(false);
                      navigate('/logout');
                    }}>
                    Logout
                  </button>
                </div>
              )}
                </div>
              
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main style={styles.mainContent}>
        <h2 style={styles.pageHeading}>🎓 Student Dashboard</h2>
        {profileCompletion !== null && (
          <div style={styles.completenessCard} className="dashboard-widget">
            <div style={styles.completenessHeader}>
              <span>Profile Completeness</span>
              <strong>{profileCompletion}%</strong>
            </div>
            <div style={styles.progressBarWrap}>
              <div style={{ ...styles.progressBarFill, width: `${profileCompletion}%` }} />
            </div>
            <div style={styles.completenessActions}>
              <button style={styles.smallBtn} onClick={() => navigate('/student-profile')}>Edit Profile</button>
              <button style={styles.smallBtnSecondary} onClick={() => navigate('/student-profile')}>View Profile</button>
            </div>
          </div>
        )}

        <div style={styles.featuresGrid}>
          {/* 1. Profile Management */}
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.cardHeader} className="cardHeader">
              <h3 style={styles.cardTitle}>👤 Profile Management</h3>
              <div style={styles.cardActionsRow}>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-profile')}>View Profile</button>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-profile-form')}>Edit Profile</button>
              </div>
            </div>
            <div style={styles.cardContent}>
              <p>View and edit personal details (contact, academics, skills). Upload/download resume and certificates.</p>
             
            </div>
          </div>

          {/* Student Profile Info Form */}
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.cardHeader} className="cardHeader">
              <h3 style={styles.cardTitle}>📝 Student Profile Info Form</h3>
              <div style={styles.cardActions}>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-profile-form')}>View</button>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-profile-form')}>Edit</button>
              </div>
            </div>
            <div style={styles.cardContent}>
              <p>Manage your detailed profile form with academics, documents, and preferences.</p>
            </div>
          </div>

          {/* 2. Job & Internship Listings */}
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.cardHeader} className="cardHeader">
              <h3 style={styles.cardTitle}>💼 Job & Internship Listings</h3>
              <div style={styles.cardActions}>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-job-postings')}>Browse Listings</button>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-my-application')}>My Applications</button>
              </div>
            </div>
            <div style={styles.cardContent}>
              <p>Browse openings, see eligibility, and apply directly. Track application status.</p>
            </div>
          </div>

          {/* 3. Applied Opportunities */}
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.cardHeader} className="cardHeader">
              <h3 style={styles.cardTitle}>📄 Applied Opportunities</h3>
              <div style={styles.cardActions}>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-applied-jobs')}>View Applied</button>
              </div>
            </div>
            <div style={styles.cardContent}>
              <p>See applied jobs/internships and live status. Jump to interview details.</p>
            </div>
          </div>

          {/* 4. Interview Schedule & Diary */}
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.cardHeader} className="cardHeader">
              <h3 style={styles.cardTitle}>📅 Interview Schedule & Diary</h3>
              <div style={styles.cardActions}>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/student-interview-schedule')}>Open Calendar</button>
              </div>
            </div>
            <div style={styles.cardContent}>
              <p>Calendar of upcoming interviews/tests. Add notes after interviews.</p>
            </div>
          </div>

          {/* Notices & Communication */}
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.cardHeader} className="cardHeader">
              <h3 style={styles.cardTitle}>📢 Notices & Communication</h3>
              <div style={styles.cardActions}>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/notices')}>Open Notices</button>
                <button className="actionBtn" style={styles.actionBtn} onClick={() => navigate('/messages')}>Messages</button>
              </div>
            </div>
            <div style={styles.cardContent}>
              <p>Bulletin board for official notices and messaging with the placement cell.</p>
            </div>
          </div>
      </div>

      </main>
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
  dropdownUsn: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '14px 16px 6px 16px',
    borderBottom: '1px solid #446',
    backgroundColor: 'transparent',
    textAlign: 'left'
  },
  mainContent: {
    paddingTop: '180px',
    paddingBottom: '160px',
    maxWidth: '1100px',
    margin: '0 auto',
    textAlign: 'center',
  },
  pageHeading: {
    margin: '0 auto 26px',
    fontSize: '2.4rem',
    fontWeight: 800,
    color: '#1976d2',
    letterSpacing: '0.5px',
    textAlign: 'center',
  },
  completenessCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    textAlign: 'left',
  },
  completenessHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontWeight: 600,
    color: '#1a237e',
  },
  progressBarWrap: {
    height: '10px',
    background: '#eee',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #42a5f5, #1976d2)',
  },
  completenessActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
  },
  smallBtn: {
    padding: '8px 14px',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  smallBtnSecondary: {
    padding: '8px 14px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '34px',
    marginTop: '34px',
  },
  featureCard: {
    background: 'white',
    borderRadius: '18px',
    padding: 0,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'left',
    overflow: 'hidden',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #1976d2, #1565c0)',
    color: 'white',
    padding: '18px 22px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  cardTitle: { margin: 0, fontSize: '1.2rem', fontWeight: '600' },
  cardActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  actionBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  cardContent: { padding: '20px 20px 14px', minHeight: '140px' },
  featureTitle: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#1a237e',
    marginBottom: '10px',
    letterSpacing: '0.3px',
  },
  cardActionsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginTop: '10px',
    marginBottom: '2px',
  },
  cardBtn: {
    padding: '10px 14px',
    background: '#f0f2f5',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  cardBtnPrimary: {
    padding: '10px 14px',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 14px',
    background: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #bbdefb',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  actionButtonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    marginTop: '40px',
    padding: '20px',
    maxWidth: '800px',
    margin: '40px auto 0',
  },
  actionButton: {
    padding: '30px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontSize: '18px',
    cursor: 'pointer',
    width: '100%',
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    fontWeight: '600',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    transform: 'translateY(0)',
  },
  actionButtonHovered: {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  },
  buttonIcon: {
    fontSize: '32px',
    transition: 'transform 0.3s ease',
  },
  buttonText: {
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textAlign: 'center',
  },
};

export default StudentDashboard;
