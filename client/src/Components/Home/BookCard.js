import React, {useState, useEffect} from "react";
import { UserContext } from "../App";
import AudioPlayer from '../AudioPlayer';


function BookCard(){
    const { user } = React.useContext(UserContext)
    const [book, setBook] = useState([])
    const [bookQueue, setBookQueue] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      fetch("/recommend_books")
      .then(res => res.json())
      .then(books => {
        setBookQueue(books)
        setBook(books[8])
        setLoading(false)
        getBooks()
      })
    }, [])
    
    function next(){
      if (bookQueue.length <= 6) {
        getBooks()
      }
      setBook(bookQueue[0])
      const updatedQueue = bookQueue.slice(1)
      setBookQueue(updatedQueue)
      setLoading(false)
      console.log(bookQueue)
    }

    function getBooks() {
      fetch("/recommend_books")
      .then(res => res.json())
      .then(books => {
        processBook(books)
      })
    }
    function processBook(books) {
      const processedBooks = books.map(book => {
        const processedSummary = book.summary
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\.([a-z])/g, '. $1')
        .replace(/,([A-Z])/g, ', $1')
        .replace(/,([a-z])/g, ', $1')
        return {...book, summary: processedSummary}
      })
      setBookQueue([...processedBooks])
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
                    user_favorite: true,
                    user_skipped: false
                })
            }).then(() => next())
          }
    function handleLike() {
      // setLoading(true)
        fetch('/user_filtered_books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            book_id: book.id,
            user_vote: true,
            user_favorite: false,
            user_skipped: false
          })
        }).then(() => next())
      }
      function handleSkip() {
      // setLoading(true)
        fetch('/user_filtered_books', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  user_id: user.id,
                  book_id: book.id,
                  user_vote: false,
                  user_favorite: false,
                  user_skipped: true,
              })
          }).then(() => next())
      }
    function handleDislike() {
      // setLoading(true)
        fetch('/user_filtered_books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    book_id: book.id,
                    user_vote: false,
                    user_favorite: false,
                    user_skipped: false
                })
            }).then(() => next())
          }

    // const renderGenres = book.genres.map(genre => {
    //   return <p>genre.name</p>
    // })
    // console.log(book)

    return(
      <div>
      {loading ? <h1>Loading...</h1> : 
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
      }
      </div>
    )
}


export default BookCard;