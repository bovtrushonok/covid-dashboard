const requestOptions = {
  method: 'GET',
  redirect: 'follow',
};
const { L } = window;
let geoJson;
let casesLayer;
let deathsLayer;
let recoversLayer;

const baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/dark-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoidGVkZHlrYXR6IiwiYSI6ImNraXQzeTZseDEzcXkzMWwzc3R4b2JtcGsifQ.6c4tCeNZLPWxAMUugvrPJA',
});

const Map = L.map('mapBlock', {
  layers: [baseLayer],
}).setView([0, 0], 2.3);

function createHTMLToolTip(country, province, parameter, cases, updateTime) {
  const currentProvince = (province === null) ? '' : province;
  const html = `
      <span class="icon-marker-tooltip">
          <h2 class="country-name">${country} ${currentProvince}</h2>
          <ul>
            <li><strong>${parameter}:</strong> ${cases}</li>
            <li><strong>Last Update:</strong> ${updateTime}</li>
          </ul>
      </span> 
    `;
  return html;
}

async function createGeoJSON() {
  const response = await fetch('https://disease.sh/v3/covid-19/jhucsse', requestOptions);
  const data = await response.text();
  const result = await JSON.parse(data);

  return result;
}

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
    casesLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.03 * (feature.properties.stats.confirmed / 1000),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, feature.properties.province, 'Cases',
          feature.properties.stats.confirmed, feature.properties.updatedAt));
      },
    });
    casesLayer.addTo(Map);
    deathsLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.59 * (feature.properties.stats.deaths / 1000),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, feature.properties.province, 'Deaths',
          feature.properties.stats.deaths, feature.properties.updatedAt));
      },
    });
    recoversLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.05 * (feature.properties.stats.recovered / 1000),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, feature.properties.province, 'Recovered',
          feature.properties.stats.recovered, feature.properties.updatedAt));
      },
    });
  })
  .then(() => {
    const overlays = {
      Cases: casesLayer,
      Deaths: deathsLayer,
      Recovered: recoversLayer,
    };

    L.control.layers(null, overlays).addTo(Map);
  });
