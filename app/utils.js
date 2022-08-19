module.exports.FormatAnswer = (data, status=null) => {
	let result;
	if(status !== null) result = Object.assign(data, status);
	else result = data;
	return result;
}

module.exports.CheckAddress = address => {
	return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

module.exports.LogError = (type, data) => {
	console.log(`${type} error:`, data);
}