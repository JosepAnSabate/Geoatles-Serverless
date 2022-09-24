import React from 'react';
import {MapContainer, TileLayer, Marker, Popup, FeatureGroup} from 'react-leaflet';
import {EditControl} from 'react-leaflet-draw';
//import {Icon} from 'leaflet';
import { useState, useEffect } from 'react';
import "./home.css";
//import { layer } from '@fortawesome/fontawesome-svg-core';
import osm from '../osm-provider';
import L from 'leaflet';
import "leaflet-draw/dist/leaflet.draw.css"


import { mapForm } from '../utils/mapForm.js';

// hooks
import fetchPositions from '../hooks/fetchPositions.jsx';
import useGeoLocation from '../hooks/useGeoLocation';

// utils
import {buildGeoJSON} from '../utils/buildGeoJson.js';

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
    const [mapPoint, setMapPoint] = useState([]);
    const _onCreated = (e) => {
      console.log('created', e);
      console.log('uuuu');
      const {layerType, layer} = e;

    
      
      const {_leaflet_id } = layer;
      console.log('ltlng', layer._latlng);
      const {lat, lng} = layer._latlng;
      setMapPoint(layers => [
        ...layers,
        {id: _leaflet_id, latlngs: layer._latlng}
      ]);

      
      
      try {
        layer.bindPopup(mapForm,{
          keepInView: true,
          closeButton: false
          }).openPopup();
      } catch (error) {
        console.error(error);
      }
    }

    const _onEdited = (e) => {
      console.log('edited', e);
    }

    const _onDeleted = (e) => {
      console.log('deleted', e);
    }

    return (
    <>
      <h2>Hello {user.userdata.username}</h2>
      <pre className="text-left">{JSON.stringify(mapPoint, 0, 2)}</pre>
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