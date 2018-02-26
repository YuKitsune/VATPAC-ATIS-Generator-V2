/**
 * Created by Eoin on 11/02/2018.
 */

class Utils{
	static constructor(){

	}

	static nextChar(c) {
   		return String.fromCharCode(c.charCodeAt(0) + 1);
	}

	static removeBrackets(str){
		return str.replace(/\[|\]|{|}|,/g, "");
	}

    // Function to calculate tailwind and crosswind
    static calculateXwTw(rwyDir, wndDir, spd){

        // Input checking
        if(!rwyDir || !wndDir || !spd){
            return null;
        }

        // If string
        if(typeof rwyDir == "string"){

            // Calculate direction from string
            if(rwyDir.length == 1){
                rwyDir = Number("0" + rwyDir + "0");
            } else {
                rwyDir = Number(rwyDir + "0");
            }
        }

        // Runway direction
        if(rwyDir == 0){
            rwyDir = 360
        }

        // If calm
        if(spd == 0 || wndDir == 0){
            return null;
        }

        // Calculations

        // Angle difference
        // To radians
        let diffXWnd = Math.abs((rwyDir - wndDir) * (Math.PI / 180));
        let diffTWnd = Math.abs((this.invertHeading(rwyDir) - wndDir) * (Math.PI / 180));

        // Crosswind
        let crosswind = Math.abs(Math.round(spd * Math.sin(diffXWnd)));

        // Tailwind
        let tailwind = Math.round(spd * Math.cos(diffTWnd));

        // Check the components
        if(crosswind <= 1) crosswind = null;
        if(tailwind <= 1) tailwind = null;

        // Return values
        return {
            xw: crosswind,
            tw: tailwind
        }
    }

    // Returns reciprocal direction of a given heading
    static invertHeading(hdg){

    	let hdgFlip = 0;

    	if(hdg == 180){
    		hdgFlip = 360;
    	} else if(hdg < 180){
    		hdgFlip = hdg + 180;
    	} else {
    		hdgFlip = hdg - 180;
    	}

    	return hdgFlip;
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
            returnData = returnData.concat("[GT] " + wind.gust + " [KT] ");
            uiData = uiData.concat("G" + wind.gust);
        }

        // Variation
        if(wind.variation !== null){
            returnData = returnData.concat("[VRB] " + wind.variation.max + " [AND] " + wind.variation.min + " [/] ");
            uiData = uiData.concat(" " + wind.variation.max + "/" + wind.variation.min);
        }

        // Crosswind / Tailwind
        if(wind.speed > 10){

            // Get runways
            // If from JSON
            if(ATIS.apObj.runwayModes && ATIS.apObj.runwayModes.length !== 0){
                for (let i = 0; i < ATIS.apObj.runwayModes.length; i++){
                    if(ATIS.apObj.runwayModes[i].text == document.getElementById("rwySelect").value){

                        let runwayMode = ATIS.apObj.runwayModes[i];

                        // If more than one runway
                        if(runwayMode.dir2){

                            let components1 = Utils.calculateXwTw(runwayMode.dir1[1], wind.direction, wind.speed);
                            let components2 = Utils.calculateXwTw(runwayMode.dir1[2], wind.direction, wind.speed);

                            // First runway
                            // Crosswind
                            if(components1 && components1.xw){
                                uiData = uiData.concat(" MX XW " + components1.xw + " KT RWY " + Utils.removeBrackets(runwayMode.dir1[0]));
                                returnData = returnData.concat("[MX] [XW] " + components1.xw + " [KT] [RWY] " + runwayMode.dir1[0] + " ")
                            }

                            // Tailwind
                            if(components1 && components1.tw){
                                uiData = uiData.concat(" MX TW " + components1.tw + " KT RWY " + Utils.removeBrackets(runwayMode.dir1[0]));
                                returnData = returnData.concat("[MX] [TW] " + components1.tw + " [KT] [RWY] " + runwayMode.dir1[0] + " ")
                            }

                            // Second runway
                            // Crosswind
                            if(components2 && components2.xw){
                                uiData = uiData.concat(" MX XW " + components1.xw + " KT RWY " + Utils.removeBrackets(runwayMode.dir2[0]));
                                returnData = returnData.concat("[MX] [XW] " + components2.xw + " [KT] [RWY] " + runwayMode.dir2[0] + " ")
                            }

                            // Tailwind
                            if(components2 && components2.tw){
                                uiData = uiData.concat(" MX TW " + components2.tw + " KT RWY " + Utils.removeBrackets(runwayMode.dir2[0]));
                                returnData = returnData.concat("[MX] [TW] " + components2.tw + " [KT] [RWY] " + runwayMode.dir2[0] + " ")
                            }
                        } else {

                            let components = Utils.calculateXwTw(runwayMode.dir1[1], wind.direction, wind.speed);

                            // First runway
                            // Crosswind
                            if(components && components.xw){
                                uiData = uiData.concat(" MX XW " + components.xw + " KT ");
                                returnData = returnData.concat("[MX] [XW] " + components.xw + " [KT] ")
                            }

                            // Tailwind
                            if(components && components.tw){
                                uiData = uiData.concat(" MX TW " + components.tw + " KT ");
                                returnData = returnData.concat("[MX] [TW] " + components.tw + " [KT] ")
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
                        returnData = returnData.concat("[MX] [XW] " + components1.xw + " [KT] [RWY] " + rwy1 + " ")
                    }

                    // Tailwind
                    if(!components1.tw === null){
                        returnData = returnData.concat("[MX] [TW] " + components1.tw + " [KT] [RWY] " + rwy1 + " ")
                    }

                    // Second runway
                    // Crosswind
                    if(!components2.xw === null){
                        returnData = returnData.concat("[MX] [XW] " + components2.xw + " [KT] [RWY] " + rwy2 + " ")
                    }

                    // Tailwind
                    if(!components2.tw === null){
                        returnData = returnData.concat("[MX] [TW] " + components2.tw + " [KT] [RWY] " + rwy2 + " ")
                    }
                } else {

                    let components = Utils.calculateXwTw(rwy1, wind.direction, wind.speed);

                    try{
                        // Crosswind
                        if(!components.xw === null){
                            returnData = returnData.concat("[MX] [XW] " + components.xw + " [KT] ")
                        }

                        // Tailwind
                        if(!components.tw === null){
                            returnData = returnData.concat("[MX] [TW] " + components.tw + " [KT] ")
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
        	if(vis){
	            if(vis === 9999){
	                returnData = "[VIS] [GREATER THAN 10 KM]"
	            } else if (vis > 5000 ) {
	                returnData = "[VIS] " + vis.toString().substr(0,1) + " [KM]" + this.visWxMod(wx);
	            } else {
	                returnData = "[VIS] {" + vis.toString() + "} [METERS]" + this.visWxMod(wx);
	            }
        	} else {
            	returnData = "[NAVBL]";
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