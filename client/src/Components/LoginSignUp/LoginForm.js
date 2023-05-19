import React from "react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";


function LoginForm({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

    function handleSubmit(e) {
        e.preventDefault();
        fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
          .then((r) => {
            if (r.ok) {
              r.json().then((user) => {
                setUser(user);
                <Navigate to="/" />;
              });
            } else {
              r.json().then((err) => setErrors(err.errors));
            }
          })
          .catch((error) => console.error(error));
      }


    return (
     <div>
        <h1>Login</h1>
        <form onSubmit={(event) => handleSubmit(event)}>
            {/* <label htmlFor="email">email</label> */}
            <input placeholder="Enter email address" type="text" id="email" onChange={e => setEmail(e.target.value)} />
            <br />
            {/* <label htmlFor="password">Password</label> */}
            <input placeholder="Enter Password" type="password" id="password" onChange={e => setPassword(e.target.value)} />
            <br />
            <button type="submit">Login</button>
        </form>
     </div>
      );
    }

export default LoginForm;