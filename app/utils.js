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

module.exports.getArtistPic = (artistId, albumId) => {
	if(artistId === -1 ) {
		return "https://img.cugate.com/?o=album&i=" + albumId  + "&s=174";
	}else {
		return "https://img.cugate.com/?o=member&i=" + artistId + "&s=174";
	}
}

module.exports.getAlbumCover = (albumId) => {
	return "https://img.cugate.com/?o=album&i=" + albumId  + "&s=174";
}

module.exports.getMood = (key) => {
	let mood =[];
	mood[0] = "Strength";
	mood[1] = "Emotional";
	mood[2] = "Atmospheric";
	mood[3] = "Musical Feel";
	mood[4] = "Atmospheric";
	mood[5] = "Dramatic";
	mood[6] = "Comical/Humorous";
	mood[7] = "Relaxed";
	mood[8] = "Sad";
	mood[9] = "Comical/Humorous";
	mood[10] = "Positive/Optimistic";
	mood[11] = "Atmospheric";
	return mood[key];
}

module.exports.getTempo = (val) => {
	if(val <=52){
		return "Largo";
	}else if(val > 52 && val <= 70){
		return "Adagio";
	}else if(val > 70 && val <= 80){
		return "Andante";
	}else if(val > 80 && val <= 100){
		return "Moderato";
	}else if(val > 100 && val <= 140){
		return "Allegro";
	}else{
		return "Presto";
	}
}

module.exports.getRandString = (length, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
	var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

module.exports.GetToken = (req) => {
	let token = req.headers.authorization.split(" ");
    if(token[0] == "Bearer"){
        return token[1];
    }
	return "";
}