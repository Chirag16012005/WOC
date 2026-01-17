import axios from "axios";
import { useState } from "react";

export default function Signup() {
  const [data, setData] = useState({});

  const submit = async () => {
    await axios.post("http://localhost:5000/auth/signup", data);
    alert("Signup success");
  };

  return (
    <>
      <input placeholder="Name" onChange={e => setData({ ...data, name: e.target.value })} />
      <input placeholder="Email" onChange={e => setData({ ...data, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setData({ ...data, password: e.target.value })} />
      <button onClick={submit}>Signup</button>
    </>
  );
}
