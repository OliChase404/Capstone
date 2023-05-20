import React, { UseContext } from "react";
import { UserContext } from "../App";
import BookCard from "./BookCard";

function Home() {
    const { user } = React.useContext(UserContext);
    return (
        <div>
            <BookCard />
        </div>
    );
}

export default Home;