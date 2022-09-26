import React, {useState} from 'react';
import { Auth } from 'aws-amplify';
import "./createPosition.css";
import * as AWS from 'aws-sdk'
import { ConfigurationOptions, EnvironmentCredentials } from 'aws-sdk'
import {Link, Routes, Route, useNavigate} from 'react-router-dom';

import post from "../clients/HttpClient";
import { AlertError } from '../utils/AlertError';
import { AlertSuccess } from '../utils/AlertSuccess';

function CreatePosition (){
    Auth.currentAuthenticatedUser().then((userFromAuth) => {
        //console.log('user = ' + JSON.stringify(userFromAuth.attributes));
        const userId = userFromAuth.attributes.sub;
    });

    //https://javascript.plainenglish.io/how-to-upload-files-to-aws-s3-in-react-591e533d615e

    const S3_BUCKET ='geoatles-serverless-images';
    const REGION ='eu-west-1';

    AWS.config.update(
        {
        accessKeyId: '',
        secretAccessKey: '', 
        region: 'eu-west-1'
    })


    const initialFormData = {
        title: '',
        description: '',
      };
    
    const [formData, setFormData] = useState(initialFormData);
    const [formSuccess, setFormSuccess] = useState('');
    const [formErrors, setFormErrors] = useState([]);

    // for redirecting to the home page
    const navigate = useNavigate();

    const handleSubmit = async (e) => {

      // form:  https://medium.com/weekly-webtips/a-complete-guide-to-react-forms-15fa079c6177 
        e.preventDefault();
    
        try {
          // Send POST request
          //await axios.post('http://localhost:5000/api/v1/person', formData);
          
          const date = new Date()
          const day = date.getDate();
          const month = date.getMonth() + 1; // getMonth() returns month from 0 to 11
          const year = date.getFullYear();
          formData.date = `${day}/${month}/${year}`; 
          const user = (await Auth.currentAuthenticatedUser())["attributes"]["sub"];
          formData.userId = user;
          formData.urlImg = 't-1.amazonaws.com';

          //console.log('formData', formData);
          //console.log('ki soc', user);

          const response = await post(
            `https://01djeb5cph.execute-api.eu-west-1.amazonaws.com/dev/post_location_py`,
            JSON.stringify(formData)
          );
          
          //const data = await response.data;
          //console.log('response', response);
          //console.log('data', data);  
          
          // HTTP req successful
          setFormSuccess('Data received correctly');
    
          // Reset form data
          setFormData(initialFormData);
          navigate('/');
          //return data;
        } catch (err) {
          handleErrors(err);
        }
      };
    
      const handleErrors = (err) => {
        if (err.response.data && err.response.data.errors) {
          // Handle validation errors
          const { errors } = err.response.data;
    
          let errorMsg = [];
          for (let error of errors) {
            const { msg } = error;
    
            errorMsg.push(msg);
          }
    
          setFormErrors(errorMsg);
        } else {
          // Handle generic error
          setFormErrors(['Oops, there was an error!']);
        }
      };
    
      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
        setFormErrors([]);
        setFormSuccess('');
      };
    
    

    return (
      <>
      <br /> <br /><br /> 
      <div className='create'>
      <AlertSuccess success={formSuccess} />
      
      <h3>CreatePosition</h3>
      <br />
      <form onSubmit={handleSubmit} className="form">
        <label>Títol</label>
        <input  
            type="text" 
            name="title" 
            className="input"
            value={formData.title} 
            onChange={handleChange}
            required 
        /> 
        <br />
        <label>Descripció</label>
        <input  
            type="text" 
            name="description" 
            className="input"
            value={formData.description} 
            onChange={handleChange}
            required 
        /> 
        <br />
        <label>Imatge</label>
        {/* <input type="file" onChange={() => handleSubmit()  }></input> */}
        <br />
        <label className="label-forms">Coordenades</label>
                <input  
                    type="text" 
                    name="long" 
                    className="input"
                    placeholder="Longitud: 1.42756"
                    value={formData.long || ""} 
                    onChange={handleChange}
                    required 
                /> 
                <input  
                    type="text" 
                    name="lat" 
                    className="input"
                    placeholder="Latitud: 41.57179"
                    value={formData.lat || ""} 
                    onChange={handleChange}
                    required 
                /> 
                
        <button onSubmit={handleChange}>Afegeix Posició</button>
      </form>
      </div>
      </>
    )
}

export default CreatePosition;