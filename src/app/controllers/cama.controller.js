import { Cama } from '../models/index.js';

// 🔸 API: Obtener todas las camas en formato JSON (para DataTable)
export const getCamasApi = async (req, res) => {
	try {
		const camas = await Cama.findAll();
		res.json(camas);
	} catch (error) {
		console.error('Error al obtener camas:', error);
		res.status(500).json({ message: 'Error al obtener camas' });
	}
};

// 🔸 Vista tradicional: Renderizar la vista PUG con camas
export const getCamas = async (req, res) => {
	try {
		const camas = await Cama.findAll();
		res.render('cama', { camas });
	} catch (error) {
		console.error('Error al obtener camas:', error);
		res.status(500).send('Error interno del servidor');
	}
};

// 🔸 Obtener cama por ID (JSON)
export const getCamaById = async (req, res) => {
	try {
		const cama = await Cama.findByPk(req.params.id);
		if (cama) {
			res.json(cama);
		} else {
			res.status(404).send('Cama no encontrada');
		}
	} catch (error) {
		console.error('Error al obtener cama:', error);
		res.status(500).send('Error interno del servidor');
	}
};

// 🔸 Crear nueva cama
export const createCama = async (req, res) => {
	try {
		const nuevaCama = await Cama.create(req.body);
		res.status(201).json(nuevaCama);
	} catch (error) {
		console.error('Error al crear cama:', error);
		res.status(500).send('Error interno del servidor');
	}
};

// 🔸 Actualizar cama
export const updateCama = async (req, res) => {
    try {
        const cama = await Cama.findByPk(req.params.id);
        if (!cama) {
            return res.status(404).json({ message: 'Cama no encontrada' });
        }
        await cama.update(req.body);
        res.json(cama);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔸 Eliminar cama
export const deleteCama = async (req, res) => {
	try {
		const deleted = await Cama.destroy({
			where: { id_cama: req.params.id },
		});
		if (deleted) {
			res.send('Cama eliminada correctamente');
		} else {
			res.status(404).send('Cama no encontrada');
		}
	} catch (error) {
		console.error('Error al eliminar cama:', error);
		res.status(500).send('Error interno del servidor');
	}
};

export const vistaReservarCama = async (req, res) => {
  try {
    const camas = await Cama.findAll({
      where: {
        estado: false,         // libres
        desinfeccion: true     // desinfectadas
      }
    });
    res.render('reservaCama', { camas });
  } catch (error) {
    console.error('Error al cargar camas:', error);
    res.status(500).send('Error al cargar camas');
  }
};