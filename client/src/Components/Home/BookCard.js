import React, {useState, useEffect} from "react";
import { UserContext } from "../App";


function BookCard(){
    const { user } = React.useContext(UserContext);
    const [book, setBook] = useState([]);

    useEffect(() => {
        fetch("/books/1")
            .then(res => res.json())
            .then(data => {
                setBook(data);
            })
    }, [])


    return(
        <div className="BookCard">
            {book.title}
        </div>
    )
}


export default BookCard;