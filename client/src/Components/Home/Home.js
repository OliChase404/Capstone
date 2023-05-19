import React, { UseContext } from "react";
import { UserContext } from "../App";

function Home() {
    const { user } = React.useContext(UserContext);
    return (
        <div>
            <h1>Welcome {user.username}</h1>
        </div>
    );
}

export default Home;