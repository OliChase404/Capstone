import React, {useState, useEffect} from "react";
import { UserContext } from "../App";
import AudioPlayer from '../AudioPlayer';


function BookCard(){
    const { user } = React.useContext(UserContext)
    const [book, setBook] = useState([])
    const [bookQueue, setBookQueue] = useState([])
    const [loading, setLoading] = useState(true)

    const [userFilteredGenres, setUserFilteredGenres] = useState([])
    const [userFilteredAuthors, setUserFilteredAuthors] = useState([])
    const [userFilteredNarrators, setUserFilteredNarrators] = useState([])

    console.log(bookQueue)

    useEffect(() => {
      fetch("/recommend_books")
      .then(res => res.json())
      .then(books => {
        setBookQueue(books)
        setBook(books[8])
        setLoading(false)
        getBooks()
      })

      fetch(`/user_filtered_genres`)
      .then(res => res.json())
      .then(genres => setUserFilteredGenres(genres))

      fetch(`/user_filtered_authors`)
      .then(res => res.json())
      .then(authors => setUserFilteredAuthors(authors))

      fetch(`/user_filtered_narrators`)
      .then(res => res.json())
      .then(narrators => setUserFilteredNarrators(narrators))
    }, [])
    
    function next(){
      if (bookQueue.length <= 10) {
        getBooks()
      }
      const updatedQueue = bookQueue.slice(1)
      setBookQueue(updatedQueue)
      setBook(bookQueue[0])
      setLoading(false)
      // console.log(bookQueue)
    }

    function getBooks() {
      // setLoading(true)
      fetch("/recommend_books")
      .then(res => res.json())
      .then(books => {
        processBooks(books)
      })
    }
    function processBooks(books) {
      const processedBooks = books.map(book => {
        const processedSummary = book.summary
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\.([a-z])/g, '. $1')
        .replace(/,([A-Z])/g, ', $1')
        .replace(/,([a-z])/g, ', $1')
        return {...book, summary: processedSummary}
      })
      const processedBooks2 = processedBooks.map(book => {
        if (book.author.includes(',')) {
          const author = book.author.split(',')
          return {...book, author: author[0]}
        } else {
          return book;
        }
      })
      setBookQueue(processedBooks2)
    }
    
    const favAuthors = []
    const LikedAuthors = []
    const DislikedAuthors = []
    if (userFilteredAuthors) {
      for (const author of userFilteredAuthors) {
        if (author.user_favorite) {
          favAuthors.push(author.author_id)
        } else if (author.user_vote) {
          LikedAuthors.push(author.author_id)
        } else if (!author.user_vote) {
          DislikedAuthors.push(author.author_id)
        }
      }
    }
    const favNarrators = []
    const LikedNarrators = []
    const DislikedNarrators = []
    if (userFilteredNarrators) {
      for (const narrator of userFilteredNarrators) {
        if (narrator.user_favorite) {
          favNarrators.push(narrator.narrator_id)
        } else if (narrator.user_vote) {
          LikedNarrators.push(narrator.narrator_id)
        } else if (!narrator.user_vote) {
          DislikedNarrators.push(narrator.narrator_id)
        }
      }
    }
    const favGenres = []
    const LikedGenres = []
    const DislikedGenres = []
    if (userFilteredGenres) {
      for (const genre of userFilteredGenres) {
        if (genre.user_favorite) {
          favGenres.push(genre.genre_id)
        } else if (genre.user_vote) {
          LikedGenres.push(genre.genre_id)
        } else if (!genre.user_vote) {
          DislikedGenres.push(genre.genre_id)
        }
      }
    }

    let renderGenres = []
    if (book.genres){
      renderGenres = book.genres.map(genre => {
      if(genre.genre.name.length > 2){        
        return (
        <p 
        key={genre.genre_id} 
        onClick={() => toggleGenre(genre.genre.id)}
        className={favGenres.includes(genre.genre.id) ?
        "GenreTagFav" : LikedGenres.includes(genre.genre.id) ? 
        "GenreTagLike" : DislikedGenres.includes(genre.genre.id) ?
        "GenreTagDislike" : ""} >
          {genre.genre.name}
        </p>
        )}
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
      

    function toggleGenre(Id){
      let fav = false
      let vote = false
      if (favGenres.includes(Id)) {
        fetch(`/user_filtered_genres`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            genre_id: Id
          })
        }).then(() => {
          fetch(`/user_filtered_genres`)
          .then(res => res.json())
          .then(genres => setUserFilteredGenres(genres))
        })
        return
      }
      if (LikedGenres.includes(Id)) {
        vote = true
        fav = true
      }
      if (DislikedGenres.includes(Id)) {
        vote = true
      }
      fetch(`/user_filtered_genres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          genre_id: Id,
          user_vote: vote,
          user_favorite: fav,
        })
      }).then(() => {
        fetch(`/user_filtered_genres`)
        .then(res => res.json())
        .then(genres => setUserFilteredGenres(genres))
      })
  }
    function toggleNarrator(){
      let fav = false
      let vote = false
      if (favNarrators.includes(book.narrator_id)) {
        fetch(`/user_filtered_narrators`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            narrator_id: book.narrator_id
          })
        }).then(() => {
          fetch(`/user_filtered_narrators`)
          .then(res => res.json())
          .then(narrators => setUserFilteredNarrators(narrators))
        })
        return
      }
      if (LikedNarrators.includes(book.narrator_id)) {
        vote = true
        fav = true
      }
      if (DislikedNarrators.includes(book.narrator_id)) {
        vote = true
      }
      fetch(`/user_filtered_narrators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          narrator_id: book.narrator_id,
          user_vote: vote,
          user_favorite: fav,
        })
      }).then(() => {
        fetch(`/user_filtered_narrators`)
        .then(res => res.json())
        .then(narrators => setUserFilteredNarrators(narrators))
      }
      )
    }
    let narratorClass = ""
    if (favNarrators.includes(book.narrator_id)) {
      narratorClass = "AuthorNarratorTagFav"
    } else if (LikedNarrators.includes(book.narrator_id)) {
      narratorClass = "AuthorNarratorTagLiked"
    } else if (DislikedNarrators.includes(book.narrator_id)) {
      narratorClass = "AuthorNarratorTagDisliked"
    }

    function toggleAuthor(){
      let fav = false
      let vote = false
      if (favAuthors.includes(book.author_id)) {
        fetch(`/user_filtered_authors`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            author_id: book.author_id
          })
        }).then(() => {
          fetch(`/user_filtered_authors`)
          .then(res => res.json())
          .then(authors => setUserFilteredAuthors(authors))
        })
        return
      }
      if (LikedAuthors.includes(book.author_id)) {
        vote = true
        fav = true
      }
      if (DislikedAuthors.includes(book.author_id)) {
        vote = true
      }
      fetch(`/user_filtered_authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          author_id: book.author_id,
          user_vote: vote,
          user_favorite: fav,
        })
      }).then(() => {
        fetch(`/user_filtered_authors`)
        .then(res => res.json())
        .then(authors => setUserFilteredAuthors(authors))
      }
      )
    }
    let authorClass = ""
    if (favAuthors.includes(book.author_id)) {
      authorClass = "AuthorNarratorTagFav"
    } else if (LikedAuthors.includes(book.author_id)) {
      authorClass = "AuthorNarratorTagLiked"
    } else if (DislikedAuthors.includes(book.author_id)) {
      authorClass = "AuthorNarratorTagDisliked"
    }

    return(
      <div>
      {loading ? <h1>Loading...</h1> : 
      <div className="BookCard">
            <div className="BookCardUpper">
                <div className="BookCardUpperLeft">
                    <img src={book.cover} alt="Book Cover" />
                    <AudioPlayer src={book.sample} />
                      <h2 className="GenreTagContainerHeading">Genre Tags</h2>
                    <div className="GenreTagContainer">
                    {renderGenres}
                    </div>
                </div>
                <div className="BookCardUpperRight">
                    <h1>{book.title}</h1>

                    <div className="AuthorNarratorContainer">
                        <div className="AuthorNarrator">
                            <p>Author</p>
                          <div onClick={() => toggleAuthor()} className={"AuthorNarratorTag " + authorClass}>{book.author}</div>
                        </div>
                        <div className="AuthorNarrator">
                            <p>Narrator</p>
                          <div onClick={() => toggleNarrator()} className={"AuthorNarratorTag " + narratorClass}>{book.narrator}</div>
                        </div>

                      </div>

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