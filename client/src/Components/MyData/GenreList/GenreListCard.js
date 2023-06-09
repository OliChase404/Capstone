import React from "react";
import {Draggable} from 'react-beautiful-dnd';


function GenreListCard({genre, index}) {
    return (
        <Draggable key={genre.id} draggableId={String(genre.id)} index={index}>
            {(provided, snapshot) => {
            return(
                <div className={snapshot.isDragging ? "ListColumnCardDragging" : "ListColumnCard"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <div>{genre.name}</div>
            </div>
                    )
            }}
        </Draggable>
    );
}

export default GenreListCard;