mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // make sure there's a div with id="map"
  style: "mapbox://styles/mapbox/streets-v9",
  center: listing.geometry.coordinates, // [lng, lat]
  zoom: 10,
});

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5><b>${listing.title}</b></h5><p>Exact location will be provided after booking</p>`
    )
  )
  .addTo(map);




map.on("load", () => {
  // Load a custom hotel icon image from the public folder
  map.loadImage("/temp/hotel%20icon.png", (error, image) => {
    if (error) throw error;

    // Add the image to the map style
    if (!map.hasImage("hotel")) {
      map.addImage("hotel", image);
    }

    // Define a GeoJSON source
    map.addSource("point", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: listing.geometry.coordinates
            },
            properties: {
              title: listing.title
            }
          }
        ]
      }
    });

    // Add a symbol layer using the custom image
    map.addLayer({
      id: "points",
      type: "symbol",
      source: "point",
      layout: {
        "icon-image": "hotel",
        "icon-size": 0.07,
      }
    });

    // Add a popup to the custom icon
    map.on("click", "points", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const title = e.features[0].properties.title;

      new mapboxgl.Popup({ offset: 25 })
        .setLngLat(coordinates)
        .setHTML(
          `<h5><b>${title}</b></h5><p>Exact location will be provided after booking</p>`
        )
        .addTo(map);
    });

    // Change cursor to pointer on hover
    map.on("mouseenter", "points", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "points", () => {
      map.getCanvas().style.cursor = "";
    });
  });
});
