import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import AuthorListCard from "./AuthorListCard";
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import { binarySearch } from "../../Tools";
import { List } from 'react-virtualized';
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - Maybe implement this for performance

function AuthorListContainer({ unfilteredAuthors, likedAuthors, dislikedAuthors, favoriteAuthors, handleOnDragEnd, setSearch}) {

    const renderUnfilteredAuthors = unfilteredAuthors.slice(0, 20).map((unfilteredAuthor, index) => {
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

        function searchUnfiltered(event) {
            setSearch(event.target.value)
        }

    return (
        <div className="ListColumnContainer">
            <div className="ListHeader">
                <input onChange={(event) => searchUnfiltered(event)} type="text" placeholder="Search..." className="SearchBar"/>
                <input type="text" placeholder="Search..." className="SearchBar"/>
                <input type="text" placeholder="Search..." className="SearchBar"/>
                <input type="text" placeholder="Search..." className="SearchBar"/>
            </div>
            <DragDropContext onDragEnd={(result) => handleOnDragEnd(result)}>
                <Droppable droppableId="unfilteredAuthors">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderUnfilteredAuthors}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="dislikedAuthors">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderDislikedAuthors}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="likedAuthors">
                {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderLikedAuthors}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="favoriteAuthors">
                {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
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