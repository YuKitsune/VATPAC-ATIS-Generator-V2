/**
 * Created by Eoin on 4/10/2017.
 */

class ATIS{
    static constructor(){

        // Variable for the airport object
        this.apObj;

        // Previous request
        this.prevRequest;

        // Pervious ICAO
        this.prevICAO;

        // Previous ATIS ID
        this.prevID;

        // First load bool
        this.firstLoad = true;
    }

    // Function to get airport data based on icao code
    static getAirport(icao){

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
    static generate(req){

        // If no ICAO code defined (Stops accidental triggering)
        if(!this.prevICAO){

            // Just in case
            let _this = this;

            // Assigns the request variable if defined
            if(req !== undefined) {
                this.prevRequest = req;
            } else {
                req = this.prevRequest;
            }

            // Text ATIS string
            let textAtisString = "";

            // Parses the URL
            let parsedUrl = url.parse(req.url, true); // true to get query as object
            let parsedUrlQuery = parsedUrl.query;

            console.log(parsedUrlQuery);

            // Check if there correct elements are there
            if(parsedUrlQuery.info == null || parsedUrlQuery.info == undefined ||
                parsedUrlQuery.metar == null || parsedUrlQuery.metar == undefined){

                let errorString = "URL parse failed. Please ensure your \"ATIS Maker URL\" in EuroScope is set to:<br><b>http://localhost:8000/?info=$atiscode&metar=$metar($atisairport)</b>";

                // Set the status
                document.getElementById("status").innerHTML = errorString;
                console.error(errorString);
                return;
            }


            // If ATIS id's not equal (due to offset from above)
            // Todo: Stress test this
            if(this.prevID && Utils.nextChar(this.prevID) !== parsedUrlQuery.info){
                parsedUrlQuery.info = Utils.nextChar(parsedUrlQuery.info);
            }

            // Assign the elements to variables
            let atisID = parsedUrlQuery.info;
            let textMetar = parsedUrlQuery.metar;

            // Parses the METAR into an object
            let met = decodeMetar(textMetar);

            console.log(met);

            if(this.firstLoad){
                this.prevICAO = met.station;
                this.apObj = this.getAirport(met.station);
                UI.build(textMetar, atisID);
                console.log(this.apObj);
            }

            // Get's the Airport data (if different)
            if(met.station !== this.prevICAO){
                this.apObj = this.getAirport(met.station);
                UI.build(textMetar, atisID);
                this.prevICAO = met.station;
                console.log(this.apObj);
            }

            // Checks the ATIS ID
            // If no limits
            if(!this.apObj.idLimit){

                // If Z (TWR closed)
                if(atisID == "Z"){

                    // Return to A
                    atisID = "A";
                    this.prevID = "A";
                }
            } else { // If there are limits

                // If end of limit reached
                if(prevID == Utils.nextChar(this.apObj.idLimit.end)){

                    // Return to start
                    prevID = this.apObj.idLimit.start;
                    this.prevID = this.apObj.idLimit.start;
                }
            }

            /*
                ATIS PROCESSING START
             */

            // Adds the terminal indentifier
            textAtisString = textAtisString.concat(this.apObj.name + " [TERMINAL INFO] " + atisID + " , ");

            /*
             Approach Data
             */

            textAtisString = textAtisString.concat(document.getElementById("apchSelect").value);

            /*
             Runway Data
             */

            // If manual
            if(document.getElementById("rwySelect").value == "manual"){

                // Build the runway string
                let arr = document.getElementById("manRwy1").value;
                let arrDir = document.getElementById("manRwy1Dir").value;

                if(document.getElementById("manRwy2").value !== ""){

                    let dep = document.getElementById("manRwy2").value;
                    let depDir = document.getElementById("manRwy2Dir").value;

                    // Add to ATIS string
                    textAtisString = textAtisString.concat(arr + arrDir + " [FOR ARRS] , " + dep + depDir + " [FOR DEPS] , ");
                } else {

                    // Add to ATIS string
                    textAtisString = textAtisString.concat(arr + arrDir);
                }

            } else {
                textAtisString = textAtisString.concat(document.getElementById("rwySelect").value + " , ");
            }

            // Surface condition
            textAtisString = textAtisString.concat(document.getElementById("sfcCond").value);

            /*
             Operational Info
             */
            textAtisString = textAtisString.concat(this.getOper());

            /*
             Wind Info
             */
            textAtisString = textAtisString.concat(this.formatWind(met.wind) + " , ");

            /*
             Visability
            */
            textAtisString = textAtisString.concat(this.formatVis(met.visibility, met.cavok, met.weather) + " , ");

            /*
             Weather
            */
            if(this.visWxMod(met.weather) !== ""){ // If not already in the vis section
                textAtisString = textAtisString.concat(this.formatWx(met.weather));
            }

            /*
             Clouds
            */
            textAtisString = textAtisString.concat(this.formatCld(met.clouds, met.cavok));

            // Temp and QNH
            textAtisString = textAtisString.concat("[TMP] " +  met.temperature.toString() + " , ");
            textAtisString = textAtisString.concat("[QNH] " +  met.altimeterInHpa.toString() + " , ");

            // HTML
            document.getElementById("tmp").value = met.temperature;
            document.getElementById("qnh").value = met.altimeterInHpa;

            // Extras

            // RAAF freqs
            if(this.apObj.depFreq){
                textAtisString = textAtisString.concat("[DEP FREQ] " +document.getElementById("depFreq").value + " , ");
            }

            if(this.apObj.gndAppFreq){
                textAtisString = textAtisString.concat("[GND FREQ] " +document.getElementById("gndFreq").value + " , " +
                    "[APP FREQ] " +document.getElementById("appFreq").value + " , ");
            }

            // Xmas
            let tmpDate = new Date();
            let xmas = Date.parse("Dec 25, " + tmpDate.getFullYear());
            let today = Date.parse(tmpDate);
            let daysToChristmas = Math.round((xmas - today) / (1000 * 60 * 60 * 24));

            if(daysToChristmas == 0){
                textAtisString = textAtisString.concat("[HO HO HO, MERRY XMAS TO ALL]");
            }

            // Finishing off the ATIS
            textAtisString = textAtisString.concat(this.apObj.firstContact + " " + atisID + " ,");

            // Returns the text ATIS string
            return textAtisString;
        }
    }

    // Function to get operational info
    static getOper(){

        // Var for return data over here because it wouldn't work if the data was returned elsewhere
        var returnData = "";

        // Get's the current runway mode
        var rwyMode = document.getElementById("rwySelect").value;

        for(let i = 0; i < this.apObj.runwayModes.length; i++){

            if(this.apObj.runwayModes[i].text == rwyMode){
                if(this.apObj.runwayModes[i].oper){
                    returnData = this.apObj.runwayModes[i].oper;
                }
            }
        }

        // HTML
        document.getElementById("operInfo").value = Utils.removeBrackets(returnData);

        return returnData;
    }

    // Function to format wind info
    static formatWind(wind){

        var returnData = "[WND] ";

        let directionString = "";

        if(wind.direction.toString().length <= 2){
            directionString = "0" + wind.direction.toString();
        } else {
            directionString = wind.direction.toString();
        }

        var uiData = directionString + " / " + wind.speed;

        // Normal wind
        if (wind.direction == "VRB" && Number(wind.speed) < 5) {

            returnData = returnData.concat(" [LV] ");

        } else if (wind.direction == "VRB" && Number(wind.speed) > 5){

            returnData = returnData.concat("[VRB] " + wndspd + " [KT] ");

        } else {

            returnData = returnData.concat(directionString + " [/] " + wind.speed + " [KT] ");
        }

        // Gusts
        if(wind.gust !== null){
            returnData = returnData.concat("[GT] " + wndgst + " [KT] ");
            uiData = uiData.concat("G" + wind.gust);
        }

        // Variation
        if(wind.variation !== null){
            returnData = returnData.concat("[VRB] " + wind.variation.max + " [AND] " + wind.variation.min + " [/] ");
            uiData = uiData.concat(" " + wind.variation.max + "/" + wind.variation.min);
        }

        //Sets the HTML
        document.getElementById("wind").value = uiData;

        return returnData;
    }

    // Function to format visibility info
    static formatVis(vis, cavok, wx){

        let returnData;

        if(!cavok){
            if(vis === 9999){
                returnData = "[VIS] [GREATER THAN 10 KM]"
            } else if (vis > 5000 ) {
                returnData = "[VIS] " + vis.toString().substr(0,1) + " [KM]" + this.visWxMod(wx);
            } else {
                returnData = "[VIS] {" + vis.toString() + "} [METERS]" + this.visWxMod(wx);
            }
        } else {
            returnData = "[CAVOK]";
        }

        // HTML
        document.getElementById("vis").value = Utils.removeBrackets(returnData);

        return returnData;
    }

    // Function to add the weather modifier to the visibility section
    static visWxMod(wx){

        if(wx){

            // Loop through weather
            for(var i = 0; i < wx.length; i++){

                // Not the best way to do it, but it works
                switch(wx[i].abbreviation){
                    case "TS": 
                        return " [IN] [TS]"
                        break;

                    case "RA": 
                        return " [IN] [RA]"
                        break;
                        
                    case "SH":
                    case "VCSH":
                        return " [IN] [SH]"
                        break;

                    case "HZ":
                        return " [IN] [HAZE]"
                        break;
                }
            }

            return "";
        }
    }

    // Function to format significant weather data
    static formatWx(wx){

        if(this.visWxMod(wx) == ""){

            let returnData = "";

                if(wx !== null){

                    // Array for weather
                    let wxArr = [];

                    // Swap indexes with [VC]
                    for(let i = 0; i < wx.length; i++){
                        if(wx[i].abbreviation == "VC"){

                            // Swap position
                            let vc = wx[i];
                            let other = wx[i+1];

                            // Assign
                            wx[i] = other;
                            wx[i+1] = vc;

                            // Increment over "VC" as it's been moved forward
                            // This stops an infinite loop
                            i++
                        }
                    }

                    // Loop through weather
                    for (let i = 0; i < wx.length; i++){

                        switch (wx[i].abbreviation){
                            case "+":
                                returnData = returnData.concat("+");
                                break;

                            case "-":
                                returnData = returnData.concat("-");
                                break;

                            default:

                                // Ending with comma
                                if(i !== wx.length - 1){
                                    returnData = returnData.concat("[" + wx[i].abbreviation + "]");
                                } else {
                                    returnData = returnData.concat("[" + wx[i].abbreviation + "],");
                                }
                                break;
                        }
                    }
                    
                    // HTML
                    document.getElementById("wx").value = Utils.removeBrackets(returnData);

                    return returnData;
                } else {

                    // HTML
                    document.getElementById("wx").value = "";

                    return ""
                }
        }

        return "";
    }


    // Function to format cloud info
    static formatCld(clouds, cavok){

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

            // If no clouds bellow 10,000 processed
            if(returnData == "[CLD] "){
                return "";
            }

            // HTML
            document.getElementById("cld").value = Utils.removeBrackets(returnData);

            return returnData;
        } else {
            return "";
        }
    }
}