import React from "react";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";


function LoginSignUp({ setUser }) {
  const [loginNotSignUp, setLoginNotSignUp] = useState(true);
  const msg1 = "First time? \nClick here to SignUp!"
  const msg2 = "Already have an account? \nClick here to Login!"

  return (
    <div>
      {loginNotSignUp ? <LoginForm setUser={setUser} /> : <SignUpForm setUser={setUser} />}
      <button onClick={() => setLoginNotSignUp(!loginNotSignUp)}>{loginNotSignUp ? msg1 : msg2}</button>
    </div>
  );
}



export default LoginSignUp;