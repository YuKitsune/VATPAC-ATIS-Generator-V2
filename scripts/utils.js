class Utils{
	static constructor(){

	}

	static nextChar(c) {
   		return String.fromCharCode(c.charCodeAt(0) + 1);
	}

	static removeBrackets(str){
		return str.replace(/\[|\]|{|}|,/g, "");
	}
}