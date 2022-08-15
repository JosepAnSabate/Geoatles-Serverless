import React from 'react';
import { Link } from "react-router-dom";
import { Auth } from 'aws-amplify';


function Position (user){
    console.log('user from props', user.userdata); // from props
    // user data from auth
    Auth.currentAuthenticatedUser().then((userFromAuth) => {
        console.log('user email = ' + userFromAuth.attributes.email);
      });

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
      </nav>
      <h3>Position</h3>
      <h1>Hello {user.userdata.username}</h1>
     
      <button onClick={signOut}>Sign out</button> 
    </>
    )
    
}

export default Position;