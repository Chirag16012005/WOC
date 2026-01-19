import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Notes App</h1>
      <p>Get started by logging in or creating a new account.</p>
      <div>
        <Link to="/login">Go to Login</Link>
      </div>
      <div>
        <Link to="/signup">Create an Account</Link>
      </div>
    </main>
  );
}
