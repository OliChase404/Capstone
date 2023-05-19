import "../App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import React from "react";
import { useState, useEffect, createContext } from "react";
import LoginSignup from "./LoginSignUp/LoginSignUp";
import Home from "./Home/Home";
import NavBar from "./NavBar/NavBar";
import Favorites from "./Favorites/Favorites";
import MyData from "./MyData/MyData";
import MyProfile from "./MyProfile/MyProfile";

export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // auto-login
    fetch("/check_session").then((r) => {
      if (r.ok) {
        r.json().then((user) => setUser(user));
      }
    });
    if (user) {
      <Navigate to="/" />;
    }
  }, []);

  if (!user) return <LoginSignup setUser={setUser} />;
  return (
    <div className="App">
      <UserContext.Provider value={{ user, setUser }}>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/favorites" element={<Favorites/>} />
          <Route path="/mydata" element={<MyData/>} />
          <Route path="/myprofile" element={<MyProfile/>} />
        </Routes>
      </UserContext.Provider>
    </div>
  );
}

export default App;
