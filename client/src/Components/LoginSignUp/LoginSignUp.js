import React from "react";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";


function LoginSignUp({ setUser }) {
  const [loginNotSignUp, setLoginNotSignUp] = useState(true);
  const msg1 = "Click here to SignUp"
  const msg2 = "Switch to Login"

  return (
    <div className="LoginSignup">
      <div>
      <svg viewBox="0 0 600 120" height="100%" width="100%">
        <symbol id="s-text">
        <text textAnchor="middle" x="50%" y="80%" >DeepReads </text>
        <text textAnchor="middle" x="52%" y="80%">DeepReads </text>
        </symbol>
        <g className="g-ants">
          <use xlinkHref="#s-text" className="text-copy"></use>
          <use xlinkHref="#s-text" className="text-copy"></use>
          <use xlinkHref="#s-text" className="text-copy"></use>
          <use xlinkHref="#s-text" className="text-copy"></use>
          <use xlinkHref="#s-text" className="text-copy"></use>
        </g>
      </svg>
    </div>

      <div className="LoginSignupFormContainer">
        {loginNotSignUp ? <LoginForm setUser={setUser} /> : <SignUpForm setUser={setUser} />}
        <button onClick={() => setLoginNotSignUp(!loginNotSignUp)}>{loginNotSignUp ? msg1 : msg2}</button>
      </div>
    </div>
  );
}



export default LoginSignUp;