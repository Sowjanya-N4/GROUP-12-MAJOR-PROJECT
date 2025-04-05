import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Placeholder logic for login
    navigate('/');
  };

  return (
    <div style={container}>
      <h2>Student Login</h2>
      <input type="text" placeholder="User ID" style={inputStyle} />
      <input type="password" placeholder="Password" style={inputStyle} />
      <button style={buttonStyle} onClick={handleLogin}>Login</button>
    </div>
  );
};

const container = {
  marginTop: '100px',
  textAlign: 'center'
};

const inputStyle = {
  display: 'block',
  margin: '10px auto',
  padding: '10px',
  width: '250px'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '5px'
};

export default StudentLogin;
