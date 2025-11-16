import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const CompanySignup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    localStorage.removeItem("companyToken");
  }, []);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const handleSignUp = async () => {
    if (!username || !name || !email || !password) {
      alert("Please enter Username, Name, Email and Password");
      return;
    }
    if (!validatePassword(password)) {
      alert("⚠️ Password must be at least 6 characters long and contain uppercase, lowercase, number and special character!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/company-signup", {
        username,
        name,
        email,
        password,
      });
      if (res.status === 201 || res.status === 200) {
        setSuccessMessage("✅ Sign-up successful! Redirecting to login... 🎉");
        localStorage.removeItem("companyToken");
        setTimeout(() => {
          navigate("/company-login");
        }, 2000);
      } else {
        alert(res.data.message || "Sign-up failed");
      }
    } catch (error) {
      alert(error.response?.data?.message || "❌ Server error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2>Company Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.inputStyle}
        />
        <input
          type="text"
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.inputStyle}
        />
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.inputStyle, paddingRight: "35px" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? "👁️" : "🔒"}
          </span>
        </div>
        <button style={styles.button} onClick={handleSignUp}>
          Sign Up
        </button>
        {successMessage && <div style={styles.successBox}>{successMessage}</div>}
        <p style={styles.loginRedirect}>
          Already have an account? <Link to="/company-login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
  },
  formBox: {
    background: "white",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "320px",
  },
  inputStyle: {
    width: "93%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  passwordContainer: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: "10px",
    cursor: "pointer",
    fontSize: "20px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  successBox: {
    backgroundColor: "#dff0d8",
    color: "#3c763d",
    padding: "12px",
    borderRadius: "5px",
    marginTop: "15px",
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
  },
  loginRedirect: {
    color: "black",
    cursor: "pointer",
    marginTop: "15px",
  },
};

export default CompanySignup;


