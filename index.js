require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();
const app = express();
var corsOptions = {
  origin: "*"
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
// parse multipart/form-data
app.use(upload.array());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.json({ message: "Welcome to CugateAPI." });
});
app.use('/api', require(`./app/api`));
app.use('/api/auth', require(`./app/api_auth`));
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});