import "../App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import React from "react";
import { useState, useEffect, createContext } from "react";
import LoginSignup from "./LoginSignUp/LoginSignUp";
import Home from "./Home/Home";
import NavBar from "./NavBar/NavBar";
import MyData from "./MyData/MyData";
import MyProfile from "./MyProfile/MyProfile";
import AuthorList from "./MyData/AuthorList/AuthorList";
import LikeList from "./MyData/LikeList/LikeList";
import DislikeList from "./MyData/DislikeList/DislikeList";
import GenreList from "./MyData/GenreList/GenreList";
import NarratorList from "./MyData/NarratorList/NarratorList";
import Favorites from "./MyData/Favorites/Favorites";


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
          <Route path="/myprofile" element={<MyProfile/>} />
          <Route path="/mydata" element={<MyData/>} />
          <Route path="/mydata/authors" element={<AuthorList/>} />
          <Route path="/mydata/likes" element={<LikeList/>} />
          <Route path="/mydata/dislikes" element={<DislikeList/>} />
          <Route path="/mydata/genres" element={<GenreList/>} />
          <Route path="/mydata/narrators" element={<NarratorList/>} />
          <Route path="/mydata/favorites" element={<Favorites/>} />

          
        
        </Routes>
      </UserContext.Provider>
    </div>
  );
}

export default App;
