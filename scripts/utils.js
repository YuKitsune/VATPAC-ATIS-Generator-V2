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
        let diff = Math.abs((rwyDir - wndDir) * (Math.PI / 180));

        // Crosswind
        let crosswind = Math.abs(Math.round(spd * Math.sin(diff)));

        // Tailwind
        let tailwind = Math.abs(Math.round(spd * Math.cos(diff)));

        // Check the components
        if(crosswind <= 1) crosswind = null;
        if(tailwind <= 1) tailwind = null;

        // Return values
        return {
            xw: crosswind,
            tw: tailwind
        }
    }
}