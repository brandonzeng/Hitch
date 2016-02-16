$(document).ready(function() {
  $('#remove-rider').click(function() {});
});

function initMap(coordA, coordB) {
  var pointA = new google.maps.LatLng(coordA.lat, coordA.lng);
  var pointB = new google.maps.LatLng(coordB.lat, coordB.lng);
  var myOptions = { 
    zoom: 7,
    center: pointA,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };  
  var map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);

  var markerA = new google.maps.Marker({
    position: pointA,
    title: "point A",
    label: "A",
    map: map
  });   
  
  var markerB = new google.maps.Marker({
    position: pointB,
    title: "point B",
    label: "B",
    map: map
  });   

  // Instantiate a directions service.
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer({
    map: map
  });   
  // get route from A to B
  calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);
}
      
function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {
  directionsService.route({
    origin: pointA,
    destination: pointB,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }   
  });     
}
