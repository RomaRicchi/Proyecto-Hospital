const express = require("express")
const morgan = require("morgan")
const app = express()
const path = require("path");


// Motor de vistas
app.set("view engine", "pug");// crear el archivo pug en views
app.set("views", path.join(__dirname, "../views"));

// Ruta a los archivos estáticos (CSS, JS, imágenes)
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/sb-admin', express.static(path.join(__dirname, '../public/sb-admin')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use(morgan("dev"))

// Rutas
const indexRoutes = require("./routes/router");
app.use('/', indexRoutes);

const PORT = process.env.PORT || 3000;

module.exports = app 