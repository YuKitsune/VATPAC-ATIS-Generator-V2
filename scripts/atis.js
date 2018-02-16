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
                    returnData = {
                        "name": icao,
                        "firstContact": "[ON FIRST CONTACT WITH] " + icao + " [NOTIFY RECEIPT]",
                        "runwayModes": [],
                        "approachTypes": []
                    };
                }
            }
        });

        // Return the data
        return returnData;
    }

    // Function to generate a text ATIS based on a request
    static generate(req){

        // If no ICAO code defined (Stops accidental triggering)
        // if(!this.prevICAO){

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

            // ************************
            // URL Parsing and checking
            // ************************

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

            // ***********************************
            // ATID ID checking and metar decoding
            // ***********************************

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

            // *****************
            // First load checks
            // *****************

            if(this.firstLoad){
                this.prevICAO = met.station;
                this.apObj = this.getAirport(met.station);
                UI.build(textMetar, atisID);
                console.log(this.apObj);
            }

            // Get's the Airport data (if different)
            if(met.station !== this.prevICAO){
                this.prevICAO = met.station;
                this.apObj = this.getAirport(met.station);
                UI.build(textMetar, atisID);
                console.log(this.apObj);
            }

            // ****************
            // ATIS ID limiting
            // ****************

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
                if(this.prevID == Utils.nextChar(this.apObj.idLimit.end)){

                    // Return to start
                    this.prevID = this.apObj.idLimit.start;
                    this.prevID = this.apObj.idLimit.start;
                }
            }

            // ***************
            // ATIS processing
            // ***************

            // Terminal indentifier
            textAtisString = textAtisString.concat(this.apObj.name + " [TERMINAL INFO] " + atisID + " , ");

            // Approach type
            textAtisString = textAtisString.concat(document.getElementById("apchSelect").value);

            // Runway Data
            // If manual
            if(document.getElementById("rwySelect").value == "manual"){

                // Build the runway string
                let arr = document.getElementById("manRwy1").value;
                let arrDir = document.getElementById("manRwy1Dir").value;

                if(document.getElementById("manRwy2").value !== ""){

                    let dep = document.getElementById("manRwy2").value;
                    let depDir = document.getElementById("manRwy2Dir").value;

                    // Add to ATIS string
                    textAtisString = textAtisString.concat("[RWY] " + arr + arrDir + " [FOR ARRS] , [RWY] " + dep + depDir + " [FOR DEPS] , ");
                } else {

                    // Add to ATIS string
                    textAtisString = textAtisString.concat("[RWY] " + arr + arrDir + " , ");
                }
            } else { // Not manual (From json datafile)
                textAtisString = textAtisString.concat(document.getElementById("rwySelect").value + " , ");
            }

            // Surface condition
            textAtisString = textAtisString.concat(document.getElementById("sfcCond").value);

            // Operational Info
            textAtisString = textAtisString.concat(this.getOper());

            // Wind
            textAtisString = textAtisString.concat(this.formatWind(met.wind) + " , ");

            // Vis
            textAtisString = textAtisString.concat(this.formatVis(met.visibility, met.cavok, met.weather) + " , ");

            // SIGWX
            if(met.visibility == 9999 && this.visWxMod(met.weather) != ""){ // If not already in the vis section
                textAtisString = textAtisString.concat(this.formatWx(met.weather));
            }

            // Clouds
            textAtisString = textAtisString.concat(this.formatCld(met.clouds, met.cavok));

            // Temp
            try{
                textAtisString = textAtisString.concat("[TMP] " +  met.temperature.toString() + " , ");
            } catch(e){

                textAtisString = textAtisString.concat("[TMP] [NAVBL] , ");
            }

            // QNH
            try{
                textAtisString = textAtisString.concat("[QNH] " +  met.altimeterInHpa.toString() + " , ");
            } catch(e){
                textAtisString = textAtisString.concat("[QNH] [NAVBL] , ");
            }

            // HTML
            document.getElementById("tmp").value = met.temperature;
            if(met.altimeterInHpa){
                document.getElementById("qnh").value = met.altimeterInHpa;
            } else {
                document.getElementById("qnh").value = "NAVBL";
            }

            // ***********
            // ATIS extras
            // ***********

            // RAAF freqs
            if(this.apObj.depFreq){
                textAtisString = textAtisString.concat("[DEP FREQ] " + document.getElementById("depFreq").value + " , ");
            }
            if(this.apObj.gndAppFreq){
                textAtisString = textAtisString.concat("[GND FREQ] " + document.getElementById("gndFreq").value + " , " +
                    "[APP FREQ] " +document.getElementById("appFreq").value + " , ");
            }

            // Xmas
            let tmpDate = new Date();
            let xmas = Date.parse("Dec 25, " + tmpDate.getFullYear());
            let today = Date.parse(tmpDate);
            let daysToChristmas = Math.round((xmas - today) / (1000 * 60 * 60 * 24));

            if(daysToChristmas == 0){
                textAtisString = textAtisString.concat("[HO HO HO, MERRY XMAS TO ALL] ");
            }

            // Finishing off the ATIS
            textAtisString = textAtisString.concat(this.apObj.firstContact + " " + atisID + " ,");

            this.firstLoad = false;

            // Returns the text ATIS string
            return textAtisString;
        // }
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

        // Wind string formatting
        if(wind.direction.toString().length == 2){
            directionString = "0" + wind.direction.toString();
        } else if (wind.direction.toString().length == 1){
            directionString = "00" + wind.direction.toString();
        } else {
            directionString = wind.direction.toString();
        }

        // UI text
        var uiData = directionString + " / " + wind.speed;

        // Normal wind
        if (wind.direction == "VRB" && Number(wind.speed) < 5) {

            // Light and variable
            returnData = returnData.concat(" [LV] ");

        } else if (wind.direction == "VRB" && Number(wind.speed) > 5){

            // Varying direction
            returnData = returnData.concat("[VRB] " + wndspd + " [KT] ");

        } else if (wind.direction == 0){

            // Calm wind
            returnData = returnData.concat("[CALM] ");

        } else {

            // Standard
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

        // Crosswind
        if(!(wind.speed > 10)){

            // Get runways
            // If from JSON
            if(this.apObj.runwayModes && this.apObj.runwayModes.length !== 0){
                for (let i = 0; i < this.apObj.runwayModes.length; i++){
                    if(this.apObj.runwayModes[i] == document.getElementById("rwySelect").value){

                        let runwayMode = this.apObj.runwayModes[i];

                        // If more than one runway
                        if(runwayMode.dir2){

                            let components1 = Utils.calculateXwTw(runwayMode.dir1[1], wind.direction, wind.speed);
                            let components2 = Utils.calculateXwTw(runwayMode.dir1[2], wind.direction, wind.speed);

                            // First runway
                            // Crosswind
                            if(!components1.xw === null){
                                uiData = uiData.concat("MX XW " + components1.xw + " KT RWY " + Utils.removeBrackets(runwayMode.dir1[0]) + ", ");
                                returnData = returnData.concat("[MX] [XW] " + components1.xw + " [KT] [RWY] " + runwayMode.dir1[0] + " , ")
                            }

                            // Tailwind
                            if(!components1.tw === null){
                                uiData = uiData.concat("MX TW " + components1.tw + " KT RWY " + Utils.removeBrackets(runwayMode.dir1[0]) + ", ");
                                returnData = returnData.concat("[MX] [TW] " + components1.tw + " [KT] [RWY] " + runwayMode.dir1[0] + " , ")
                            }

                            // Second runway
                            // Crosswind
                            if(!components2.xw === null){
                                uiData = uiData.concat("MX XW " + components1.xw + " KT RWY " + Utils.removeBrackets(runwayMode.dir2[0]) + ", ");
                                returnData = returnData.concat("[MX] [XW] " + components2.xw + " [KT] [RWY] " + runwayMode.dir2[0] + " , ")
                            }

                            // Tailwind
                            if(!components2.tw === null){
                                uiData = uiData.concat("MX TW " + components2.tw + " KT RWY " + Utils.removeBrackets(runwayMode.dir2[0]) + ", ");
                                returnData = returnData.concat("[MX] [TW] " + components2.tw + " [KT] [RWY] " + runwayMode.dir2[0] + " , ")
                            }
                        } else {

                            let components = Utils.calculateXwTw(runwayMode.dir1[1], wind.direction, wind.speed);

                            // First runway
                            // Crosswind
                            if(!components.xw === null){
                                uiData = uiData.concat("MX XW " + components.xw + " KT ,");
                                returnData = returnData.concat("[MX] [XW] " + components.xw + " [KT] , ")
                            }

                            // Tailwind
                            if(!components.tw === null){
                                uiData = uiData.concat("MX TW " + components.tw + " KT");
                                returnData = returnData.concat("[MX] [TW] " + components.tw + " [KT] , ")
                            }
                        }
                    }
                }
            } else {

                let rwy1 = document.getElementById("manRwy1").value;
                let rwy2 = document.getElementById("manRwy2").value;

                // If more than one runway
                if(rwy2 !== ""){

                    let components1 = Utils.calculateXwTw(rwy1, wind.direction, wind.speed);
                    let components2 = Utils.calculateXwTw(rwy2, wind.direction, wind.speed);

                    // First runway
                    // Crosswind
                    if(!components1.xw === null){
                        returnData = returnData.concat("[MX] [XW] " + components1.xw + " [KT] [RWY] " + rwy1 + " , ")
                    }

                    // Tailwind
                    if(!components1.tw === null){
                        returnData = returnData.concat("[MX] [TW] " + components1.tw + " [KT] [RWY] " + rwy1 + " , ")
                    }

                    // Second runway
                    // Crosswind
                    if(!components2.xw === null){
                        returnData = returnData.concat("[MX] [XW] " + components2.xw + " [KT] [RWY] " + rwy2 + " , ")
                    }

                    // Tailwind
                    if(!components2.tw === null){
                        returnData = returnData.concat("[MX] [TW] " + components2.tw + " [KT] [RWY] " + rwy2 + " , ")
                    }
                } else {

                    let components = Utils.calculateXwTw(rwy1, wind.direction, wind.speed);

                    try{
                        // Crosswind
                        if(!components.xw === null){
                            returnData = returnData.concat("[MX] [XW] " + components.xw + " [KT] , ")
                        }

                        // Tailwind
                        if(!components.tw === null){
                            returnData = returnData.concat("[MX] [TW] " + components.tw + " [KT] , ")
                        }
                    } catch(e){

                    }
                }
            }
        }

        // Sets the HTML
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

                            // If "in vicinity" is next, don't add "and" after
                            if(wx[i + 1].abbreviation != "VC"){
                                returnData = returnData.concat("[" + wx[i].abbreviation + "] [AND] ");
                            } else {
                                returnData = returnData.concat("[" + wx[i].abbreviation + "] ");
                            }
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

        return "";
    }


    // Function to format cloud info
    static formatCld(clouds, cavok){

        if(!cavok){

            var returnData = "[CLD] ";

            try{
                // Loop through the cloud data
                for(var i = 0; i < clouds.length; i++){

                    // Bellow 10,000ft
                    if(clouds[i].altitude < 10000){

                        // If NSC
                        if(clouds[i].abbreviation == "NSC" || clouds[i].abbreviation == "NCD"){
                            returnData = returnData.concat("[NSC] , ");
                            break;
                        }

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
            } catch(e){
                returnData = returnData.concat("[NSC] , ");
            }


            // If no clouds bellow 10,000 processed
            if(returnData == "[CLD] "){
                return "[NSC] , ";
            }

            // HTML
            document.getElementById("cld").value = Utils.removeBrackets(returnData);

            return returnData;
        } else {
            return "";
        }
    }
}