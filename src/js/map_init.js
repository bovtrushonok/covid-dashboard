const requestOptions = {
  method: 'GET',
  redirect: 'follow',
};
const { L } = window;
const Map = L.map('mapBlock').setView([0, 0], 2.3);
let geoJson;
const geojsonMarkerOptions = {
  radius: 10,
  fillColor: '#ff7800',
  color: '#000',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.5,
  riseOnHover: true,
};

function createHTMLPopUp(country, cases, deaths, recovered, updateTime) {
  const html = `
      <span class="icon-marker-tooltip">
          <h2 class="country-name">${country}</h2>
          <ul>
            <li><strong>Confirmed:</strong> ${cases}</li>
            <li><strong>Deaths:</strong> ${deaths}</li>
            <li><strong>Recovered:</strong> ${recovered}</li>
            <li><strong>Last Update:</strong> ${updateTime}</li>
          </ul>
      </span> 
    `;
  return html;
}

function onEachFeature(feature, layer) {
  layer.bindPopup(createHTMLPopUp(feature.properties.country,
    feature.properties.stats.confirmed, feature.properties.stats.deaths,
    feature.properties.stats.recovered, feature.properties.updatedAt));
}

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
      console.log(geoJson);
      return geoJson;
    })
    .then((geojson) => {
      L.geoJSON(geojson, {
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature,
      }).addTo(Map);
    });
  return Map;
}
