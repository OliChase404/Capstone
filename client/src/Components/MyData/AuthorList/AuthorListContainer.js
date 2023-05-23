import React from "react";
import { UserContext } from "../../App";
import { useState, useEffect, useContext } from "react";
import AuthorListCard from "./AuthorListCard";

function AuthorListContainer() {
    const { user } = useContext(UserContext)
    const [unfilteredAuthors, setUnfilteredAuthors] = useState([])
    const [likedAuthors, setLikedAuthors] = useState([])
    const [dislikedAuthors, setDislikedAuthors] = useState([])
    const [favoriteAuthors, setFavoriteAuthors] = useState([])

    useEffect(() => {
        fetch('/unfiltered_authors')
            .then(res => res.json())
            .then(data => setUnfilteredAuthors(data))
        fetch('/user_liked_authors')
            .then(res => res.json())
            .then(data => setLikedAuthors(data))
        fetch('/user_disliked_authors')
            .then(res => res.json())
            .then(data => setDislikedAuthors(data))
        fetch('/user_favorite_authors')
            .then(res => res.json())
            .then(data => setFavoriteAuthors(data))

    },[])


    const renderUnfilteredAuthors = unfilteredAuthors.map(unfilteredAuthor => {
        return <AuthorListCard key={unfilteredAuthors.id} author={unfilteredAuthor}/>
      })
    const renderLikedAuthors = likedAuthors.map(likedAuthor => {
        return <AuthorListCard key={likedAuthor.id} author={likedAuthor}/>
        })
    const renderDislikedAuthors = dislikedAuthors.map(dislikedAuthor => {
        return <AuthorListCard key={dislikedAuthor.id} author={dislikedAuthor}/>   
        })
    const renderFavoriteAuthors = favoriteAuthors.map(favoriteAuthor => {
        return <AuthorListCard key={favoriteAuthor.id} author={favoriteAuthor}/>
        })

    return (
        <div className="ListContainer">
            <div className="ListColumn">
            {renderUnfilteredAuthors}
            </div>
            <div className="ListColumn">
            {renderDislikedAuthors}
            </div>
            <div className="ListColumn">
            {renderLikedAuthors}
            </div>
            <div className="ListColumn">
            {renderFavoriteAuthors}
            </div>
        </div>
    );
}

export default AuthorListContainer;