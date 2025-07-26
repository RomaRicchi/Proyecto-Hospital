import { Sector } from '../models/index.js';

export const getSectores = async (req, res) => {
	try {
		const sectores = await Sector.findAll();
		res.json(sectores);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener sectores' });
	}
};

export const getSectorById = async (req, res) => {
	try {
		const sector = await Sector.findByPk(req.params.id);
		if (!sector) {
			return res.status(404).json({ message: 'Sector no encontrado' });
		}
		res.json(sector);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener sector' });
	}
};

export const createSector = async (req, res) => {
	try {
		const { nombre } = req.body;
		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es obligatorio' });
		}

		const sector = await Sector.create({ nombre });
		res.status(201).json(sector);
	} catch (error) {
		res.status(500).json({ message: 'Error al crear sector' });
	}
};

export const updateSector = async (req, res) => {
	try {
		const { id } = req.params;
		const { nombre } = req.body;

		const sector = await Sector.findByPk(id);
		if (!sector) {
			return res.status(404).json({ message: 'Sector no encontrado' });
		}

		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es obligatorio' });
		}

		await sector.update({ nombre });
		res.json(sector);
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar sector' });
	}
};

export const deleteSector = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const sector = await Sector.findOne({ where: { id_sector: id } });

    if (!sector) {
      return res.status(404).json({ message: 'Sector no encontrado' });
    }

    const habitaciones = await Habitacion.count({ where: { id_sector: id } });
    if (habitaciones > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar un sector que tiene habitaciones asociadas'
      });
    }

    await sector.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error al eliminar sector:', error);
    res.status(500).json({ message: 'Error al eliminar sector' });
  }
};

export const vistaSectores = async (req, res) => {
	try {
		const sectores = await Sector.findAll();
		res.render('sector', { 
			sectores, 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar sectores');
	}
};
