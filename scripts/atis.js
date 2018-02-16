/**
 * Created by Eoin on 4/10/2017.
 */

// Variable for the airport object
var apObj;

// Previous request
var prevRequest;

// function to get airport data based on icao code
function getJson(icao){

    var returnData;

    // Ajax request to the file
    $.ajax({
        type: "GET",
        url: "data/airports.json",
        async: false,
        success: function (data) {

            data = JSON.parse(data);

            // If the given ICAO is an element in the object.
            if(data.hasOwnProperty(icao)){
                returnData = data[icao];
            } else {
                returnData = null;
            }
        }
    });

    // Return the data
    return returnData;
}

// Function to generate a text ATIS based on a request
function generateATIS(req){

    // Assigns the global request variable if defined
    if(req !== undefined) {
        prevRequest = req;
    } else {
        req = prevRequest;
    }

    // Text ATIS string
    var textAtisString = "";

    // Parses the URL
    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var parsedUrlQuery = parsedUrl.query;

    console.log(parsedUrlQuery);

    // Check if there correct elements are there
    if(parsedUrlQuery.info == null || parsedUrlQuery.info == undefined){

        // Set the status
        document.getElementById("status").innerHTML = "URL parse failed. Please ensure your \"ATIS Maker URL\" in EuroScope is set to:<br>http://localhost:8000/?info=$atiscode&metar=$metar($atisairport)";

        return;
    }

    // Check if there correct elements are there
    if(parsedUrlQuery.metar == null || parsedUrlQuery.metar == undefined){

        // Set the status
        document.getElementById("status").innerHTML = "URL parse failed. Please ensure your \"ATIS Maker URL\" in EuroScope is set to:<br>http://localhost:8000/?info=$atiscode&metar=$metar($atisairport)";

        return;
    }

    // Assign the elements to variables
    var atisID = parsedUrlQuery.info;
    var textMetar = parsedUrlQuery.metar;

    // Parses the METAR into an object
    var met = decodeMetar(textMetar);

    console.log(met);

    // Get's the Airport data
    apObj = getJson(met.station);

    console.log(apObj);

    // Fills in the UI elements
    buildUi(textMetar, atisID);

    /*
        ATIS PROCESSING START
     */

    // Adds the terminal indentifier
    textAtisString = textAtisString.concat(apObj.name + " [TERMINAL INFO] " + atisID + " , ");

    /*
     Approach Data
     */

    textAtisString = textAtisString.concat(document.getElementById("apchSelect").value + " , ");

    /*
    Runway Data
     */

    textAtisString = textAtisString.concat(document.getElementById("rwySelect").value + " , ");
    textAtisString = textAtisString.concat(document.getElementById("sfcCond").value);

    /*
     Operational Info
     */

    textAtisString = textAtisString.concat(getOper());

    /*
     Wind Info
     */

    textAtisString = textAtisString.concat(formatWind(met.wind) + " , ");

    /*
     Visibility
    */
    textAtisString = textAtisString.concat(formatVis(met.visibility, met.cavok) + " , ");

    /*
     Weather
    */
    if(visWxMod(met) !== ""){ // If not already in the vis section
        textAtisString = textAtisString.concat(formatWx(met.weather));
    }

    /*
     Clouds
    */
    textAtisString = textAtisString.concat(formatCld(met.clouds, met.cavok));

    // Temp and QNH
    // If not INTAS
    if(!apObj.intas){
        textAtisString = textAtisString.concat("[TMP] " +  met.temperature.toString().substr(0,1) + "[" + met.temperature.toString().substr(1,1) + ",] , ");
        textAtisString = textAtisString.concat("[QNH] " +  met.altimeterInHpa.toString().substr(0,3) + "[" + met.altimeterInHpa.toString().substr(3,1) + ",] , ");
    } else {
        textAtisString = textAtisString.concat("[TMP] " +  met.temperature.toString() + " , ");
        textAtisString = textAtisString.concat("[QNH] " +  met.altimeterInHpa.toString() + " , ");
    }

    // HTML
    document.getElementById("tmp").value = met.temperature;
    document.getElementById("qnh").value = met.altimeterInHpa;

    // finishing off the ATIS
    textAtisString = textAtisString.concat(apObj.firstContact + " " + atisID + " ,");

    // Returns the text ATIS string
    return textAtisString;
}

// Function to format wind info
function formatWind(wind){

    var returnData = "[WND] ";
    var uiData = wind.direction + "/" + wind.speed;

    // Normal wind
    if (wind.direction == "VRB" && Number(wind.speed) < 5) {

        returnData = returnData.concat(" [LV] ");

    } else if (wind.direction == "VRB" && Number(wind.speed) > 5){

        returnData = returnData.concat("[VRB] " + wndspd + " [KT] ");

    } else if (wind.direction != "VRB") {

        returnData = returnData.concat(wind.direction + " [/] " + wind.speed + " [KT] ");
    }

    // Gusts
    if(!wind.gust === null){
        returnData = returnData.concat("[GT] " + wndgst + " [KT] ");
        uiData = uiData.concat("G" + wind.gust);
    }

    // Variation
    if(!wind.variation === null){
        returnData = returnData.concat("[VRB BTWN] " + wind.variation.max + " [AND] " + wind.variation.min + " [/] ");
        uiData = uiData.concat(" " + wind.gust.variation.max + "/" + wind.gust.variation.min);
    }

    //Sets the HTML
    document.getElementById("wind").value = uiData;

    return returnData;
}

// Function to format visibility info
function formatVis(vis, cavok){

    let returnData;

    if(!cavok){
        if(vis === 9999){
            returnData = "[VIS] [GT THAN 10 KM]"
        } else if (vis > 5000 ) {
            returnData = "[VIS] " + vis.toString().substr(0,1) + " [KM]" + visWxMod();
        } else {
            returnData = "[VIS] {" + vis.toString() + "} [METERS]" + visWxMod();
        }
    } else {
        returnData = "[CAVOK]";
    }

    // HTML
    document.getElementById("vis").value = returnData.replace(/\[|\]|{|}|,/g, "");

    return returnData;
}

// Function to add the weather modifier to the visibility section
function visWxMod(met){

    if(met.weather !== null){

        // Loop through weather
        for(var i = 0; i < met.weather.length; i++){

            // Not the best way to do it, but it works
            switch(met.weather[i].abbreviation){
                case "RA": 
                    return " [IN RAIN]"
                    break;
                    
                case "SH":
                case "VCSH":
                    return " [IN SHOWERS]"
                    break;

                case "HZ":
                    return " [IN HAZE]"
                    break;
                    
                default:
                    return ""
                    break;
            }
        }
    }
}

// Function to format weather data
function formatWx(wx){

    let returnData;

    if(wx !== null){

        // Loop through weather
        for(var i = 0; i < wx.length; i++){

            // Not the best way to do it, but it works
            switch(met.weather[i].abbreviation){
                    
                case "VCSH":
                    returnData = " [VCSH] , "
                    break;

                case "SH":
                case "RA":
                    returnData = " [SHOWERS IN AREA] , "
                    break;

                case "TS":
                case "TSRA":
                    returnData = " [TS IN AREA] , "
                    break;
                    
                default:
                    returnData = ""
                    break;
            }

            // HTML
            document.getElementById("wx").value = returnData.replace(/\[|\]|{|}|,/g, "");

            return returnData;
        }
    } else {

        // HTML
        document.getElementById("wx").value = "";

        return "";
    }
}

// Function to format cloud info
function formatCld(clouds, cavok){

    if(!cavok){

        var returnData = "[CLD] ";

        // Loop through the cloud data
        for(var i = 0; i < clouds.length; i++){

            // Bellow 10,000ft
            if(clouds[i].altitude < 10000){

                // Creat the elements
                let cld = "[" + clouds[i].abbreviation + "] "; // Cloud type
                let cb = ""; // CB
                if (clouds[i].cumulonimbus){
                    cb = " [CB] ";
                }
                let alt = "{" + clouds[i].altitude + "} [FT] , "; // Altitude

                // Add to return data
                returnData = returnData.concat(cld + cb + alt);
            }
        }

        // HTML
        document.getElementById("cld").value = returnData.replace(/\[|\]|{|}|,/g, "");

        return returnData;
    }else{
        return "";
    }
}