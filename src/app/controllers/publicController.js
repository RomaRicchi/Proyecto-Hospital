const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

const mostrarInicio = async (req, res) => {
  try {
    const obrasPath = path.join(__dirname, "../../data/obras_sociales.dat");
    const especialidadesPath = path.join(__dirname, "../../data/especialidades.dat");

    const obras = await fs.readFile(obrasPath, "utf-8");
    const especialidades = await fs.readFile(especialidadesPath, "utf-8");

    const listaObras = obras.trim().split("\n");
    const listaEsp = especialidades.trim().split("\n");

    let medicos = [];

    try {
      const response = await axios.get("https://randomuser.me/api/?results=12&nat=us,es,fr");
      const results = response.data.results;
      medicos = results.map(user => ({
        nombre: `${user.name.first} ${user.name.last}`,
        especialidad: listaEsp[Math.floor(Math.random() * listaEsp.length)] || "Especialidad general",
        foto: user.picture.medium
      }));
    } catch (apiError) {
      console.error("❌ Error consultando RandomUser, usando médicos de emergencia.");
      // Si falla, cargamos 12 médicos "falsos"
      medicos = Array.from({ length: 12 }, (_, i) => ({
        nombre: `Dr/a. Emergencia ${i + 1}`,
        especialidad: listaEsp[Math.floor(Math.random() * listaEsp.length)] || "Especialidad general",
        foto: "/img/docG.png" 
      }));
    }

    res.render("inicio", { listaObras, listaEsp, medicos });
  } catch (error) {
    console.error("Error al cargar datos públicos:", error);
    res.status(500).send("Error cargando datos públicos");
  }
};

module.exports = { mostrarInicio };
