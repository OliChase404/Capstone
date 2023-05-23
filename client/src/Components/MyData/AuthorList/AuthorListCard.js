import React from "react";

function AuthorListCard({author}) {
    return (
        <div className="ListColumnCard">
            <div>{author.name}</div>
        </div>
    );
}

export default AuthorListCard;