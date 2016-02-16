$(document).ready(function($){
  $("#my_upcoming_rides").on("click", ".clickable-row", function(){
    window.document.location = $(this).data("href");
  });
})

$(document).ready(function($){
  $("#my_past_rides").on("click", ".clickable-row", function(){
    window.document.location = $(this).data("href");
  });
})

$(document).ready(function() {
  $('#my_upcoming_rides').DataTable( {
  });
});
$(document).ready(function() {
  $('#my_past_rides').DataTable( {
  });
});
