import React, {useState, useEffect} from 'react';
import "./position.css";

import fetchOnePosition from '../hooks/fetchOnePosition.jsx';



function Position (user){
    //console.log('user from props', user.userdata); // from props
    let userId = user.userdata.attributes.sub;
    const id = window.location.pathname.split('/')[2];
    //console.log('id', id);
    //console.log('userId', userId);
    const [position, setPosition] = useState("");

    useEffect(() => {
      fetchOnePosition(userId, id)
        .then((data) => { setPosition(data); })
    }, []);

    //console.log('position', position);

    
    return (
      <>

      <br /><br />
      {setPosition !== "" &&
      <div className='container' style={{maxWidth:'80%'}}>
        <div style={{width: '100%', maxWidth:'400px'}}>            
                  <div className='post-heading'>
                    <h3>{position.title}</h3>
                    <br />
                  </div>
                  <br />
                  <div className='text-center'>
                    {position.urlImg !== "" &&
                    <img src={position.urlImg}  style={{maxWidth:'98%'}} />
                    }
                    <br />
                    <p className='post-meta'>Lat: {parseFloat(position.lat).toFixed(7)}, Long: {parseFloat(position.long).toFixed(7)}</p>
                    <h5 className='subheading'>{position.description}</h5>           
                    <p className='post-meta'>Creat al: {position.date}</p>
                  </div>           
        </div>
      </div>
  }
      </>
    )
    
}

export default Position;