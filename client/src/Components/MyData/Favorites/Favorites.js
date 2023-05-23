import React from "react";
import FavCardContainer from "./FavCardContainer";


function Favorites() {
    return (
        <div className="ListPrimary">
            <h1>Favorites</h1>
            <h2>This list has a strong effect on the books shown to you on the home page.</h2>
            <h2>Keep only your very favorite books here.</h2>
            <FavCardContainer />
        </div>
    );
}

export default Favorites;