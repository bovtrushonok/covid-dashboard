const requestOptions = {
  method: 'GET',
  redirect: 'follow',
};
const { L } = window;
const Map = L.map('mapBlock').setView([25, 31], 2.3);
let geoJson;
const geojsonMarkerOptions = {
  radius: 5,
  fillColor: '#ff7800',
  color: '#000',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.5,
};

async function createGeoJSON() {
  const response = await fetch('https://disease.sh/v3/covid-19/jhucsse', requestOptions);
  const data = await response.text();
  const result = await JSON.parse(data);

  return result;
}

export default function createMap() {
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoidGVkZHlrYXR6IiwiYSI6ImNraXQzeTZseDEzcXkzMWwzc3R4b2JtcGsifQ.6c4tCeNZLPWxAMUugvrPJA',
  }).addTo(Map);

  createGeoJSON()
    .then((res) => {
      geoJson = {
        type: 'FeatureCollection',
        features: res.map((countryInfo) => {
          const { confirmed, deaths, recovered } = countryInfo.stats;
          const { latitude, longitude } = countryInfo.coordinates;
          return {
            type: 'Feature',
            properties: {
              ...countryInfo,
            },
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
              stats: [confirmed, deaths, recovered],
            },
          };
        }),
      };
      return geoJson;
    })
    .then((geojson) => {
      L.geoJSON(geojson, {
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
      }).addTo(Map);
    });
  return Map;
}
