// Get's the METAR api
var parseMETAR = require("metar");

// Variable for the current METAR
var currentMetar;

// function to decode the metar
function decodeMetar(str){

    // Runs the string through the API
    var obj = parseMETAR(str);

    // Returns the object
    return obj;
}