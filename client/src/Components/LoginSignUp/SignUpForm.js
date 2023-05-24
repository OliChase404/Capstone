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
        <div className="LoginSignupForm">
            <h1>SignUp</h1>
            <form onSubmit={e => handleSubmit(e)}>
                <input type="text" placeholder="Email" id="Email" onChange={e => setEmail(e.target.value)} />
                <br />
                <input type="text" id="username" placeholder="Username" onChange={e => setUsername(e.target.value)} />
                <br />
                <input type="password" id="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <br />
                <input type="password" id="password" placeholder="Confirm Password" onChange={e => setPasswordConfirmation(e.target.value)} />
                <br />
                <button type="submit">SignUp</button>
            </form>
        </div>
    );
}

export default SignUpForm;