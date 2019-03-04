// API urls
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
d3.json(earthquakeURL, function(data) {
  createFeatures(data.features);
});
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .6,
        color: "#000",
        stroke: true,
        weight: .8
    })
  }
  });
  createMap(earthquakes);
}
function createMap(earthquakes) {
// Tile layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoibWFya3A4MTY5IiwiYSI6ImNqcXp2aG4zaTAycGw0M3AzamVyYmg4bjcifQ.EtghhXIAqZWVVc06Ier7sA");
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoibWFya3A4MTY5IiwiYSI6ImNqcXp2aG4zaTAycGw0M3AzamVyYmg4bjcifQ.EtghhXIAqZWVVc06Ier7sA");
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoibWFya3A4MTY5IiwiYSI6ImNqcXp2aG4zaTAycGw0M3AzamVyYmg4bjcifQ.EtghhXIAqZWVVc06Ier7sA");
    var baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap
    };
// Tectonic plates and overlay
    var tectonicPlates = new L.LayerGroup();
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };
// Make map with layers. Set Latitude and Longitude for center and amount to initially zoom in.
    var myMap = L.map("map", {
      center: [
        35.00, -80.00],
      zoom: 3.00,
      layers: [outdoors, earthquakes, tectonicPlates]
    }); 
// Data for tectonic plates. Line color and width
    d3.json(tectonicPlatesURL, function(plateData) {
      L.geoJson(plateData, {
        color: "red",
        weight: 2
      })
      .addTo(tectonicPlates);
  });
// Layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
//Legend at bottom right
  var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];
// Create a label for each earthquake
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}  
//Color range for circles per diameter size.
  function getColor(d) {
    return d > 5 ? '#F30' :
    d > 4  ? '#F60' :
    d > 3  ? '#F90' :
    d > 2  ? '#FC0' :
    d > 1   ? '#FF0' :
              '#9F3';
  }
//radius of circle multiplied by 10,000 of the earthquake magnitude. 
  function getRadius(value){
    return value*10000
  }