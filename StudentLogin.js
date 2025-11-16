import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [loginSuccess, setLoginSuccess] = useState(false); // Show success box

  const handleLogin = async () => {
    if (!usn || !password) {
      alert("Please enter USN and Password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/studentlogin", {
        usn,
        password,
      });

      if (res.status === 200) {
        setLoginSuccess(true); // Show success box
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userUSN", usn); // Save USN to localStorage
        setTimeout(() => {
          navigate("/dashboard"); // Redirect after 2 seconds
        }, 2000);
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div style={container}>
      <div style={formBox}>
        <h2>Student Login</h2>
        <input
          type="text"
          placeholder="USN"
          value={usn}
          onChange={(e) => setUsn(e.target.value)}
          style={inputStyle}
        />

        {/* Password Field with Eye Icon */}
        <div style={passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: "35px" }}
          />
          <span onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>
            {showPassword ? "👁️" : "🔒"}
          </span>
        </div>

        <button style={buttonStyle} onClick={handleLogin}>Login</button>

        <div style={linksContainer}>
          <Link to="/forgot" style={linkStyle}>Forgot Password?</Link>
          <p style={signupText}>
            Don't have an account? <Link to="/signup" style={linkStyle} onClick={(e) => {
              e.preventDefault();
              navigate("/signup");
            }}>Sign Up</Link>
          </p>
        </div>

        {/* Animated Success Box - Appears Below Login Form */}
        {loginSuccess && (
          <div style={successBoxStyle}>
            ✅ Login Successful! Redirecting... 😃
          </div>
        )}
      </div>
    </div>
  );
};

/* Styles */
const container = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5", position: "relative" };
const formBox = { background: "white", padding: "40px", borderRadius: "10px", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)", textAlign: "center", width: "300px" };
const inputStyle = { width: "93%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" };
const passwordContainer = { display: "flex", alignItems: "center", position: "relative" };
const eyeIconStyle = { position: "absolute", right: "10px", cursor: "pointer", fontSize: "20px" };
const buttonStyle = { width: "100%", padding: "10px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" };
const linksContainer = {
  marginTop: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
const linkStyle = { 
  color: "#1976d2", 
  textDecoration: "underline", 
  cursor: "pointer", 
  fontSize: "14px",
};
const signupText = {
  margin: "10px 0",
  fontSize: "14px",
  color: "#666",
};
const successBoxStyle = {
  marginTop: "20px",
  padding: "10px",
  backgroundColor: "#28a745",
  color: "white",
  borderRadius: "8px",
  textAlign: "center",
  fontSize: "16px",
  animation: "fadeIn 0.5s ease-in",
};

export default StudentLogin;