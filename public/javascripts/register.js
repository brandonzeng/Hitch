$(function() {
    $('#submit').on('click', function() {
        $(this).hide();
        $('#txtBox').hide();
        $('#txtBoxValue').text($('#txtBox').val()).show();
        $('#edit').show();
    });

    $('#edit').on('click', function() {
        $(this).hide();
        $('#txtBoxValue').hide();
        $('#txtBox').show();
        $('#submit').show();
    });
});