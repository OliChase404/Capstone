import React from "react";
import {Draggable} from 'react-beautiful-dnd';

function AuthorListCard({author, index}) {
    return (
        <Draggable key={author.id} draggableId={String(author.id)} index={index}>
            {(provided, snapshot) => {
            return(
                <div className={snapshot.isDragging ? "ListColumnCardDragging" : "ListColumnCard"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <div>{author.name}</div>
            </div>
                    )
            }}
        </Draggable>
    );
}

export default AuthorListCard;