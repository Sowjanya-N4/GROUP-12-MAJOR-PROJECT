import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{ fontFamily: 'Arial', height: '100vh', background: 'linear-gradient(to right, #e3f2fd, #ffffff)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#1976d2', color: 'white' }}>
        <div style={{ fontSize: '24px' }}>☰</div>
        <div>
          <Link to="/coordinator-login" style={linkStyle}>Coordinator Login</Link>
          <Link to="/student-login" style={linkStyle}>Student Login</Link>
        </div>
      </header>

      <div style={{
        marginTop: '60px',
        padding: '20px',
        background: '#f5f5f5',
        width: '60%',
        margin: '60px auto',
        textAlign: 'center',
        borderRadius: '15px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <img src="/college.jpg" alt="College" style={{ width: '100%', maxWidth: '600px', borderRadius: '10px' }} />
        <h1>Welcome to the College Placement Portal</h1>
        
      </div>
    </div>
  );
};

const linkStyle = {
  margin: '0 10px',
  background: 'white',
  padding: '8px 16px',
  borderRadius: '5px',
  textDecoration: 'none',
  color: '#1976d2',
  fontWeight: 'bold'
};

export default HomePage;