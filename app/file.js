const fs = require("fs");
const randomstring = require("randomstring");

const _fileStore = async (file, newFileFolder = "upload") => {
	try {
		const regex = /[^.]*/;
		const name_arr = file.originalFilename.split(".");
		const data = fs.readFileSync(file.filepath);
		const fileName = file.newFilename.replace(regex, randomstring.generate())+(name_arr.length>1?"."+name_arr[name_arr.length-1]:"");
		const filePath = newFileFolder;
		if (!fs.existsSync(`./public/${filePath}`)) {
			fs.mkdirSync(`./public/${filePath}`, {
				recursive: true
			})
		}
		fs.writeFileSync(`./public/${filePath}/${fileName}`, data);
		fs.unlinkSync(file.filepath);
		return Promise.resolve(`${filePath}/${fileName}`);
	} catch (error) {
		console.log(error)
		return Promise.reject(error);
	}
}

const _fileDelete = async (filePath) => {
	try {
		if (fs.existsSync(`./public/${filePath}`))
			fs.unlinkSync(`./public/${filePath}`);
		return Promise.resolve(true);
	} catch (error) {
		return Promise.reject(error);
	}
}

module.exports = {
	fileStore: _fileStore,
	fileDelete: _fileDelete,
};

