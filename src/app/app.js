require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const session = require('express-session');

const app = express();

// Configurar sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto', 
  resave: false, 
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

// Middlewares
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.autenticado = !!req.session.usuario;
  next();
});

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Rutas
const indexRoutes = require("./routes/router");
app.use("/", indexRoutes);

const PORT = process.env.PORT || 3000;

module.exports = app;
