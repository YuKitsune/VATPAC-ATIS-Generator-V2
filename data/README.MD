# Airports.json
Contains all airport data including runway modes, approach types and contact strings.

## Airport
| Key | Meaning |
| ------------ | ------------ |
| name | String of text for the aerodrome name. (Eg. [SYDNEY]).  |
|  firstContact |  String of text used at the end of the ATIS for "On first contact with xxx notify ..." |
| runwayModes  | An array of runway modes.  |
| approachTypes  | An array of approach types.  |

## Runway Mode
This section can be left blank if the user must enter the runway mode manually

| Key | Meaning |
| ------------ | ------------ |
| name | Label for the runway mode. |
| text |  String of text used in the ATIS. |
| dir***x***  | The name of the runway and the direction it's facing in the form of an array. Eg: ```["[RWY] 19", 190]``` where `"[RWY] 19"` is the label for the runway, and `190` is the direction (heading) the runway is facing. If there are multiple runways in use in one given runway mode, then add another `dir` key remembering to increment the ***x*** letter each time (Eg. `"dir1": [...], "dir2": [...], "dir3": [...], ...`). |
| oper | String of text containing any operational information related to this runway mode. |

## Runway Mode
This section can be left blank if the only approach types available are `Instrument Approach` and `Visual Approach`.

| Key | Meaning |
| ------------ | ------------ |
| name | Label for the approach type. |
| text |  String of text used in the ATIS. |