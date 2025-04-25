const fs = require("fs").promises;

const mostrarInicio = async (req, res) => {
  try {
    const obras = await fs.readFile("data/obras_sociales.dat", "utf-8");
    const especialidades = await fs.readFile("data/especialidades.dat", "utf-8");

    const listaObras = obras.trim().split("\n");
    const listaEsp = especialidades.trim().split("\n");

    const medicos = [
      { nombre: 'Dr. Alejandro Pérez', especialidad: 'Clínica médica' },
      { nombre: 'Dra. Lucía Fernández', especialidad: 'Cardiología' },
      { nombre: 'Dr. Javier Torres', especialidad: 'Neumonología' },
      { nombre: 'Dra. Mariana López', especialidad: 'Infectología' },
      { nombre: 'Dr. Carlos Gómez', especialidad: 'Neurología' }
    ];

    res.render("inicio", { listaObras, listaEsp, medicos });
  } catch (error) {
    console.error("Error al cargar datos públicos:", error);
    res.status(500).send("Error cargando datos públicos");
  }
};

module.exports = { mostrarInicio };
