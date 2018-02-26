/**
 * Created by Eoin on 4/10/2017.
 */

class ATIS{
    static constructor(){

        // Variable for the airport object
        this.apObj;

        // Previous request
        this.prevRequest;

        // Previous met object
        this.prevMet;

        // Pervious ICAO
        this.prevICAO;

        // Previous ATIS ID
        this.prevID;

        // First load bool
        this.firstLoad = true;
    }

    // Function to get airport data based on icao code
    static getAirport(icao){

        let returnData;
		
		// Fs for loading data
		// let fs = require("fs");

		// Get the airport.json file
		// the env.APPDATA directory changes for some reason
		let file;
		try{
			file = require(process.env.APPDATA + "\\airports.json");
		} catch (e){
			file = require(process.env.APPDATA + "\\VATPAC\\ATIS\\airports.json");
		}

        // If the given ICAO is an element in the object.
		if(file.hasOwnProperty(icao)){
			returnData = file[icao];
		} else {
			returnData = {
				"name": icao,
				"firstContact": "[ON FIRST CONTACT WITH] " + icao + " [NOTIFY RECEIPT]",
				"runwayModes": [],
				"approachTypes": []
			};
		}

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
			
			// Check METAR for abnormalities
			parsedUrlQuery.metar = parsedUrlQuery.metar.replace(/\/\//g, "");
			parsedUrlQuery.metar = parsedUrlQuery.metar.replace(/\/\/\//g, "");

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

            // Assign the elements to variables
            let atisID = parsedUrlQuery.info;
            let textMetar = parsedUrlQuery.metar;

            // Parses the METAR into an object
            let met = decodeMetar(textMetar);

            this.prevMet = met;
            console.log(met);

            // HTML
            document.getElementById("metarText").innerHTML = textMetar;

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

                    // Notification
                    Notify.atisLimit("A");
                } else {
                	this.prevID = atisID;
                }
            } else { // If there are limits

            	// If at the end
            	if(atisID.charCodeAt(0) == this.apObj.idLimit.end.charCodeAt(0) + 1){

            		// Return to start
            		atisID = this.apObj.idLimit.start;
            		this.prevID = this.apObj.idLimit.start;

                    // Notification
                    Notify.atisLimit(this.apObj.idLimit.start);

            	} else if (atisID.charCodeAt(0) < this.apObj.idLimit.start.charCodeAt(0) ||
    				atisID.charCodeAt(0) > this.apObj.idLimit.end.charCodeAt(0) + 1
				) { // Out of range

            		// Return to start
            		atisID = this.apObj.idLimit.start;
            		this.prevID = this.apObj.idLimit.start;

                    // Notification
                    Notify.atisLimit(this.apObj.idLimit.start);
            	} else {
                	this.prevID = atisID;
                }
            }

            // HTML
            document.getElementById("atisID").value = atisID;

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
            textAtisString = textAtisString.concat(this.getOper(atisID, parsedUrlQuery));

            // Wind
            textAtisString = textAtisString.concat(Utils.formatWind(met.wind) + " , ");

            // Vis
            textAtisString = textAtisString.concat(Utils.formatVis(met.visibility, met.cavok, met.weather) + " , ");

            // SIGWX
            if(met.visibility == 9999 && Utils.visWxMod(met.weather) != ""){ // If not already in the vis section
                textAtisString = textAtisString.concat(Utils.formatWx(met.weather));
            }

            // Clouds
            textAtisString = textAtisString.concat(Utils.formatCld(met.clouds, met.cavok));

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
            if(met.temperature){
            	document.getElementById("tmp").value = met.temperature;
            } else {
                document.getElementById("tmp").value = "NAVBL";
            }

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

            // Windshear stuff
			textAtisString = textAtisString.concat(this.wndShr());

            // Xmas
            let tmpDate = new Date();
            let xmas = Date.parse("Dec 25, " + tmpDate.getFullYear());
            let today = Date.parse(tmpDate);
            let daysToChristmas = Math.round((xmas - today) / (1000 * 60 * 60 * 24));

            if(daysToChristmas == 0){
                textAtisString = textAtisString.concat("[HO HO HO, MERRY XMAS TO ALL] ");
            }

            // Finishing off the ATIS
            // textAtisString = textAtisString.concat(this.apObj.firstContact + " " + atisID + " ,");
            textAtisString = textAtisString.concat(Contact.getContactString(this.apObj, atisID, parsedUrlQuery).end);


            this.firstLoad = false;

            // Returns the text ATIS string
            return textAtisString;
        // }
    }

    // Function to get operational info
    static getOper(atisID, parsedUrlQuery){

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

        // Delaying action
        if(document.getElementById("operDelay").checked){
			returnData = returnData.concat(document.getElementById("operDelayMin").value + " [MINS HLDG MAY BE EXPECTED] , [EXP DELAYS] , ")
        }
		
		// Top-down
		returnData = returnData.concat(Contact.getContactString(this.apObj, atisID, parsedUrlQuery).oper)

        // HTML
        document.getElementById("operInfo").value = Utils.removeBrackets(returnData);

        return returnData;
    }

    static wndShr(){

    	// If checked
    	if(document.getElementById("wndShr").checked){
    		return "[WINDSHEAR WARNING] , " +
    		document.getElementById("wndShrTyp").value + // Type
    		" [WINDSHEAR] [REPORTED AT] " +
    		"{" + document.getElementById("wndShrAlt").value + "} [FT] " + // Altitude
    		"[RWY] " + document.getElementById("wndShrRwy").value + " , "; // runway
    	}

    	return "";
    }
}