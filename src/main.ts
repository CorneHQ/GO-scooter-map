// Load in the CSS Files
import './style.css'
import 'leaflet/dist/leaflet.css';

// Load in the modules
import * as L from 'leaflet';
import axios from 'axios';
import LicensePlate from 'license-plate';

alert('Double click on a location to load in the scooters in the area!')

// Custom icon for the markers
const scooterIcon = L.icon({
    iconUrl: 'scooter-2-32.png'
});

const map: L.Map = L.map('app')
    .setView([52.0842715, 5.0124522], 8);

// Make a group for the markers
const markerGroup = L.layerGroup()
    .addTo(map);

// Disable double click for the event
map.doubleClickZoom.disable();

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const onMapClick = (e: { latlng: L.LatLngExpression; }) => {
    // Clear all the previous markers
    markerGroup.clearLayers()

    // Set the map to the new coords of the user
    map.setView(e.latlng, 12)

    // @ts-ignore
    // Get all the GO scooters from the API
    axios.get(`https://greenmo.core.gourban-mobility.com/front/vehicles?lat=${e.latlng.lat}&lng=${e.latlng.lng}&rad=2`)
        .then(response => {
            response.data.forEach((element: { position: { coordinates: number[]; }; licensePlate: string; stateOfCharge: number; remainingKilometers: number; address: string; }) => {
                L.marker([element.position.coordinates[1], element.position.coordinates[0]], { icon: scooterIcon })
                    .bindPopup(`<b>Kenteken:</b> ${new LicensePlate(element.licensePlate).pretty()}<br><b>Batterijpercentage:</b> ${element.stateOfCharge}%<br><b>Aantal kilometers over:</b> ${element.remainingKilometers}KM<br><b>Adres:</b> ${element.address}`)
                    .addTo(markerGroup)
            })
        })
        .catch(error => console.error(error))
}

map.on('dblclick', onMapClick)


