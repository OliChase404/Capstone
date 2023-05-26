import React from "react";
import AuthorListContainer from "./AuthorListContainer";

function AuthorList() {
    return (
        <div className="ListColumnPrimary" >
            <h1>AuthorList</h1>
            <div className="ListHeader">
                <h2>Unfiltered Authors</h2>
                <h2>Disliked Authors</h2>
                <h2>Liked Authors</h2>
                <h2>Favorite Authors</h2>
            </div>
            <AuthorListContainer />
        </div>
    );
}

export default AuthorList;