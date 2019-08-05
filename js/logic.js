createMap = async () => {

    const earthquakeEndpoint = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
    const tectonicPlatesEndpoint = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, " +
            "<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, " +
            "<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, " +
            "<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    // Earthquake layer
    let response = await d3.json(earthquakeEndpoint);
    const locations = response.features;

    const earthquakeLayer = new L.layerGroup();

    for (let i = 0; i < locations.length; i++) {
        let coordinates = locations[i].geometry.coordinates;
        let magnitude = locations[i].properties.mag;
        let time = new Date(locations[i].properties.time);
        let place = locations[i].properties.place;
        let type = locations[i].properties.type;
        let tsunami = locations[i].properties.tsunami;

        L.circle([coordinates[1], coordinates[0]], {
            weight: 1,
            fillColor: getColor(magnitude),
            color: getColor(magnitude),
            fillOpacity: 0.75,
            radius: (magnitude * 3 * 10000)
        }).bindPopup("<h3>Earthquake: " + place + "<h3>Magnitude: " + magnitude + "<h3>Time: " + time.toString() + "<h3>").addTo(earthquakeLayer);
    }


    // Tectonic Plates
    response = await d3.json(tectonicPlatesEndpoint);

    var tectonicPlatesLayer = new L.layerGroup();
    L.geoJson(response.features, {
        color: 'red'
    }).addTo(tectonicPlatesLayer)


    var baseMaps = {
        "Dark": darkmap,
        "Light": lightmap,
        "Satellite": satellitemap
    };

    var overlayMaps = {
        "Earthquakes": earthquakeLayer,
        "Tectonic Plates": tectonicPlatesLayer,
    };

    var myMap = L.map("map", {
        center: [36.7783, -119.4179],
        zoom: 5,
        layers: [lightmap, earthquakeLayer, tectonicPlatesLayer]
    });

    L.control.layers(baseMaps, overlayMaps,
        {
            collapsed: false
        }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += 'Magnitude<br><hr>'

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}

function getColor(v) {

    return v > 8 ? '#0A2F51' :
        v > 7 ? '#0E4D64' :
            v > 6 ? '#137177' :
                v > 5 ? '#188977' :
                    v > 4 ? '#1D9A6C' :
                        v > 3 ? '#48B16D' :
                            v > 2 ? '#74C67A' :
                                v > 1 ? '#ADDAA1' :
                                    "#DEEDCF";

}

createMap();