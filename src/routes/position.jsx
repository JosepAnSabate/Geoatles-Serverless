import React from 'react';
import { Auth } from 'aws-amplify';



function Position (user){
    console.log('user from props', user.userdata); // from props
    // user data from auth
    Auth.currentAuthenticatedUser().then((userFromAuth) => {
        console.log('user email = ' + userFromAuth.attributes.email);
      });

    return (
      <>
      <h3>Position</h3>
      <h2>Hello {user.userdata.username}</h2>
      </>
    )
    
}

export default Position;