function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete_orig = new google.maps.places.Autocomplete(
      (document.getElementById('autocomplete_orig')),
      {types: ['geocode']});
  autocomplete_dest = new google.maps.places.Autocomplete(
      (document.getElementById('autocomplete_dest')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
  autocomplete.addListener('place_changed', fillInAddress);
}

// [START region_geolocation]
// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}
// [END region_geolocation]

$(document).ready(function() {
  var form = $('form');
  form.submit(function(evt) {
    var time = new Date($('#date').val().concat(" ".concat($('#time').val())));
    var now = new Date();
    var two_weeks = new Date();
    two_weeks = two_weeks.setDate(two_weeks.getDate() + 14);
    if (time <= now) {
      $('h1').before("<div id='error'> Ride must be in the future. </div>");
      evt.preventDefault();
    }
    if (time > two_weeks) {
      $('h1').before("<div id='error'> Ride must be within the next 2 weeks. </div>");
      evt.preventDefault();
    }
  });
});