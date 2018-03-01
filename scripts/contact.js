/**
 * Created by Eoin on 26/2/2018.
 */

// On first contact data processing
class Contact{
	static constructor(){

	}

	// Returns the on first contact string
	static getContactString(apObj, atisID, urlData){

		// Top down coverage provided
		let topDown = document.getElementById("topDown").checked;

		if(topDown){

			// Get the ATC callsign
			let callsignArr = urlData.callsign.split(/-|_/);
			let callsignEnd = callsignArr[callsignArr.length-1];

			let callsign;
			switch(callsignEnd){

				// Centre controllers
				case "CTR":

					// Melbourne Centre
					if (callsignArr[0] == "ML"){
						callsign = "[MELBOURNE CENTRE]";

						// Brisbane Centre
					} else if (callsignArr[0] == "BN"){
						callsign = "[BRISBANE CENTRE]";
					} else {

						// some other Centre
						callsign = callsignArr[0];
					}
					break;

				// Approach controllers
				case "APP":

					// If ICAO code
					if(apObj.name.length == 4){

						// Use prefix
						callsign = callsignArr[0] + " [APP]";
					} else {

						// Or just use the name
						callsign = apObj.name + " [APP]";
					}
					break;

				// Departure controllers
				case "DEP":

					// If an ICAO code
					if(apObj.name.length == 4){

						// Use prefix
						callsign = callsignArr[0] + " [DEP]";
					} else {

						// Or just use the name
						callsign = apObj.name + " [DEP]";
					}
					break;

				// Dunno
				default:
					callsign = urlData.callsign.split(/-|_/)[0];
					break;
			}

			return {
				"oper": "[TOP-DOWN SERVICE AVBL. FOR CLRNC, GND, TWR AND TMA OPS, CTC] " + callsign + " [ON] [FREQ] " + urlData.freq + " , ",
				"end": "[ON FIRST CONTACT WITH] " + callsign + " [NOTIFY RECEIPT] " + atisID + " , "
			}
		} else {
			return {
				"oper": "",
				"end": apObj.firstContact + " " + atisID + " , "
			}
		}
	}
}