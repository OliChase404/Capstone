import React from "react";
import GenreListCard from "./GenreListCard";
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import { List } from 'react-virtualized';
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - Maybe implement this for performance

function GenreListContainer({ unfilteredGenres, likedGenres, dislikedGenres, favoriteGenres, handleOnDragEnd, setSearch}) {

    const renderUnfilteredGenres = unfilteredGenres.slice(0, 100).map((unfilteredGenre, index) => {
        return <GenreListCard key={unfilteredGenre.id} genre={unfilteredGenre} index={index}/>
      })
    const renderLikedGenres = likedGenres.map((likedGenre, index) => {
        return <GenreListCard key={likedGenre.id} genre={likedGenre} index={index}/>
        })
    const renderDislikedGenres = dislikedGenres.map((dislikedGenre, index) => {
        return <GenreListCard key={dislikedGenre.id} genre={dislikedGenre} index={index}/>   
        })
    const renderFavoriteGenres = favoriteGenres.map((favoriteGenre, index) => {
        return <GenreListCard key={favoriteGenre.id} genre={favoriteGenre} index={index}/>
        })

        function searchUnfiltered(event) {
            setSearch(event.target.value)
        }

    return (
        <div className="ListColumnContainer">
            <div className="ListHeader">
                <input onChange={(event) => searchUnfiltered(event)} type="text" placeholder="Search..."/>
            </div>
            <DragDropContext onDragEnd={(result) => handleOnDragEnd(result)}>
                <Droppable droppableId="unfilteredGenres">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderUnfilteredGenres}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="dislikedGenres">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderDislikedGenres}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="likedGenres">
                {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderLikedGenres}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="favoriteGenres">
                {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderFavoriteGenres}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

export default GenreListContainer