/**
 * Created by Eoin on 4/10/2017.
 */

// function to build the UI
function buildUi(met, atisId){

    // Inserts the METAR
    document.getElementById("metarText").innerHTML = met;

    // Changes the ATIS ID
    document.getElementById("atisID").value = atisId;

    /*******************
    APPROACH TABLE START
     *******************/

    // Builds the approach table
    // String of options
    var appString = "";

    // Loops through the approach types
    Object.keys(apObj.approachTypes).forEach(function(key,i) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object

        // Starting the select menu
        appString = appString.concat('<option value="' + apObj.approachTypes[key][0].text + '">' + apObj.approachTypes[key][0].name + '</option>');
    });

    // Adds the default approach types (If they don't exist
    // Loops through the approach types

    if(!appTypeExists(apObj.approachTypes,'[EXP INSTR APCH]')){
        appString = appString.concat('<option value="[EXP INSTR APCH]">Instrument Approach</option>');
    }
    if(!appTypeExists(apObj.approachTypes,'')){
        appString = appString.concat('<option value="">Visual Approach</option>');
    }

    // Inserts the HTML into the approach section
    document.getElementById("apchSelect").innerHTML = appString;

    /******************
     APPROACH TABLE END
     ******************/

    /******************
     RUNWAY TABLE START
     ******************/

    // Builds the approach table
    // String of options
    var rwyString = "";

    // Loops through the runway modes
    Object.keys(apObj.runwayModes).forEach(function(key,i) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object

        // Starting the select menu
        rwyString = rwyString.concat('<option value="' + apObj.runwayModes[key][0].text + '" id="' + apObj.runwayModes[key][0].text + '">' + apObj.runwayModes[key][0].name + '</option>');
    });

    // Adds the default runway selector
    rwyString = rwyString.concat('<option value="manual">Other</option>');

    // Inserts the HTML into the approach section
    document.getElementById("rwySelect").innerHTML = rwyString;

    /****************
     RUNWAY TABLE END
     ****************/
}

// Function to check weather an approach type exists
function appTypeExists(types,find){

    // Loop through the types
    for(var i = 0; i < types.length; i++){
        if(types[i][0].text === find){
            return true;
        }
    }

    return false;
}

// Enable and disable elements on the UI
function enableDisable(){

    // Check if the approach type and the runway are allowed

    // Loops through the approach types
    Object.keys(apObj.approachTypes).forEach(function(key1) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object

        // When the types equal
        if(document.getElementById("apchSelect").value === apObj.approachTypes[key1][0].text){

            // If there are any exclusions
            if(apObj.approachTypes[key1][0].exclude !== undefined){

                // Loop through the exclusions
                for(var j = 0; j < apObj.approachTypes[key1][0].exclude.length; j++){

                    // Loops through the runway modes
                    Object.keys(apObj.runwayModes).forEach(function(key2,i2) {
                        // key: the name of the object key
                        // index: the ordinal position of the key within the object

                        // If the modes match
                        if(apObj.approachTypes[key1][0].exclude[j] == i2){

                            var excludeIndex = apObj.approachTypes[key1][0].exclude[j];

                            // Get the runway element
                            document.getElementById(apObj.runwayModes[excludeIndex][0].text).setAttribute("disabled", "true");
                        }
                    });
                }
            }
        }
    });
}

// Get operational info
function getOper(){

    // Var for return data over here because it wouldn't work if the data was returned elsewhere
    var returnData = "";

    // Get's the current runway mode
    var rwyMode = document.getElementById("rwySelect").value;

    // Loops through the runway modes
    Object.keys(apObj.runwayModes).forEach(function(key,i) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object

        // When the modes equal
        if(rwyMode === apObj.runwayModes[i][0].text){

            // Try catch if the oper info section doesn't exist
            try{
                // Get the operational info
                var oper = apObj.runwayModes[i][0].oper;

                // Inserts it to HTML
                document.getElementById("operInfo").value = oper.replace(/\[/g,"").replace(/\]/g,"");

                returnData = oper + " , ";

            } catch(e){
                document.getElementById("operInfo").value = "";
                returnData = ""
            }
        }
    });

    return returnData;
}