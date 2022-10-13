import React from 'react';
import {useNavigate} from 'react-router-dom';
import ReactDOMServer from "react-dom/server";
import * as AWS from 'aws-sdk'
import {MapContainer, TileLayer, Marker, Popup, FeatureGroup} from 'react-leaflet';
import {EditControl} from 'react-leaflet-draw';
//import {Icon} from 'leaflet';
import { useState, useEffect } from 'react';
import "./home.css";
//import { layer } from '@fortawesome/fontawesome-svg-core';
import osm from '../osm-provider';
import L from 'leaflet';
import "leaflet-draw/dist/leaflet.draw.css"

import { MuiThemeProvider } from '@material-ui/core/styles';


import post from "../clients/HttpClient";
// hooks
import fetchPositions from '../hooks/fetchPositions.jsx';
import useGeoLocation from '../hooks/useGeoLocation';

// utils
//import { mapForm } from '../utils/mapForm.js';
import { AlertSuccess } from '../utils/AlertSuccess';
//import {buildGeoJSON} from '../utils/buildGeoJson.js';



const markerIcon = new L.icon({
  iconUrl: require('../img/location.png'),
  iconSize: [40, 41],
})


function Home (user){
    //console.log('user',user.userdata.username);
    const userId = user.userdata.username
    const [positions, setPositions] = useState("");
    const [activePosition, setactivePosition] = useState(null);

    useEffect(() => {
      fetchPositions(userId)
        .then((data) => { setPositions(data); })
    }, []);
    
    // building the geogson a partir de dynamodb data
    const data ={
      "type": "FeatureCollection",
      "features": []
    };
    
    for (let i = 0; i < positions.Count; i++) {
      data.features.push({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            parseFloat(positions.Items[i].lat), parseFloat(positions.Items[i].long)
          ]
        },
        "properties": {
          "id": positions.Items[i].id,
          "title": positions.Items[i].title,
          "description": positions.Items[i].description,
          "urlImg": positions.Items[i].urlImg,
          "date": positions.Items[i].date,
          "lat": positions.Items[i].lat,
          "long": positions.Items[i].long,
        }
      });
    }
    
    const [center, setCenter] = useState({lat: 41.505, lng: 1.834});
    // user location
    const location = useGeoLocation();

    //console.log('items', positions.Items);
    //console.log('items 0', positions.Items[0].location);
    console.log('data', data);

    /// POST ///
    //https://javascript.plainenglish.io/how-to-upload-files-to-aws-s3-in-react-591e533d615e
    const accessKeyId = process.env.REACT_APP_ACCESS_KEY_ID;
    const secretAccessKey = process.env.REACT_APP_SECRETACCESSKEY;
    const s3BucketImg = process.env.REACT_APP_S3_BUCKET_IMG;
    
    AWS.config.update(
        {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey, 
        region: 'eu-west-1'
    })

    const myBucket = new AWS.S3({
        params: { Bucket: s3BucketImg},
        region: 'eu-west-1',
    })

    const initialFormData = {
        title: '',
        description: '',
        urlImg: '',
      };

    const [formData, setFormData] = useState(initialFormData);
    const [formSuccess, setFormSuccess] = useState('');
    const [formErrors, setFormErrors] = useState([]);

    // show or not form
    const [showForm, setShowForm] = useState();

    // S3
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0]);
        formData.urlImg = e.target.files[0].name;
    }
    
    //console.log('selectedFile', selectedFile);
    
    
    // for redirecting to the home page
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        // form:  https://medium.com/weekly-webtips/a-complete-guide-to-react-forms-15fa079c6177 
        e.preventDefault();
    
        try {
          // Send POST request
          //await axios.post('http://localhost:5000/api/v1/person', formData);
          //console.log('formData', formData);
          const date = new Date()
          const day = date.getDate();
          const month = date.getMonth() + 1; // getMonth() returns month from 0 to 11
          const year = date.getFullYear();
          formData.date = `${day}/${month}/${year}`; 
          formData.userId = userId;
          formData.lat = mapPoint.latlngs.lat.toString();
          formData.long = mapPoint.latlngs.lng.toString();

          // test borrar 
          //formData.urlImg = '';
 
          console.log('formData', formData);
          const response = await post(
            `https://01djeb5cph.execute-api.eu-west-1.amazonaws.com/dev/post_location_py`,
            JSON.stringify(formData)
          ).catch((error) => {  
            setFormSuccess('Format de les coordenades no vàlid.');
          });

          
          const data = await response.data;
          console.log('dataf', data);  
          
          //console.log('file', selectedFile); 
          // S3 if image is uploaded
          if (formData.urlImg !== '') {
            const params = {
              ACL: 'public-read',
              Body: selectedFile,
              Bucket: 'geoatles-serverless-images',
              Key: formData.urlImg,
            };
            //console.log('params', params);
            myBucket.putObject(params)
              .send((err) => {
                  if (err) console.log(err)
              })
          }

          // HTTP req successful
          setFormSuccess('Data received correctly');
    
          // Reset form data
          setFormData(initialFormData);
          
          setTimeout(window.location.reload(false), 3000);
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
    
    const  handleChange = (e) => {
      console.log(formData)
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      setFormErrors([]);
      setFormSuccess('');
    };

    const handleTest = async (e) => {
      e.preventDefault();
      console.log('test');
    }
    

    // react leaflet post
    const [mapPoint, setMapPoint] = useState([]);
    
    const _onCreated = (e) => {
      console.log('created', e);
      const {layerType, layer} = e;

      const {_leaflet_id } = layer;
      console.log('ltlng', layer._latlng);
      const {lat, lng} = layer._latlng;
      // setMapPoint(layers => [...layers, {id: _leaflet_id, latlngs: layer._latlng} ]);
      setMapPoint({id: _leaflet_id, latlngs: layer._latlng});
      
      formData.lat = lat.toString();
      console.log('long', lng);
      formData.long = lng.toString();
      setShowForm(true);
      // try {
      //   layer.bindPopup(
      //     mapForm,{
      //     keepInView: true,
      //     closeButton: false
      //     }).openPopup();
      // } catch (error) {
      //   console.error(error);
      // }
    }

    const _onEdited = (e) => {
      console.log('edited', e);
    }

    const _onDeleted = (e) => {
      console.log('deleted', e);
      setShowForm(false);
    }



    return (
    <>
      <h2>Hello {user.userdata.username}</h2>
      {showForm == true && 
        <div className="create-form">
          <form onSubmit={handleSubmit} className="form">
          <button type="button" onClick={_onDeleted} style={{float: "right", paddingTop: "8px"}} className="btn-close" aria-label="Close"></button>
            <label style={{paddingTop: "8px"}}>Títol</label>  
            <input
              type="text"
              name="title"  
              className="input"
              value={formData.title}
              onChange={handleChange}
            />
            <br />
            <label>Descripció</label>
            <input
              type="text"
              name="description"
              className="input"
              value={formData.description}
              onChange={handleChange}
            />
            <br />
            <label>Imatge</label>
            <input
              type="file"
              name="urlImg"
              className="input"
              onChange={handleFileInput}
             // onChange={handleFileChange}
            />
            <br />
            <label>Lat: {mapPoint.latlngs.lat.toFixed(5)}, Long: {mapPoint.latlngs.lng.toFixed(5)}</label>
            
            <br />
            <button className='button-form' onSubmit={() => handleChange()}>Afegeix Posició</button>

          </form>
        </div>
      }
      {/* <pre className="text-left">{JSON.stringify(mapPoint, 0, 2)}</pre> */}
      <MapContainer center={center}
         zoom={8} scrollWheelZoom={false}>
        {/* osm leaflet default */}
        {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
        <TileLayer 
          url={osm.maptiler.url} attribution={osm.maptiler.attribution} 
        />
        {location.loaded && !location.error && (
          <Marker position={[location.coordinates.lat, location.coordinates.lng]} icon={markerIcon}>
            <Popup>
              <p>La Meva Posició</p>
              <p>Latitud: {location.coordinates.lat} Longitud:{location.coordinates.lng}</p>
            </Popup>
          </Marker>
        )}
        <FeatureGroup>
          <EditControl 
            onCreated={_onCreated}
            position='topright' 
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              polyline: false,
              polygon: false,
              marker: true,
            }}
          />
        </FeatureGroup>
        {data.features.map(position => (
          <Marker 
            key={position.properties.id} 
            position={position.geometry.coordinates}
            // icon={markerIcon} // customized marker
          > 
          <Popup>
          <div>
            <h2>{position.properties.title}</h2>
            <p>{position.properties.description}</p>
            <img src={position.properties.urlImg} width="320"/> 
            <p>{position.properties.date}</p>
            <p>Lang: {position.properties.lat}, Long: {position.properties.long}</p>
            
          </div>
        </Popup>
        </Marker>
          ))
        }
        {activePosition && (
        <Popup
          position={[
            activePosition.geometry.coordinates[1], 
            activePosition.geometry.coordinates[0]
          ]}
          onClose={() => {
            setactivePosition(null);
          }}
        >
          <div>
            <h2>hola</h2>
          </div>
        </Popup>)}
        
      </MapContainer>
    </>
    )
    
}
  
export default Home;