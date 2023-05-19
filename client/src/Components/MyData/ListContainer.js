import React from "react";
import LikeList from "./LikeList";
import AuthorList from "./AuthorList";
import DislikeList from "./DislikeList";
import GenreList from "./GenreList";

function ListContainer() {
    return (
        <div>
            <h1>ListContainer</h1>
            <LikeList />
            <AuthorList />
            <DislikeList />
            <GenreList />
        </div>
    );
}

export default ListContainer;