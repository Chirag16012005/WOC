import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();


  const sendotp =async(e)=>{
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try{
      await axios.post("http://localhost:5000/auth/send-signup-otp", data);
      setStep(2);
      setSuccess("OTP sent to your email");

    }
    catch(err){
      setError("Unable to send OTP. Please try again.");
    }
    finally{
      setLoading(false);
    }
  }

  const verifyandSignup=async(e)=>{
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try{
      await axios.post("http://localhost:5000/auth/verify-signup-otp",{
        email:data.email,
        otp:otp
      });
      setSuccess("OTP verified! Creating your account...");

      await axios.post("http://localhost:5000/auth/signup", data);
      setSuccess("Account created! You can now sign in.");
      setTimeout(() => navigate("/login"), 900);

    }
    catch(err){
      setError("Invalid OTP. Please try again.");
    }
    finally{
      setLoading(false);
    }
  }
  
  const isstep1disabled=loading || !data.name || !data.email || !data.password;
  const isstep2disabled=loading || otp.length!==6;
 

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start organizing your notes today</p>
        <form onSubmit={step===1?sendotp:verifyandSignup} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Name</label>
            <input
              id="name"
              className="auth-input"
              type="text"
              placeholder="Manthan"
              disabled={step===2}
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              autoComplete="name"
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="something@example.com"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              autoComplete="email"
              disabled={step===2}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
              disabled={step===2}
            />
          </div>
          {
            step===2 && (
              <div className="auth-field">
            <label className="auth-label">OTP</label>
            <input
              id="otp"
              className="auth-input"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              
            />
          </div>
            )
          }
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="auth-actions">
            <button 
            className="auth-btn" 
            type="submit" 
            disabled={step===1?isstep1disabled:isstep2disabled}>  
              {loading ? "Please Wait" : step===1 ? 
              "Send OTP" : "Verify OTP & Sign Up"}
            </button>
          </div>
        </form>
        <div className="auth-footer">
          Already have an account? 
          <Link className="auth-link" to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
