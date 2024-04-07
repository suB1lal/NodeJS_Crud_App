//import
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const PORT = 5000;
const app = express();

//db connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", (error) => {
  console.log(error);
});
db.once("open", () => console.log("DB Bağlantısı Gerçekleşti"));
//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "my scret key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static('uploads'))

//template engine
app.set("view engine", "ejs");

//router
app.use("",require("./routes/routes"));

app.listen(PORT, () => {
  console.log(`Server Ayakta Kardeş http://localhost:${PORT}`);
});
