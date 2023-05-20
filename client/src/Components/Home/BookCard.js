import React, {useState, useEffect} from "react";
import { UserContext } from "../App";
import AudioPlayer from './AudioPlayer';
// import {fill,} from "./animate.scss";


function BookCard(){
    const { user } = React.useContext(UserContext);
    const [book, setBook] = useState([]);

    useEffect(() => {
        fetch("/books/5")
            .then(res => res.json())
            .then(data => {
                setBook(data);
            })
    }, [])


    return(
        <div className="BookCard">
            <div className="BookCardUpper">
                <div className="BookCardUpperLeft">
                    <img src={book.cover} alt="Book Cover" />
                    <AudioPlayer src={book.sample} />

                </div>
                <div className="BookCardUpperRight">
                    <h1>{book.title}</h1>
                    <h2>By {book.author} - Read By {book.narrator}</h2>
                    <span></span>
                    <p>{book.summary}</p>
                </div>

            </div>
            <div className="BookCardLower">
                <button>Dislike</button>
                <button>Skip For Now</button>
                <button onClick={() => window.open(book.audible_url)}>View On Audible</button>
                <button>Like</button>
                <button>Favorite</button>
            </div>

        </div>
    )
}


export default BookCard;