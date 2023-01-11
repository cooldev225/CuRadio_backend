require('dotenv').config();
const express = require("express");
const cors = require("cors");
// const multer = require("multer");
// const upload = multer();
const app = express();
const https = require('https');
const fs = require('fs');
const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
var corsOptions = {
  origin: "*"
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
// parse multipart/form-data
// app.use(upload.array());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.json({ message: "Welcome to CugateAPI." });
});
app.use('/api', require(`./app/api`));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
//https.createServer(sslOptions, app).listen(80);
