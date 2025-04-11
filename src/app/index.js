const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");

// Motor de vistas
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));
app.use("/sb-admin", express.static(path.join(__dirname, "../public/sb-admin")));
app.use("/css", express.static(path.join(__dirname, "../public/css")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));

// Bootstrap local:
app.use("/bootstrap", express.static(path.join(__dirname, "../../node_modules/bootstrap/dist")));

app.use(morgan("dev"));

// Rutas
const indexRoutes = require("./routes/router");
app.use("/", indexRoutes);

const PORT = process.env.PORT || 3000;

module.exports = app;
