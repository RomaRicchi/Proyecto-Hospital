const express = require("express")
const morgan = require("morgan")
const router = require("./router/router")
const app = express()
const path = require("path");

app.set("port", process.env.PORT || 3030)
app.set("view engine", "pug");// crear el archivo pug en views


const viewsPath = path.join(__dirname, "..", "views");
app.set("views", viewsPath);

// Ruta a los archivos estáticos (CSS, JS, imágenes)
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

app.use(morgan("dev"))
app.use("/", router)

module.exports = app 