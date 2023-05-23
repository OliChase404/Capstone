import React, {useEffect, useState, useContext} from "react";
import FavoriteCard from "./FavoriteCard";
import { UserContext } from "../../App";


function FavCardContainer() {
    const { user } = useContext(UserContext)
    const [books, setBooks] = useState([])

    useEffect(() => {
        fetch('/user_favorite_books')
            .then(res => res.json())
            .then(data => setBooks(data))
    },[])

    function handleDislike(book_id) {
        fetch(`/user_book/${book_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.id,
                book_id: book_id,
                user_vote: false,
                user_favorite: false
            })
        }).then(() => {
            const newBooks = books.filter(book => book.id !== book_id)
            setBooks(newBooks)
        })
    }

    function handleLike(book_id) {
        fetch(`/user_book/${book_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.id,
                book_id: book_id,
                user_vote: true,
                user_favorite: false
            })
        }).then(() => {
            const newBooks = books.filter(book => book.id !== book_id)
            setBooks(newBooks)
        })
    }


    const renderBooks = books.map(book => {
        return <FavoriteCard key={book.id} book={book} handleLike={handleLike} handleDislike={handleDislike} />
      })

    return (
        <div className="ListContainer">
            {renderBooks}
            <p>{ books.length > 0 ? '' : "You have not added any books to this list yet..." }</p>
        </div>
    )
}

export default FavCardContainer;