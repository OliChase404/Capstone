import React from "react";
import AudioPlayer from "../../AudioPlayer";

function FavoriteCard({book, handleDislike, handleLike}) {

    return(
        <div className="ListCard">
            <div className="ListCardUpper">
                <div className="ListCardUpperLeft">
                    <img src={book.cover} alt="Book Cover" />
                </div>
                    <div className="ListCardUpperRight">
                        <h1>{book.title}</h1>
                        <h2>By {book.author} - Read By {book.narrator}</h2>

                        <AudioPlayer src={book.sample} />
                        <div className="ListCardLower">
                            {/* <button>Dislike</button> */}
                            <button onClick={() => window.open(book.audible_url)}>View On Audible</button>
                            <button onClick={() => handleDislike(book.id)}>Move To Dislike List</button>
                            <button onClick={() => handleLike(book.id)}>Move To Like List</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FavoriteCard;