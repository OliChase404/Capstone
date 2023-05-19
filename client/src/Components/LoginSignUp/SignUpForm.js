import React from "react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

function SignUpForm({ setUser }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState([]);


    function handleSubmit(e) {
        e.preventDefault(e)
        if (password !== passwordConfirmation) {
            alert("Passwords do not match")
            return
        }   
        e.preventDefault()
        fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, username, password}),
        }).then((r) => {
            if (r.ok) {
                r.json().then((user) => setUser(user))
                    .then(<Navigate to="/" />)
            } else {
                r.json().then((err) => setErrors(err.errors))
            }
        })
    }

    return (
        <div>
            <h1>SignUp</h1>
            <form onSubmit={e => handleSubmit(e)}>
                <label htmlFor="Email">Email</label>
                <input type="text" id="Email" onChange={e => setEmail(e.target.value)} />
                <br />
                <label htmlFor="username">Username</label>
                <input type="text" id="username" onChange={e => setUsername(e.target.value)} />
                <br />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" onChange={e => setPassword(e.target.value)} />
                <br />
                <label htmlFor="password">Confirm Password</label>
                <input type="password" id="password" onChange={e => setPasswordConfirmation(e.target.value)} />
                <br />
                <button type="submit">SignUp</button>
            </form>
        </div>
    );
}

export default SignUpForm;