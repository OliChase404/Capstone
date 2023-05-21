import React, {useState, useEffect} from "react";
import { UserContext } from "../App";
import AudioPlayer from './AudioPlayer';
// import {fill,} from "./animate.scss";


function BookCard(){
    const { user } = React.useContext(UserContext)
    const [book, setBook] = useState([])
    const [skipped, setSkipped] = useState(JSON.parse(localStorage.getItem('skipped')) || [])

    useEffect(() => {
        localStorage.setItem('skipped', JSON.stringify([]))
        getBook()
    }, [])

    let i = 0

    function getBook() {
        fetch("/recommend_book")
          .then(res => res.json())
          .then(data => {
            setBook(data)
            if (skipped.includes(data.id)) {
              getBook();
              i++;
            } else if (i >= 10) {
              alert("Auto Skip Limit Reached. Resetting.")
              i = 0;
              setSkipped([])
              localStorage.setItem('skipped', JSON.stringify([]))
            }
          })
      }
    function handleFavorite(){
        fetch('/user_filtered_books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    book_id: book.id,
                    user_vote: true,
                    user_favorite: true
                })
            }).then(() => getBook())
          }
    function handleLike() {
        fetch('/user_filtered_books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            book_id: book.id,
            user_vote: true,
            user_favorite: false
          })
        }).then(() => getBook())
      }
      function handleSkip() {
        setSkipped(prevState => [...prevState, book.id]);
        getBook()
      }
    function handleDislike() {
        fetch('/user_filtered_books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    book_id: book.id,
                    user_vote: false,
                    user_favorite: false
                })
            }).then(() => getBook())
          }

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
                <button onClick={() => handleDislike()}>Dislike</button>
                <button onClick={() => handleSkip()}>Skip For Now</button>
                <button onClick={() => window.open(book.audible_url)}>View On Audible</button>
                <button onClick={() => handleLike()}>Like</button>
                <button onClick={() => handleFavorite()}>Favorite</button>
            </div>

        </div>
    )
}


export default BookCard;