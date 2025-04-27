require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const session = require('express-session');

// Configurar sesión
app.use(session({
  secret: process.env.SESSION_SECRET, 
  saveUninitialized: false
}));

// Motor de vistas
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));
app.use("/sb-admin", express.static(path.join(__dirname, "../public/sb-admin")));
app.use("/css", express.static(path.join(__dirname, "../public/css")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));
app.use(express.urlencoded({ extended: true }));
// Bootstrap local:
app.use("/bootstrap", express.static(path.join(__dirname, "../../node_modules/bootstrap/dist")));

app.use(morgan("dev"));

// Middleware para agregar autenticado a todas las vistas privadas
app.use((req, res, next) => {
  res.locals.autenticado = !!req.session.usuario;
  res.locals.usuario = req.session.usuario;
  next();
});
  
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.autenticado = !!req.session.usuario;
  next();
});

// Rutas
const indexRoutes = require("./routes/router");
app.use("/", indexRoutes);

const PORT = process.env.PORT || 3000;

module.exports = app;
