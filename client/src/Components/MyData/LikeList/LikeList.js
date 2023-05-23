import React from "react";
import LikeListContainer from "./LikeListContainer";

function LikeList() {
    return (
    <div className="ListPrimary">
        <h1>Likes</h1>
        <h2>This is your Like List</h2>
        <h2>Books that you're interested in but may not have listened to should be kept here.</h2>
        <LikeListContainer />
    </div>

    );
}

export default LikeList;