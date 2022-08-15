import React from 'react';
import { Link } from "react-router-dom";
import { Auth } from 'aws-amplify';


function Home (user){
    //console.log(user.userdata);
    

    async function signOut() {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    return (
        <>
      <nav
        style={{
          borderBottom: "solid 1px",
          paddingBottom: "1rem",
        }}
      >
        <Link to="/about">About</Link> 
        <Link to="/position">Position</Link> 
      </nav>
      <h3>hu</h3>
      <h1>Hello {user.userdata.username}</h1>
     
      <button onClick={signOut}>Sign out</button> 
    </>
    )
    
}
  
export default Home;