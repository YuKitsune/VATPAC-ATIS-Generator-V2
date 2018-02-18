/**
 * Created by Eoin on 12/02/2018.
 */

const WindowsToaster = require('node-notifier').WindowsToaster;
 
const notifier = new WindowsToaster({
  withFallback: false, // Fallback to Growl or Balloons?
  customPath: void 0 // Relative/Absolute path if you want to use your fork of SnoreToast.exe
});
 
// Notification class
class Notify{
	static constructor(){

		this.atisUpdate = new Audio('data/atis.wav');

	}

	// ATIS ID limit notification
	static atisLimit(start){
		notifier.notify({
				title: "ATIS ID limit", // String. Required
				message: "The ATIS ID is out of limits, the generator will set the ID to " + start + ". \nPlease reflect this in EuroScope.", // String. Required if remove is not defined
				icon: "build/icon.ico", // String. Absolute path to Icon
				sound: true, // Bool | String (as defined by http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx)
				wait: true, // Bool. Wait for User Action against Notification or times out
				// id: void 0, // Number. ID to use for closing notification.
				// appID: void 0, // String. App.ID and app Name. Defaults to no value, causing SnoreToast text to be visible.
				// remove: void 0, // Number. Refer to previously created notification to close.
				// install: void 0 // String (path, application, app id).  Creates a shortcut <path> in the start menu which point to the executable <application>, appID used for the notifications.
			},
			function(error, response) {
				console.log(response);
		});
	}
}