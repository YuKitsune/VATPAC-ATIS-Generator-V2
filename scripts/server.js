/**
 * Created by Eoin on 4/10/2017.
 */

//HTTP API
var http = require('http');

//URL API
var url = require('url');

// function to start HTTP server
// URL = localhost:8000

// URL
// localhost:8000?info=$atiscode&metar=$metar($atisairport)

// Function to start a local HTTP server
function startServer(){

    // Changes the button
    document.getElementById("startServer").setAttribute("onClick", "");
    document.getElementById("startServer").setAttribute("class", "disabled");
    document.getElementById("status").innerHTML = "Local HTTP server running on localhost:8000.<br>ATIS Maker URL: \"http://localhost:3000/?info=$atiscode&metar=$metar($atisairport)\"";

    http.createServer(function(request, response){

        // Plain text file
        response.writeHead(200, {'Content-type':'text/plan'});
		
        // Take the incoming data and process it
        var textAtis = generateATIS(request);

        // Text data
        response.body = false;
        response.write(textAtis);

        // End request
        response.end( );

    }).listen(3000, "0.0.0.0");

}

function stopServer(){

}