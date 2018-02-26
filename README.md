[![VATPAC Logo](https://cdn.vatpac.org/images/logo_old_white.png "VATPAC Logo")](http://vatpac.org "VATPAC Logo")
# VATPAC EuroScope ATIS Generator V2
The VATPAC EuroScope ATIS generator is back with a punch! Providing 100% automatic updates ATIS updates, native desktop notifications, and much more than the previous web based ATIS generator.

## How does it work?
EuroScope has the ability to use an external server for METAR and ATIS intrepreting and generating. More info here: http://www.euroscope.hu/mediawiki/index.php?title=Voice_ATIS#External_ATIS_Interpreter

The VATPAC EuroScope ATIS Generator v2 utilises this feature by hosting a (NodeJS) server on the users machine, allowing for the application to act as the METAR and ATIS interpreter.

When EuroScope detects a METAR update, it will send a request to the ATIS Generator with the new METAR and ATIS ID (along with some other controller information), the ATIS generator then decodes the METAR, and takes user input in regards to runway selection, approach type selection, etc. Then compiles a [multiple-record](http://www.euroscope.hu/mediawiki/index.php?title=Voice_ATIS#Multiple-Recording_Mode "multiple-record") ATIS for EuroScope to use. Once the multiple-record ATIS string is generated, the local server responds to EuroScopes request with the raw string of text, which EuroScope then uses as the ATIS to broadcast to the VATSIM network.

# Contributing
Any contributions are apreciated, including those to the data file(s), but all changes to ATIS format must follow the [VATPAC ATIS policy](https://operations.vatpac.org/documents/policy/Controller%20Information%20and%20ATIS%20Policy.pdf "VATPAC ATIS policy") and [vMATS](https://drive.google.com/file/d/0B_Du2RaHQXG6cTE0aDlZeHBWUWM/view "vMATS").

If you wish to contribute your code, clone the repo and run `npm i` to get started.

The generator is based on Electron, so you will need [NodeJS](https://nodejs.org/en/ "NodeJS") and [ElectronJS](https://www.npmjs.com/package/electron "ElectronJS") installed.

# The Files
So what do all the files do?
## Build
Contails all files required during the build process such as icons.

## Css
Contails the CSS files and style related files.

## Data
Contains the `airports.json` file. This file get's moved to `%appdata%/VATPAC` once the installer has been run.

### airports.json
The airport data in JSON form.

## Scripts
The *interesting* stuff!
Contains all the JS files used to make the ATIS Generator work.

### atis.js
Handels the main ATIS generation process.

### contact.js
Handels the aerodrome contact methods for the ATIS such as who to contact on the ground and once the ATIS has been received by the pilot.

### notify.js
Simple file for managing the system notifications.

### server.js
Simple file for managing the local server.

### server.js
Simple file for the titlebar buttons (Close and move).

### ui.js
For handeling and managing UI changes.

### utils.js
Utility methods and functions to save clutter in other files.


## Installer.iss
Inno installation script. Will output the installer file to a directiory called `Output`.
This must not be synced to GitHub.

## build.bat
Batch script that runs `npm run build-windows`.
Just a shortcut to build the application with electron-packager.
Will output to a directory called `dist`.
This must not be synced to GitHub.

## index.html
Self explanitory.

## main.js
Main Electron script.

## package.json
Self explanitory.

## renderer.js
Electron rendering thing.

## start.bat
Batch script that runs `npm start`.
Just a shortcut to start the Electron application.
