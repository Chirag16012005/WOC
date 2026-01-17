import axios from "axios";
import { useState } from "react";

export default function Login() {
  const [data, setData] = useState({});

  const submit = async () => {
    const res = await axios.post("http://localhost:5000/auth/login", data);
    localStorage.setItem("token", res.data.token);
    alert("Login success");
  };

  return (
    <>
      <input placeholder="Email" onChange={e => setData({ ...data, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setData({ ...data, password: e.target.value })} />
      <button onClick={submit}>Login</button>
    </>
  );
}
