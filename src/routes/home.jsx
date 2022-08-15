import React from 'react';
import { Link } from "react-router-dom";
import { Auth } from 'aws-amplify';


function Home (user){
    //console.log(user.userdata);

    return (
        <>
      <h3>hu</h3>
      <h1>Hello {user.userdata.username}</h1>
    </>
    )
    
}
  
export default Home;