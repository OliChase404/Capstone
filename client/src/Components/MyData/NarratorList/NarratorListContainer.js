import React from "react";
import NarratorListCard from "./NarratorListCard";
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import { List } from 'react-virtualized';
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - Maybe implement this for performance

function NarratorListContainer({ unfilteredNarrators, likedNarrators, dislikedNarrators, favoriteNarrators, handleOnDragEnd, setSearch}) {

    const renderUnfilteredNarrators = unfilteredNarrators.slice(0, 100).map((unfilteredNarrator, index) => {
        return <NarratorListCard key={unfilteredNarrator.id} narrator={unfilteredNarrator} index={index}/>
      })
    const renderLikedNarrators = likedNarrators.map((likedNarrator, index) => {
        return <NarratorListCard key={likedNarrator.id} narrator={likedNarrator} index={index}/>
        })
    const renderDislikedNarrators = dislikedNarrators.map((dislikedNarrator, index) => {
        return <NarratorListCard key={dislikedNarrator.id} narrator={dislikedNarrator} index={index}/>   
        })
    const renderFavoriteNarrators = favoriteNarrators.map((favoriteNarrator, index) => {
        return <NarratorListCard key={favoriteNarrator.id} narrator={favoriteNarrator} index={index}/>
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
                <Droppable droppableId="unfilteredNarrators">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderUnfilteredNarrators}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="dislikedNarrators">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderDislikedNarrators}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="likedNarrators">
                {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderLikedNarrators}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId="favoriteNarrators">
                {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={snapshot.isDraggingOver ? "ListColumnDragOver" : "ListColumn"}>
                            {renderFavoriteNarrators}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

export default NarratorListContainer;