import React from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../App";

function NavBar() {
    const { user } = React.useContext(UserContext);


  return (
    <div className="NavBar">
        <div className="Logo">DeepReads</div>
        <div className="LinkContainer">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
        <Link to="/mydata" className="nav-link">My Data </Link>
        </div>
        <div className="UserImageContainer">
            <Link to="/myprofile" className="nav-link">
                <img src={user.image} alt="avatar" className="UserImage" />
            </Link>
        </div>
    </div>
  );
}

export default NavBar;
