import { Genero } from '../models/index.js';

// 🔸 Obtener todos los géneros
export const getGeneros = async (req, res) => {
	try {
		const generos = await Genero.findAll();
		res.json(generos);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener géneros' });
	}
};

// 🔸 Obtener género por ID
export const getGeneroById = async (req, res) => {
	try {
		const genero = await Genero.findByPk(req.params.id);
		if (!genero) {
			return res.status(404).json({ message: 'Género no encontrado' });
		}
		res.json(genero);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener género' });
	}
};

// 🔸 Crear género
export const createGenero = async (req, res) => {
	try {
		const { nombre } = req.body;
		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es requerido' });
		}

		const genero = await Genero.create({ nombre });
		res.status(201).json(genero);
	} catch (error) {
		res.status(500).json({ message: 'Error al crear género' });
	}
};

// 🔸 Actualizar género
export const updateGenero = async (req, res) => {
	try {
		const { id } = req.params;
		const { nombre } = req.body;

		const genero = await Genero.findByPk(id);
		if (!genero) {
			return res.status(404).json({ message: 'Género no encontrado' });
		}

		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es requerido' });
		}

		await genero.update({ nombre });
		res.json(genero);
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar género' });
	}
};

// 🔸 Eliminar género
export const deleteGenero = async (req, res) => {
	try {
		const { id } = req.params;
		const genero = await Genero.findByPk(id);
		if (!genero) {
			return res.status(404).json({ message: 'Género no encontrado' });
		}

		await genero.destroy();
		res.status(204).send(); // Respuesta sin contenido
	} catch (error) {
		res.status(500).json({ message: 'Error al eliminar género' });
	}
};

export const vistaGeneros = async (req, res) => {
	try {
		const generos = await Genero.findAll();
		res.render('genero', { generos }); // Pasar los datos a la vista
	} catch (error) {
		res.status(500).send('Error al cargar géneros');
	}
};
