const { L } = window;
let geoJson;
let casesLayer;
let deathsLayer;
let recoversLayer;
let todayCasesLayer;
let todayRecoversLayer;
let todayDeathsLayer;

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

function createHTMLToolTip(country, parameter, cases, updateTime) {
  const html = `
      <span class="icon-marker-tooltip">
          <h2 class="country-name">${country}</h2>
          <ul>
            <li><strong>${parameter}:</strong> ${cases}</li>
            <li><strong>Last Update:</strong> ${new Date(updateTime).toLocaleDateString('en-US')}</li>
          </ul>
      </span> 
    `;
  return html;
}

async function createGeoJSON() {
  const response = await fetch('https://disease.sh/v3/covid-19/countries');
  const data = await response.text();
  const result = await JSON.parse(data);
  return result;
}

createGeoJSON()
  .then((res) => {
    geoJson = {
      type: 'FeatureCollection',
      features: res.map((countryData) => {
        const latitude = countryData.countryInfo.lat;
        const longitude = countryData.countryInfo.long;
        return {
          type: 'Feature',
          properties: {
            ...countryData,
          },
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
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
          radius: 0.09 * (feature.properties.cases / 10000),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, 'Cases',
          feature.properties.cases, feature.properties.updated));
      },
    });
    casesLayer.addTo(Map);
    deathsLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.09 * (feature.properties.deaths / 1000),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, 'Deaths',
          feature.properties.deaths, feature.properties.updated));
      },
    });
    recoversLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.09 * (feature.properties.recovered / 10000),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, 'Recovered',
          feature.properties.recovered, feature.properties.updated));
      },
    });
    todayCasesLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.09 * (feature.properties.todayCases / 100),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, 'Cases today',
          feature.properties.todayCases, feature.properties.updated));
      },
    });
    todayRecoversLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.09 * (feature.properties.todayRecovered / 100),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, 'Recovered today',
          feature.properties.todayRecovered, feature.properties.updated));
      },
    });
    todayDeathsLayer = L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0.09 * (feature.properties.todayDeaths / 10),
          fillColor: 'red',
          color: '#000',
          weight: 1,
          opacity: 0,
          fillOpacity: 0.5,
          riseOnHover: true,
        });
      },
      onEachFeature(feature, layer) {
        layer.bindTooltip(createHTMLToolTip(feature.properties.country, 'Deaths today',
          feature.properties.todayDeaths, feature.properties.updated));
      },
    });
  })
  .then(() => {
    const overlays = {
      Cases: casesLayer,
      Deaths: deathsLayer,
      Recovered: recoversLayer,
      'Cases today': todayCasesLayer,
      'Deaths today': todayDeathsLayer,
      'Recovers today': todayRecoversLayer,
    };

    L.control.layers(null, overlays).addTo(Map);
  });
