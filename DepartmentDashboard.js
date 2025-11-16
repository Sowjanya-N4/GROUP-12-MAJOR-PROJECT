import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './DepartmentDashboard.css';

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

// Dashboard Overview Widget Component
const DashboardWidget = ({ icon, title, value, subtitle, color, onClick }) => (
  <div 
    style={{...styles.widget, borderLeft: `4px solid ${color}`}} 
    onClick={onClick}
    className="dashboard-widget"
  >
    <div style={styles.widgetIcon}>{icon}</div>
    <div style={styles.widgetContent}>
      <h3 style={styles.widgetTitle}>{title}</h3>
      <div style={{...styles.widgetValue, color}}>{value}</div>
      <p style={styles.widgetSubtitle}>{subtitle}</p>
    </div>
  </div>
);

// Student Management Card Component
const StudentManagementCard = ({ navigate, dashboardData }) => (
  <div style={styles.featureCard} className="feature-card">
    <div style={styles.cardHeader}>
      <h3 style={styles.cardTitle}>👥 Student Management</h3>
      <div style={styles.cardActions}>
        <button 
          style={styles.actionBtn}
          onClick={() => navigate('/department-student-profile')}
        >
          Student Profile
        </button>
        <button 
          style={styles.actionBtn}
          onClick={() => navigate('/department-student-profile-form')}
        >
          Student Profile Form
        </button>
      </div>
    </div>
    <div style={styles.cardContent}>
      <p>Monitor academic performance, application status, and eligibility. Send reminders and approve documents.</p>
      <div style={styles.quickStats}>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{dashboardData.totalStudents || 0}</span>
          <span style={styles.statLabel}>Total Students</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{dashboardData.eligibleStudents || 0}</span>
          <span style={styles.statLabel}>Approved</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{dashboardData.pendingApprovals || 0}</span>
          <span style={styles.statLabel}>Pending Approval</span>
        </div>
      </div>
    </div>
  </div>
);

// Drive & Event Card Component
const DriveEventCard = ({ navigate, dashboardData, onScheduleEvent, onViewDrives }) => (
  <div style={styles.featureCard} className="feature-card">
    <div style={styles.cardHeader}>
      <h3 style={styles.cardTitle}>📅 Drive & Event Coordination</h3>
      <div style={styles.cardActions}>
        <button 
          style={styles.actionBtn}
          onClick={onViewDrives}
        >
          View Drives
        </button>
        <button 
          style={styles.actionBtn}
          onClick={onScheduleEvent}
        >
          Schedule Events
        </button>
      </div>
    </div>
    <div style={styles.cardContent}>
      <p>Manage upcoming interviews, placement drives, and student participation tracking.</p>
      <div style={styles.upcomingEvents}>
        {dashboardData.activeDrives > 0 ? (
          <>
            <div style={styles.eventItem}>
              <span style={styles.eventDate}>Active</span>
              <span style={styles.eventName}>{dashboardData.activeDrives} Active Drives</span>
              <span style={{...styles.eventStatus, backgroundColor: '#4caf50'}}>Active</span>
            </div>
            <div style={styles.eventItem}>
              <span style={styles.eventDate}>Total</span>
              <span style={styles.eventName}>Total Active Drives</span>
              <span style={{...styles.eventStatus, backgroundColor: '#2196f3'}}>{dashboardData.activeDrives}</span>
            </div>
          </>
        ) : (
          <>
            <div style={styles.eventItem}>
              <span style={styles.eventDate}>--</span>
              <span style={styles.eventName}>No active drives</span>
              <span style={{...styles.eventStatus, backgroundColor: '#9e9e9e'}}>No Data</span>
            </div>
            <div style={styles.eventItem}>
              <span style={styles.eventDate}>--</span>
              <span style={styles.eventName}>No upcoming events</span>
              <span style={{...styles.eventStatus, backgroundColor: '#9e9e9e'}}>No Data</span>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

// Company Interaction Card Component
const CompanyInteractionCard = ({ navigate, jobPostings, jobLoading }) => {
  return (
    <div style={styles.featureCard} className="feature-card">
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>🏢 Company Interaction</h3>
        <div style={styles.cardActions}>
          <button 
            style={styles.actionBtn}
            onClick={() => navigate('/department-company-view')}
          >
            View Companies
          </button>
          <button 
            style={styles.actionBtn}
            onClick={() => navigate('/company/job-postings')}
          >
            Manage Jobs
          </button>
        </div>
      </div>
      <div style={styles.cardContent}>
        <p>Track companies recruiting from the department and manage job postings.</p>
        
        <div style={styles.companyStats}>
          <div style={styles.companyItem}>
            <span style={styles.companyName}>Active Jobs</span>
            <span style={styles.companyStatus}>{jobPostings.length}</span>
          </div>
          <div style={styles.companyItem}>
            <span style={styles.companyName}>Companies</span>
            <span style={styles.companyStatus}>{new Set(jobPostings.map(job => job.companyName)).size}</span>
          </div>
          <div style={styles.companyItem}>
            <span style={styles.companyName}>Total Positions</span>
            <span style={styles.companyStatus}>{jobPostings.reduce((sum, job) => sum + (job.numberOfPositions || 0), 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placement Statistics Card Component
const PlacementStatsCard = ({ navigate }) => (
  <div style={styles.featureCard} className="feature-card">
    <div style={styles.cardHeader}>
      <h3 style={styles.cardTitle}>📊 Placement Statistics & Reports</h3>
      <div style={styles.cardActions}>
        <button 
          style={styles.actionBtn}
          onClick={() => navigate('/tpo/dashboard')}
        >
          Generate Reports
        </button>
        <button 
          style={styles.actionBtn}
          onClick={() => navigate('/tpo/dashboard')}
        >
          Export Data
        </button>
      </div>
    </div>
    <div style={styles.cardContent}>
      <p>Generate comprehensive placement reports and export statistics by batch/year.</p>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>--</div>
            <div style={styles.statLabel}>Placement Rate</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>--</div>
            <div style={styles.statLabel}>Avg Package</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏆</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>--</div>
            <div style={styles.statLabel}>Highest Package</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Communication & Notice Board Card Component
const CommunicationCard = () => (
  <div style={styles.featureCard} className="feature-card">
    <div style={styles.cardHeader}>
      <h3 style={styles.cardTitle}>📢 Communication & Notice Board</h3>
      <div style={styles.cardActions}>
        <button style={styles.actionBtn}>Post Notice</button>
        <button style={styles.actionBtn}>Send Message</button>
      </div>
    </div>
    <div style={styles.cardContent}>
      <p>Post department-specific notices and communicate with students.</p>
      <div style={styles.noticeBoard}>
        <div style={styles.noticeItem}>
          <span style={styles.noticeIcon}>📢</span>
          <span style={styles.noticeText}>No notices posted yet</span>
          <span style={styles.noticeTime}>No data</span>
        </div>
        <div style={styles.noticeItem}>
          <span style={styles.noticeIcon}>⚠️</span>
          <span style={styles.noticeText}>No urgent announcements</span>
          <span style={styles.noticeTime}>No data</span>
        </div>
      </div>
    </div>
  </div>
);

// Document Management Card Component
const DocumentManagementCard = ({ navigate, dashboardData }) => (
  <div style={styles.featureCard} className="feature-card">
    <div style={styles.cardHeader}>
      <h3 style={styles.cardTitle}>📋 Document Management</h3>
      <div style={styles.cardActions}>
        <button 
          style={styles.actionBtn}
          onClick={() => navigate('/department-student-profile')}
        >
          Review Documents
        </button>
        <button 
          style={styles.actionBtn}
          onClick={() => navigate('/department-approved-students')}
        >
          View Approved
        </button>
      </div>
    </div>
    <div style={styles.cardContent}>
      <p>Approve resumes, certificates, and manage student document submissions.</p>
      <div style={styles.documentStats}>
        <div style={styles.docItem}>
          <span style={styles.docIcon}>📄</span>
          <span style={styles.docLabel}>Pending Approvals</span>
          <span style={styles.docCount}>{dashboardData.pendingApprovals || 0}</span>
        </div>
        <div style={styles.docItem}>
          <span style={styles.docIcon}>✅</span>
          <span style={styles.docLabel}>Approved Documents</span>
          <span style={styles.docCount}>{dashboardData.approvedToday || 0}</span>
        </div>
        <div style={styles.docItem}>
          <span style={styles.docIcon}>📊</span>
          <span style={styles.docLabel}>Total Documents</span>
          <span style={styles.docCount}>{dashboardData.totalStudents || 0}</span>
        </div>
      </div>
    </div>
  </div>
);



const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showScheduleEventModal, setShowScheduleEventModal] = useState(false);
  const [showViewDrivesModal, setShowViewDrivesModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    period: 'AM',
    venue: '',
    description: ''
  });
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    eligibleStudents: 0,
    pendingApprovals: 0,
    activeDrives: 0,
    approvedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [jobPostings, setJobPostings] = useState([]);
  const [jobLoading, setJobLoading] = useState(true);
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // Fetch dashboard data from database
  const fetchDashboardData = useCallback(async () => {
    try {
      // Get department info from localStorage
      const info = localStorage.getItem("departmentInfo");
      const deptInfo = info ? JSON.parse(info) : null;
      
      if (!deptInfo || !deptInfo.department) {
        console.log('No department info found');
        setLoading(false);
        return;
      }

      // Fetch students for this specific department
      try {
        const studentsResponse = await axios.get(`http://localhost:5000/api/department-dashboard/students/${deptInfo.department}`);
        const students = studentsResponse.data.students || [];
        console.log(`Students from ${deptInfo.department}:`, students);
        console.log('Approval status for each student:');
        students.forEach(s => console.log(`${s.usn}: isApproved=${s.isApproved}`));
        setDepartmentStudents(students);
        
        // Calculate dashboard metrics for this department only
        const totalStudents = students.length;
        
        // Calculate eligible students (approved students ready for placements)
        const eligibleStudents = students.filter(student => 
          student.isApproved === true
        ).length;
        
        // Calculate pending approvals (students not yet approved)
        const pendingApprovals = students.filter(student => 
          !student.isApproved
        ).length;
        
        // Calculate approved documents (students with complete profiles AND approved)
        const approvedToday = students.filter(student => 
          student.isApproved === true
        ).length;
        
        console.log('Dashboard metrics calculated for department:', {
          department: deptInfo.department,
          totalStudents,
          eligibleStudents,
          pendingApprovals,
          approvedToday
        });
        
        setDashboardData({
          totalStudents,
          eligibleStudents,
          pendingApprovals,
          activeDrives: 0, // Will be populated from drives/companies endpoint
          approvedToday
        });
      } catch (error) {
        console.log('Error fetching department students:', error);
        setDepartmentStudents([]);
      }
      
      setLoading(false);
      setStudentsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setStudentsLoading(false);
    }
  }, []);

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
    
    // Fetch dashboard data
    fetchDashboardData();
    fetchJobPostings();
  }, [navigate, fetchDashboardData]);

  const fetchJobPostings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/student/job-postings');
      if (response.data.success) {
        setJobPostings(response.data.jobPostings.slice(0, 6)); // Show only first 6 for dashboard
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
      toast.error('Error fetching job postings');
    } finally {
      setJobLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleEvent = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!eventForm.title || !eventForm.type || !eventForm.date || !eventForm.time || !eventForm.venue) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create new event object
      const newEvent = {
        id: Date.now(),
        title: eventForm.title,
        type: eventForm.type,
        date: eventForm.date,
        time: `${eventForm.time} ${eventForm.period}`,
        venue: eventForm.venue,
        description: eventForm.description,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      // Add to events list
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      
      // Update dashboard data
      setDashboardData(prev => ({
        ...prev,
        activeDrives: updatedEvents.filter(e => e.status === 'Active').length
      }));
      
      toast.success('Event scheduled successfully!');
      
      // Reset form and close modal
      setEventForm({
        title: '',
        type: '',
        date: '',
        time: '',
        period: 'AM',
        venue: '',
        description: ''
      });
      setShowScheduleEventModal(false);
    } catch (error) {
      console.error('Error scheduling event:', error);
      toast.error('Error scheduling event');
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      setDashboardData(prev => ({
        ...prev,
        activeDrives: updatedEvents.filter(e => e.status === 'Active').length
      }));
      toast.success('Event deleted successfully');
    }
  };

  if (!departmentInfo || loading) {
    return <div style={styles.loading}>Loading Dashboard Data...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Profile Details Popup */}
      {showProfilePopup && (
        <div style={styles.popupOverlay} onClick={() => setShowProfilePopup(false)}>
          <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeButton}
              onClick={() => setShowProfilePopup(false)}
              title="Close"
            >
              ✕
            </button>
            
            {/* Profile Image */}
            <div style={styles.popupProfileImageContainer}>
              <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                style={styles.popupProfileImage}
              >
                <circle cx="12" cy="12" r="11" fill="#e0e0e0" />
                <circle cx="12" cy="9" r="4" fill="#9e9e9e" />
                <path
                  d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7"
                  fill="#9e9e9e"
                />
              </svg>
            </div>
            
            <h2 style={styles.popupTitle}>Profile Details</h2>
            <div style={styles.popupDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Name</span>
                <span style={styles.detailValue}>{departmentInfo?.name || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Username</span>
                <span style={styles.detailValue}>{departmentInfo?.username || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Department</span>
                <span style={styles.detailValue}>{departmentInfo?.department || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Designation</span>
                <span style={styles.detailValue}>{departmentInfo?.designation || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email</span>
                <span style={styles.detailValue}>{departmentInfo?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Event Modal */}
      {showScheduleEventModal && (
        <div style={styles.modalOverlay} onClick={() => setShowScheduleEventModal(false)}>
          <div style={styles.scheduleEventModal} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeButton}
              onClick={() => setShowScheduleEventModal(false)}
              title="Close"
            >
              ✕
            </button>
            
            <h2 style={styles.modalTitle}>Schedule New Event</h2>
            <p style={styles.modalSubtitle}>Enter event details to schedule a new drive or event for the department</p>
            
            <form onSubmit={handleScheduleEvent} style={styles.eventForm}>
              {/* Event Title */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Event Title <span style={styles.required}>*</span></label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  placeholder="e.g., Infosys Placement Drive"
                  style={styles.formInput}
                  required
                />
              </div>

              {/* Event Type */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Event Type <span style={styles.required}>*</span></label>
                <select
                  name="type"
                  value={eventForm.type}
                  onChange={handleEventFormChange}
                  style={styles.formInput}
                  required
                >
                  <option value="">Select Event Type</option>
                  <option value="Drive">Drive</option>
                  <option value="Interview">Interview</option>
                  <option value="Test">Test</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>

              {/* Date & Time */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Date <span style={styles.required}>*</span></label>
                  <input
                    type="date"
                    name="date"
                    value={eventForm.date}
                    onChange={handleEventFormChange}
                    style={styles.formInput}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Time <span style={styles.required}>*</span></label>
                  <div style={styles.timeInputGroup}>
                    <input
                      type="time"
                      name="time"
                      value={eventForm.time}
                      onChange={handleEventFormChange}
                      style={{...styles.formInput, flex: 1}}
                      required
                    />
                    <select
                      name="period"
                      value={eventForm.period}
                      onChange={handleEventFormChange}
                      style={{...styles.formInput, width: '80px'}}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Venue/Method <span style={styles.required}>*</span></label>
                <input
                  type="text"
                  name="venue"
                  value={eventForm.venue}
                  onChange={handleEventFormChange}
                  placeholder="e.g., Seminar Hall or Online Link"
                  style={styles.formInput}
                  required
                />
              </div>

              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description/Brief (Optional)</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  placeholder="Short instructions or details about the event"
                  style={styles.formTextarea}
                  rows="3"
                />
              </div>

              {/* Action Buttons */}
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowScheduleEventModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={styles.submitButton}
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Drives Modal */}
      {showViewDrivesModal && (
        <div style={styles.modalOverlay} onClick={() => setShowViewDrivesModal(false)}>
          <div style={styles.viewDrivesModal} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeButton}
              onClick={() => setShowViewDrivesModal(false)}
              title="Close"
            >
              ✕
            </button>
            
            <h2 style={styles.modalTitle}>All Drives & Events</h2>
            <p style={styles.modalSubtitle}>View and manage all scheduled drives and events</p>
            
            {events.length === 0 ? (
              <div style={styles.noEventsMessage}>
                <p style={styles.noEventsText}>📅 No events scheduled yet</p>
                <p style={styles.noEventsSubtext}>Click "Schedule Events" to add new drives or events</p>
              </div>
            ) : (
              <div style={styles.eventsTableContainer}>
                <table style={styles.eventsTable}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>Event Title</th>
                      <th style={styles.tableHeader}>Type</th>
                      <th style={styles.tableHeader}>Date</th>
                      <th style={styles.tableHeader}>Time</th>
                      <th style={styles.tableHeader}>Venue</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{event.title}</td>
                        <td style={styles.tableCell}>
                          <span style={styles.eventTypeBadge}>{event.type}</span>
                        </td>
                        <td style={styles.tableCell}>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td style={styles.tableCell}>{event.time}</td>
                        <td style={styles.tableCell}>{event.venue}</td>
                        <td style={styles.tableCell}>
                          <span style={styles.statusBadge}>{event.status}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            style={styles.deleteEventButton}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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
                      setShowProfilePopup(true);
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
        <h1 style={styles.title}>Department Dashboard</h1>
        
        {/* Dashboard Overview Widgets */}
        <div style={styles.overviewSection}>
          <h2 style={styles.sectionTitle}>📊 Dashboard Overview</h2>
          <div style={styles.widgetsGrid}>
            <DashboardWidget 
              icon="👥"
              title="Total Students"
              value={dashboardData.totalStudents || 0}
              subtitle="Registered in Department"
              color="#2196f3"
              onClick={() => navigate('/department-student-profile')}
            />
            <DashboardWidget 
              icon="📅"
              title="Active Drives"
              value={dashboardData.activeDrives || 0}
              subtitle="Ongoing & Upcoming"
              color="#ff9800"
              onClick={() => navigate('/company/job-postings')}
            />
            <DashboardWidget 
              icon="📋"
              title="Pending Approvals"
              value={dashboardData.pendingApprovals || 0}
              subtitle="Documents & Profiles"
              color="#f44336"
            />

          </div>
        </div>



        {/* Core Features Section */}
        <div style={styles.featuresSection}>
          <h2 style={styles.sectionTitle}>🚀 Core Features</h2>
          <div style={styles.featuresGrid}>
            <StudentManagementCard navigate={navigate} dashboardData={dashboardData} />
            <DriveEventCard 
              navigate={navigate} 
              dashboardData={dashboardData} 
              onScheduleEvent={() => setShowScheduleEventModal(true)}
              onViewDrives={() => setShowViewDrivesModal(true)}
            />
            <CompanyInteractionCard navigate={navigate} jobPostings={jobPostings} jobLoading={jobLoading} />
            <PlacementStatsCard navigate={navigate} />
            <CommunicationCard />
            <DocumentManagementCard navigate={navigate} dashboardData={dashboardData} />
          </div>
        </div>


        
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 0',
    maxWidth: '100vw',
    margin: '0',
    minHeight: '100vh',
    background: '#f8f9fa',
  },
  
  // Header Styles
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
    alignItems: 'left',
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
    flex: 2,
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
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
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
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
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
  title: {
    textAlign: 'center',
    color: '#1976d2',
    marginBottom: '40px',
    fontWeight: 800,
    fontSize: '2.5rem',
    letterSpacing: '1px',
    paddingTop: '20px',
    background: '#fff',
    borderRadius: '0 0 18px 18px',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
    marginLeft: 0,
    marginRight: 0,
  },
  
  // Section Styles
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#1a237e',
    marginBottom: '25px',
    fontWeight: 700,
    textAlign: 'center',
  },
  overviewSection: {
    marginBottom: '50px',
  },
  featuresSection: {
    marginBottom: '50px',
  },
  

  
  // Dashboard Widgets
  widgetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  widget: {
    background: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
  },
  widgetIcon: {
    fontSize: '2.5rem',
    width: '60px',
    textAlign: 'center',
  },
  widgetContent: {
    flex: 1,
  },
  widgetTitle: {
    margin: '0 0 8px 0',
    fontSize: '1rem',
    color: '#666',
    fontWeight: '500',
  },
  widgetValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  widgetSubtitle: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#888',
  },
  
  // Feature Cards
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px',
  },
  featureCard: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e8e8e8',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    },
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #1976d2, #1565c0)',
    color: 'white',
    padding: '20px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: '600',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.3)',
      transform: 'scale(1.05)',
    },
  },
  cardContent: {
    padding: '25px',
  },
  
  // Quick Stats
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginTop: '20px',
  },
  statItem: {
    textAlign: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  statNumber: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    display: 'block',
  },
  
  // Upcoming Events
  upcomingEvents: {
    marginTop: '20px',
  },
  eventItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '10px',
    border: '1px solid #e9ecef',
  },
  eventDate: {
    background: '#1976d2',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    minWidth: '50px',
    textAlign: 'center',
  },
  eventName: {
    flex: 1,
    fontWeight: '500',
    color: '#333',
  },
  eventStatus: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'white',
  },
  
  // Company Stats
  companyStats: {
    marginTop: '20px',
  },
  companyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '10px',
    border: '1px solid #e9ecef',
  },
  companyName: {
    fontWeight: '500',
    color: '#333',
  },
  companyStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    background: '#4caf50',
    color: 'white',
  },
  
  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },
  statCard: {
    textAlign: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '5px',
  },
  statsGridLabel: {
    fontSize: '0.8rem',
    color: '#666',
  },
  
  // Notice Board
  noticeBoard: {
    marginTop: '20px',
  },
  noticeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '10px',
    border: '1px solid #e9ecef',
  },
  noticeIcon: {
    fontSize: '1.2rem',
  },
  noticeText: {
    flex: 1,
    fontSize: '0.9rem',
    color: '#333',
  },
  noticeTime: {
    fontSize: '0.8rem',
    color: '#888',
    fontStyle: 'italic',
  },
  
  // Document Stats
  documentStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },
  docItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    gap: '8px',
  },
  docIcon: {
    fontSize: '1.5rem',
    display: 'block',
  },
  docLabel: {
    fontSize: '0.8rem',
    color: '#666',
    display: 'block',
    whiteSpace: 'nowrap',
  },
  docCount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1976d2',
    display: 'block',
  },
  

  
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666',
  },
  
  // Profile Popup Styles
  popupOverlay: {
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
  },
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
  popupContent: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '40px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    position: 'relative',
    animation: 'fadeIn 0.3s ease',
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
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
  },
  popupProfileImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  popupProfileImage: {
    display: 'block',
  },
  popupTitle: {
    margin: '0 0 25px 0',
    fontSize: '1.8rem',
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '700',
  },
  popupDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#666',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    color: '#1976d2',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  
  // Students Section Styles
  studentsSection: {
    marginTop: '30px',
    marginBottom: '40px',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
    padding: '40px',
  },
  noStudentsCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  noStudentsText: {
    fontSize: '1.1rem',
    color: '#888',
    margin: 0,
  },
  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  studentCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f0f0f0',
  },
  studentAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1976d2, #1565c0)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  studentBasicInfo: {
    flex: 1,
  },
  studentName: {
    margin: '0 0 5px 0',
    fontSize: '1.1rem',
    color: '#333',
    fontWeight: '600',
  },
  studentUsn: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  studentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
  },
  detailIcon: {
    fontSize: '1rem',
    width: '20px',
  },
  detailText: {
    color: '#555',
    flex: 1,
  },
  studentFooter: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #f0f0f0',
    textAlign: 'right',
  },
  studentSource: {
    fontSize: '0.8rem',
    color: '#888',
    fontStyle: 'italic',
  },
  
  // Schedule Event Modal Styles
  scheduleEventModal: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    margin: '0 0 10px 0',
    fontSize: '1.8rem',
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '700',
  },
  modalSubtitle: {
    margin: '0 0 30px 0',
    fontSize: '0.9rem',
    color: '#666',
    textAlign: 'center',
  },
  eventForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  timeInputGroup: {
    display: 'flex',
    gap: '10px',
  },
  formLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#f44336',
  },
  formInput: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit',
  },
  formTextarea: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  submitButton: {
    padding: '12px 30px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  
  // View Drives Modal Styles
  viewDrivesModal: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '40px',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  noEventsMessage: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  },
  noEventsText: {
    fontSize: '1.3rem',
    color: '#666',
    margin: '0 0 10px 0',
  },
  noEventsSubtext: {
    fontSize: '1rem',
    color: '#999',
    margin: 0,
  },
  eventsTableContainer: {
    overflow: 'auto',
    maxHeight: '500px',
  },
  eventsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },
  tableHeaderRow: {
    backgroundColor: '#1976d2',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  tableHeader: {
    padding: '15px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.95rem',
    borderBottom: '2px solid #1565c0',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
    transition: 'background-color 0.2s',
  },
  tableCell: {
    padding: '15px',
    fontSize: '0.9rem',
    color: '#333',
  },
  eventTypeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#4caf50',
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  deleteEventButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default DepartmentDashboard;
