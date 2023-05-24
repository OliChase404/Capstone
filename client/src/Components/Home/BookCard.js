import React, {useState, useEffect} from "react";
import { UserContext } from "../App";
import AudioPlayer from '../AudioPlayer';
// import {fill,} from "./animate.scss";


function BookCard(){
    const { user } = React.useContext(UserContext)
    const [book, setBook] = useState([])
    const [loading, setLoading] = useState(true)
    const [skipped, setSkipped] = useState([])

    useEffect(() => {
        getBook()
    }, [])

    let i = 0

    function processBookSummary() {
        const summary = book.summary
        let processedSummary = summary.replace(/([a-z])([A-Z])/g, '$1 $2')
        processedSummary = processedSummary.replace(/\.([a-z])/g, '. $1')
        processedSummary = processedSummary.replace(/,([A-Z])/g, ', $1')
        setBook(prevState => ({...prevState, summary: processedSummary}))
    }

    function getBook() {
      setLoading(true)
        fetch("/recommend_book")
          .then(res => res.json())
          .then(data => {
            setBook(data)
            // processBookSummary()
            setLoading(false)
            // setTimeout(() => {
            //   document.querySelector(".BookCard").classList.add("ShowBookCard")
            //   console.log("showing book card")
            // }, 5000)
          })
          // .then(processBookSummary())
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

    // const renderGenres = book.genres.map(genre => {
    //   return <p>genre.name</p>
    // })
    console.log(book)

    return(
      <div>
              {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="BookCard">
            <div className="BookCardUpper">
                <div className="BookCardUpperLeft">
                    <img src={book.cover} alt="Book Cover" />
                    <AudioPlayer src={book.sample} />

                </div>
                <div className="BookCardUpperRight">
                    <h1>{book.title}</h1>
                    <h2>By {book.author} - Read By {book.narrator}</h2>
                    {/* {book[genres][0][genre][name]} */}
                    <p>{book.summary}</p>
                </div>

            </div>
            <div className="BookCardLower">
                <button onClick={() => handleDislike()} className="DislikeButton">Dislike</button>
                <button onClick={() => handleSkip()} className="SkipButton">Skip For Now</button>
                <button onClick={() => window.open(book.audible_url)} className="AudibleButton">View On Audible</button>
                <button onClick={() => handleLike()} className="LikeButton">Like</button>
                <button onClick={() => handleFavorite()} className="FavButton">Favorite</button>
            </div>

        </div>
      )}
      </div>
    )
}


export default BookCard;