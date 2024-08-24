const socket = io();

// Initialize markers object
const markers = {};

// Check for geolocation support and emit location data
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log("Sending location:", { latitude, longitude });
        socket.emit("send-location", { latitude, longitude });
    }, (error) => {
        console.log("Geolocation error:", error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Opened Map SK."
}).addTo(map);

// Update or create markers based on received location data
socket.on("location-receive", (data) => {
    const { id, latitude, longitude } = data;

    console.log("Received location:", data);

    // Center the map on the new location and zoom in
    map.setView([latitude, longitude], 16);

    if (markers[id]) {
        // Update the marker's position if it exists
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker if it doesn't exist
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection and remove markers
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        // Remove the marker from the map
        map.removeLayer(markers[id]);
        // Delete the marker from the markers object
        delete markers[id];
    }
});
