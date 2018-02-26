/**
 * Created by Eoin on 4/10/2017.
 */

class UI{
    static constructor(){

    }

    // Function to build the UI
    static build(){

        /*******************
        APPROACH TABLE START
         *******************/

        // Builds the approach table
        // String of options
        var appString = "";

        // Adds the default approach types (If they don't exist)
        if(ATIS.apObj.approachTypes.length == 0){
            appString = appString.concat('<option value="[EXP INSTR APCH] , ">Instrument Approach</option>');
            appString = appString.concat('<option value="">Visual Approach</option>');
        }

        // Loops through the approach types
        for(let i = 0 ; i < ATIS.apObj.approachTypes.length; i++){

            // Starting the select menu
            appString = appString.concat('<option value="' + ATIS.apObj.approachTypes[i].text + '">' + ATIS.apObj.approachTypes[i].name + '</option>');
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

        for(let i = 0; i < ATIS.apObj.runwayModes.length; i++){

            // Starting the select menu
            rwyString = rwyString.concat('<option value="' + ATIS.apObj.runwayModes[i].text + '" id="' + ATIS.apObj.runwayModes[i].text + '">' + ATIS.apObj.runwayModes[i].name + '</option>');
        }

        // Adds the default runway selector
        rwyString = rwyString.concat('<option value="manual">Enter Manually bellow</option>');

        // Inserts the HTML into the approach section
        document.getElementById("rwySelect").innerHTML = rwyString;

        // Check other stuff
        this.checkManualRunway();
        this.checkDepFreq();
        this.checkGndAppFreq();

        /****************
         RUNWAY TABLE END
         ****************/
    }

    // Functions to show/hide manual runway entry
    static checkManualRunway(){
        if(document.getElementById("rwySelect").value == "manual"){
            this.showManualRunway();
        } else {
            this.hideManualRunway();
        }
    }
    static showManualRunway(){
        document.getElementById("manRwy1Row").setAttribute("style", "display: table-row;");
        document.getElementById("manRwy2Row").setAttribute("style", "display: table-row;");
    }
    static hideManualRunway(){
        document.getElementById("manRwy1Row").setAttribute("style", "display: none;");
        document.getElementById("manRwy2Row").setAttribute("style", "display: none;");
    }

    // Departure frequency
    static checkDepFreq(){
        if(ATIS.apObj.depFreq){
            this.showDepFreq();
        } else {
            this.hideDepFreq();
        }
    }
    static showDepFreq(){
        document.getElementById("depFreqRow").setAttribute("style", "display: table-row;");
    }
    static hideDepFreq(){
        document.getElementById("depFreqRow").setAttribute("style", "display: none;");
    }

    // GND/APP frequency
    static checkGndAppFreq(){
        if(ATIS.apObj.gndAppFreq){
            this.showGndAppFreq();
        } else {
            this.hideGndAppFreq();
        }
    }
    static showGndAppFreq(){
        document.getElementById("gndFreqRow").setAttribute("style", "display: table-row;");
        document.getElementById("appFreqRow").setAttribute("style", "display: table-row;");
    }
    static hideGndAppFreq(){
        document.getElementById("gndFreqRow").setAttribute("style", "display: none;");
        document.getElementById("appFreqRow").setAttribute("style", "display: none;");
    }

    // Windshear warnings
    static checkWndShr(){
        if(document.getElementById("wndShr").checked){
            this.showWndShr()
        } else {
            this.hideWndShr()
        }
    }
    static showWndShr(){
        document.getElementById("wndShrTypRow").setAttribute("style", "display: table-row;");
        document.getElementById("wndShrAltRow").setAttribute("style", "display: table-row;");
        document.getElementById("wndShrRwyRow").setAttribute("style", "display: table-row;");
    }
    static hideWndShr(){
        document.getElementById("wndShrTypRow").setAttribute("style", "display: none;");
        document.getElementById("wndShrAltRow").setAttribute("style", "display: none;");
        document.getElementById("wndShrRwyRow").setAttribute("style", "display: none;");
    }
}