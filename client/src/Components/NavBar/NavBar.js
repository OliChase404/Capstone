import React from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../App";

function NavBar() {
    const { user, setUser } = React.useContext(UserContext)

    function logOut() {
      fetch("/logout", { method: "DELETE" }).then((r) => {
        if (r.ok) {
          setUser(null)
        }
      })
    }


  return (
    <div className="NavBar">
        {/* <div className="Logo">DeepReads</div> */}
        <div className="LogoContainer">
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
        
        <div className="LinkContainer">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
        <Link to="/mydata" className="nav-link">My Data </Link>
        </div>
        <div className="UserImageContainer">
            <Link to="/myprofile" className="nav-link">
                <img src={user.image} alt="avatar" className="UserImage" />
            </Link>
        <div className="UserImageMenu">
          <Link to="/myprofile" className="UserImageMenuItem">
            My Profile
          </Link>
          <br />
          <Link onClick={() => logOut()} className="UserImageMenuItem">
            Log Out
          </Link>
        </div>
        </div>
    </div>
  );
}

export default NavBar;
