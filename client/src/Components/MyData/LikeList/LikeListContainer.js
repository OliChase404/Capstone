import React from "react";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";
import LikeListCard from "./LikeListCard";

function LikeListContainer() {
    const { user } = useContext(UserContext);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch('/user_liked_books')
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

    function handleFavorite(book_id) {
        fetch(`/user_book/${book_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.id,
                book_id: book_id,
                user_vote: true,
                user_favorite: true
            })
        }).then(() => {
            const newBooks = books.filter(book => book.id !== book_id)
            setBooks(newBooks)
        })
    }

    const renderBooks = books.map(book => {
        return <LikeListCard key={book.id} book={book} handleDislike={handleDislike} handleFavorite={handleFavorite}/>
    })
    return (
        <div className="LikeListContainer">
            {renderBooks}
            <p>{ books.length > 0 ? '' : "You have not added any books to this list yet..." }</p>
        </div>
    )
}

export default LikeListContainer;