import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/login", data);
      localStorage.setItem("token", res.data.token);
      navigate("/notes");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !data.email || !data.password;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to continue to your notes</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="abc@gmail.co.in"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              autoComplete="email"
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
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <button className="auth-btn" type="submit" disabled={isDisabled}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </form>
        <div className="auth-footer">
          New here? <Link className="auth-link" to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
