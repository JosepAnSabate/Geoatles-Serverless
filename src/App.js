import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home';
import About from './routes/about';
import Position from './routes/position';

import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports'
import { withAuthenticator  } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsconfig);

function App({ user }) {
  
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home  userdata={user}  />} />
      <Route path="/about" element={<About   />} />
      <Route path="/position" element={<Position   userdata={user} />} />
    </Routes>
    
    </BrowserRouter>
  );
}

export default withAuthenticator(App);
