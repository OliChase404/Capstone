import React from "react";
import DislikeListContainer from "./DislikeListContainer";

function DislikeList() {
    return (
        <div className="ListPrimary">
            <h1>Your Dislike List</h1>
            {/* <h2>This list has a strong effect on the books shown to you on the home page.</h2> */}
            <h2>Keep books you're not interested in here.</h2>
            <DislikeListContainer />
        </div>
    );
}

export default DislikeList;
