import React from "react";
import {Draggable} from 'react-beautiful-dnd';

function NarratorListCard({narrator, index}) {
    return (
        <Draggable key={narrator.id} draggableId={String(narrator.id)} index={index}>
            {(provided, snapshot) => {
            return(
                <div className={snapshot.isDragging ? "ListColumnCardDragging" : "ListColumnCard"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <div>{narrator.name}</div>
            </div>
                    )
            }}
        </Draggable>
    );
}

export default NarratorListCard;