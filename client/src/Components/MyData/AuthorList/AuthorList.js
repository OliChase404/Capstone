import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import AuthorListCard from "./AuthorListCard";
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import { binarySearch } from "../../Tools";
import AuthorListContainer from "./AuthorListContainer";


function AuthorList() {
    const { user } = useContext(UserContext)

    const [unfilteredAuthors, setUnfilteredAuthors] = useState([])
    const [search, setSearch] = useState('')

    const [likedAuthors, setLikedAuthors] = useState([])
    const [dislikedAuthors, setDislikedAuthors] = useState([])
    const [favoriteAuthors, setFavoriteAuthors] = useState([])



    useEffect(() => {
        fetch('/unfiltered_authors')
            .then(res => res.json())
            .then(data => {
                setUnfilteredAuthors(data)
            })
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


    const unfilteredToDisplay = binarySearch(unfilteredAuthors, search)


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

        
        if (destinationListId !== 'unfilteredAuthors') {
            let user_vote = false
            let user_favorite = false
            if (destinationListId === 'likedAuthors') {
                user_vote = true
                user_favorite = false
            } else if (destinationListId === 'favoriteAuthors') {
                user_vote = true
                user_favorite = true
            }
            fetch(`/user_filtered_authors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    author_id: draggableId,
                    user_vote: user_vote,
                    user_favorite: user_favorite
                })
            })
        }
        if (destinationListId === 'unfilteredAuthors') {
            fetch(`/user_filtered_authors`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    author_id: draggableId
                })
            })
        }
        
        // console.log(result.draggableId)
        // console.log(result.destination.droppableId)
      }
      
      function getList(listId) {
        switch (listId) {
          case 'unfilteredAuthors':
            return unfilteredAuthors
          case 'likedAuthors':
            return likedAuthors;
          case 'dislikedAuthors':
            return dislikedAuthors
          case 'favoriteAuthors':
            return favoriteAuthors
          default:
            return [];
        }
      }

      function setList(listId, updatedList) {
        switch (listId) {
          case 'unfilteredAuthors':
            setUnfilteredAuthors(updatedList)
            break;
          case 'likedAuthors':
            setLikedAuthors(updatedList)
            break;
          case 'dislikedAuthors':
            setDislikedAuthors(updatedList)
            break;
          case 'favoriteAuthors':
            setFavoriteAuthors(updatedList)
            break;
          default:
            break;
        }
      }


    return (
        <div className="ListColumnPrimary" >
            {/* <h1>AuthorList</h1> */}
            <div className="ListHeader">
                <h2>Unfiltered Authors</h2>
                <h2>Disliked Authors</h2>
                <h2>Liked Authors</h2>
                <h2>Favorite Authors</h2>
            </div>
            <AuthorListContainer 
            unfilteredAuthors={unfilteredToDisplay} 
            likedAuthors={likedAuthors} 
            dislikedAuthors={dislikedAuthors} 
            favoriteAuthors={favoriteAuthors}
            handleOnDragEnd={handleOnDragEnd}
            search={search}
            setSearch={setSearch}
            />
        </div>
    );
}

export default AuthorList;