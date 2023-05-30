import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import { binarySearch } from "../../Tools";
import NarratorListContainer from "./NarratorListContainer";


function NarratorList() {
    const { user } = useContext(UserContext)

    const [unfilteredNarrators, setUnfilteredNarrators] = useState([])
    const [search, setSearch] = useState('')

    const [likedNarrators, setLikedNarrators] = useState([])
    const [dislikedNarrators, setDislikedNarrators] = useState([])
    const [favoriteNarrators, setFavoriteNarrators] = useState([])

    useEffect(() => {
        fetch('/unfiltered_narrators')
            .then(res => res.json())
            .then(data => setUnfilteredNarrators(data))
        fetch('/user_liked_narrators')
            .then(res => res.json())
            .then(data => setLikedNarrators(data))
        fetch('/user_disliked_narrators')
            .then(res => res.json())
            .then(data => setDislikedNarrators(data))
        fetch('/user_favorite_narrators')
            .then(res => res.json())
            .then(data => setFavoriteNarrators(data))

    },[])

    const unfilteredToDisplay = binarySearch(unfilteredNarrators, search)

    function handleOnDragEnd(result) {
        if (!result.destination) return
        if (result.destination.droppableId === result.source.droppableId) return
      
        const draggableId = Number(result.draggableId)
        const sourceListId = result.source.droppableId
        const destinationListId = result.destination.droppableId
      
        const sourceList = getList(sourceListId);
        const destinationList = getList(destinationListId);
      
        const draggedItem = sourceList.find((narrator) => narrator.id === draggableId)
        const updatedSourceList = sourceList.filter((narrator) => narrator.id !== draggableId)
      
        const insertIndex = result.destination.index;
        destinationList.splice(insertIndex, 0, draggedItem)
      
        setList(sourceListId, updatedSourceList)
        setList(destinationListId, destinationList)
        
        if (destinationListId !== 'unfilteredNarrators') {
            let user_vote = false
            let user_favorite = false
            if (destinationListId === 'likedNarrators') {
                user_vote = true
                user_favorite = false
            } else if (destinationListId === 'favoriteNarrators') {
                user_vote = true
                user_favorite = true
            }
            fetch(`/user_filtered_narrators`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    narrator_id: draggableId,
                    user_vote: user_vote,
                    user_favorite: user_favorite
                })
            })
        }
        if (destinationListId === 'unfilteredNarrators') {
            fetch(`/user_filtered_narrators`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    narrator_id: draggableId
                })
            })
        }
      }
      
      function getList(listId) {
        switch (listId) {
          case 'unfilteredNarrators':
            return unfilteredNarrators
          case 'likedNarrators':
            return likedNarrators;
          case 'dislikedNarrators':
            return dislikedNarrators
          case 'favoriteNarrators':
            return favoriteNarrators
          default:
            return [];
        }
      }

      function setList(listId, updatedList) {
        switch (listId) {
          case 'unfilteredNarrators':
            setUnfilteredNarrators(updatedList)
            break;
          case 'likedNarrators':
            setLikedNarrators(updatedList)
            break;
          case 'dislikedNarrators':
            setDislikedNarrators(updatedList)
            break;
          case 'favoriteNarrators':
            setFavoriteNarrators(updatedList)
            break;
          default:
            break;
        }
      }


    return (
        <div className="ListColumnPrimary" >
            <div className="ListHeader">
                <h2>Unfiltered Narrators</h2>
                <h2>Disliked Narrators</h2>
                <h2>Liked Narrators</h2>
                <h2>Favorite Narrators</h2>
            </div>
            <NarratorListContainer 
            unfilteredNarrators={unfilteredToDisplay} 
            likedNarrators={likedNarrators} 
            dislikedNarrators={dislikedNarrators} 
            favoriteNarrators={favoriteNarrators}
            handleOnDragEnd={handleOnDragEnd}
            search={search}
            setSearch={setSearch}
            />
        </div>
    );
}

export default NarratorList;