// Packaged utility functions.
//
// These methods abstract out the basic mechanism
// of creating server responses with some content
// (error code, message, etc.).
var utils = (function () {

  var _utils = {};

  /*
    Send a 200 OK with success:true in the request body to the
    response argument provided.
    The caller of this function should return after calling
  */
  _utils.sendSuccessResponse = function(res, content) {
    res.status(200).json({
      success: true,
      content: content
    }).end();
  };

  /*
    Send an error code with success:false and error message
    as provided in the arguments to the response argument provided.
    The caller of this function should return after calling
  */
  _utils.sendErrResponse = function(res, errcode, err) {
    res.status(errcode).json({
      success: false,
      err: err
    }).end();
  };

  Object.freeze(_utils);
  return _utils;

})();

module.exports = utils;
