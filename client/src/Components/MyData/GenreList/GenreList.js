import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import { binarySearch } from "../../Tools";
import GenreListContainer from "./GenreListContainer";

function GenreList() {
    const { user } = useContext(UserContext)

    const [unfilteredGenres, setUnfilteredGenres] = useState([])
    const [search, setSearch] = useState('')

    const [likedGenres, setLikedGenres] = useState([])
    const [dislikedGenres, setDislikedGenres] = useState([])
    const [favoriteGenres, setFavoriteGenres] = useState([])

    useEffect(() => {
        fetch('/unfiltered_genres')
            .then(res => res.json())
            .then(data => setUnfilteredGenres(data))
        fetch('/user_liked_genres')
            .then(res => res.json())
            .then(data => setLikedGenres(data))
        fetch('/user_disliked_genres')
            .then(res => res.json())
            .then(data => setDislikedGenres(data))
        fetch('/user_favorite_genres')
            .then(res => res.json())
            .then(data => setFavoriteGenres(data))

    },[])

    const unfilteredToDisplay = binarySearch(unfilteredGenres, search)

    function handleOnDragEnd(result) {
        if (!result.destination) return
        if (result.destination.droppableId === result.source.droppableId) return
      
        const draggableId = Number(result.draggableId)
        const sourceListId = result.source.droppableId
        const destinationListId = result.destination.droppableId
      
        const sourceList = getList(sourceListId);
        const destinationList = getList(destinationListId);
      
        const draggedItem = sourceList.find((author) => author.id === draggableId)
        const updatedSourceList = sourceList.filter((author) => author.id !== draggableId)
      
        const insertIndex = result.destination.index;
        destinationList.splice(insertIndex, 0, draggedItem)
      
        setList(sourceListId, updatedSourceList)
        setList(destinationListId, destinationList)
        
        if (destinationListId !== 'unfilteredGenres') {
            let user_vote = false
            let user_favorite = false
            if (destinationListId === 'likedGenres') {
                user_vote = true
                user_favorite = false
            } else if (destinationListId === 'favoriteGenres') {
                user_vote = true
                user_favorite = true
            }
            fetch(`/user_filtered_genres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    genre_id: draggableId,
                    user_vote: user_vote,
                    user_favorite: user_favorite
                })
            })
        }
        if (destinationListId === 'unfilteredGenres') {
            fetch(`/user_filtered_genres`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    genre_id: draggableId
                })
            })
        }
      }
      
      function getList(listId) {
        switch (listId) {
          case 'unfilteredGenres':
            return unfilteredGenres
          case 'likedGenres':
            return likedGenres;
          case 'dislikedGenres':
            return dislikedGenres
          case 'favoriteGenres':
            return favoriteGenres
          default:
            return [];
        }
      }

      function setList(listId, updatedList) {
        switch (listId) {
          case 'unfilteredGenres':
            setUnfilteredGenres(updatedList)
            break;
          case 'likedGenres':
            setLikedGenres(updatedList)
            break;
          case 'dislikedGenres':
            setDislikedGenres(updatedList)
            break;
          case 'favoriteGenres':
            setFavoriteGenres(updatedList)
            break;
          default:
            break;
        }
      }


    return (
        <div className="ListColumnPrimary" >
            <div className="ListHeader">
                <h2>Unfiltered Genres</h2>
                <h2>Disliked Genres</h2>
                <h2>Liked Genres</h2>
                <h2>Favorite Genres</h2>
            </div>
            <GenreListContainer 
            unfilteredGenres={unfilteredToDisplay} 
            likedGenres={likedGenres} 
            dislikedGenres={dislikedGenres} 
            favoriteGenres={favoriteGenres}
            handleOnDragEnd={handleOnDragEnd}
            search={search}
            setSearch={setSearch}
            />
        </div>
    );
}

export default GenreList;