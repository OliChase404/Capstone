import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import AuthorListCard from "./AuthorListCard";
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

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


    const renderUnfilteredAuthors = unfilteredAuthors.map((unfilteredAuthor, index) => {
        return <AuthorListCard key={unfilteredAuthor.id} author={unfilteredAuthor} index={index}/>
      })
    const renderLikedAuthors = likedAuthors.map((likedAuthor, index) => {
        return <AuthorListCard key={likedAuthor.id} author={likedAuthor} index={index}/>
        })
    const renderDislikedAuthors = dislikedAuthors.map((dislikedAuthor, index) => {
        return <AuthorListCard key={dislikedAuthor.id} author={dislikedAuthor} index={index}/>   
        })
    const renderFavoriteAuthors = favoriteAuthors.map((favoriteAuthor, index) => {
        return <AuthorListCard key={favoriteAuthor.id} author={favoriteAuthor} index={index}/>
        })

    function handleOnDragEnd(result) {
        if (!result.destination) return;
        if (result.destination.droppableId === result.source.droppableId) return;

        if (result.draggableId in unfilteredAuthors) {
            if (result.destination.droppableId === "likedAuthors") {
                const updatedList = [...likedAuthors, unfilteredAuthors.find(author => author.id === Number(result.draggableId))]
                setLikedAuthors(updatedList)
            } else if (result.destination.droppableId === "dislikedAuthors") {
                const updatedList = [...dislikedAuthors, unfilteredAuthors.find(author => author.id === Number(result.draggableId))]
                setDislikedAuthors(updatedList)
            } else if (result.destination.droppableId === "favoriteAuthors") {
                const updatedList = [...favoriteAuthors, unfilteredAuthors.find(author => author.id === Number(result.draggableId))]
                setFavoriteAuthors(updatedList)
            }
            const updatedList = unfilteredAuthors.filter(author => author.id !== Number(result.draggableId))
            setUnfilteredAuthors(updatedList)

        } else if (result.draggableId in likedAuthors) {
            if (result.destination.droppableId === "unfilteredAuthors") {
                const updatedList = [...unfilteredAuthors, likedAuthors.find(author => author.id === Number(result.draggableId))]
                setUnfilteredAuthors(updatedList)
            } else if (result.destination.droppableId === "dislikedAuthors") {
                const updatedList = [...dislikedAuthors, likedAuthors.find(author => author.id === Number(result.draggableId))]
                setDislikedAuthors(updatedList)
            } else if (result.destination.droppableId === "favoriteAuthors") {
                const updatedList = [...favoriteAuthors, likedAuthors.find(author => author.id === Number(result.draggableId))]
                setFavoriteAuthors(updatedList)
            }
            const updatedList = likedAuthors.filter(author => author.id !== Number(result.draggableId))
            setLikedAuthors(updatedList)

        } else if (result.draggableId in dislikedAuthors) {
            if (result.destination.droppableId === "unfilteredAuthors") {
                const updatedList = [...unfilteredAuthors, dislikedAuthors.find(author => author.id === Number(result.draggableId))]
                setUnfilteredAuthors(updatedList)
            } else if (result.destination.droppableId === "likedAuthors") {
                const updatedList = [...likedAuthors, dislikedAuthors.find(author => author.id === Number(result.draggableId))]
                setLikedAuthors(updatedList)
            } else if (result.destination.droppableId === "favoriteAuthors") {
                const updatedList = [...favoriteAuthors, dislikedAuthors.find(author => author.id === Number(result.draggableId))]
                setFavoriteAuthors(updatedList)
            }
            const updatedList = dislikedAuthors.filter(author => author.id !== Number(result.draggableId))
            setDislikedAuthors(updatedList)

        } else if (result.draggableId in favoriteAuthors) {
            if (result.destination.droppableId === "unfilteredAuthors") {
                const updatedList = [...unfilteredAuthors, favoriteAuthors.find(author => author.id === Number(result.draggableId))]
                setUnfilteredAuthors(updatedList)
            } else if (result.destination.droppableId === "likedAuthors") {
                const updatedList = [...likedAuthors, favoriteAuthors.find(author => author.id === Number(result.draggableId))]
                setLikedAuthors(updatedList)
            } else if (result.destination.droppableId === "dislikedAuthors") {
                const updatedList = [...dislikedAuthors, favoriteAuthors.find(author => author.id === Number(result.draggableId))]
                setDislikedAuthors(updatedList)
            }
            const updatedList = favoriteAuthors.filter(author => author.id !== Number(result.draggableId))
            setFavoriteAuthors(updatedList)
        }


        

        console.log(result)
        console.log(result.draggableId)
        console.log(result.source.droppableId)
        console.log(result.destination.droppableId)
    }

    return (
        <div className="ListContainer">
            <DragDropContext onDragEnd={(result) => handleOnDragEnd(result)}>
                <Droppable droppableId="unfilteredAuthors">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="ListColumn">
                            {renderUnfilteredAuthors}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="dislikedAuthors">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="ListColumn">
                            {renderDislikedAuthors}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="likedAuthors">
                {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="ListColumn">
                            {renderLikedAuthors}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="favoriteAuthors">
                {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="ListColumn">
                            {renderFavoriteAuthors}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

export default AuthorListContainer;