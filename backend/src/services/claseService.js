const Clase = require('../models/Clase');
const { v4: uuidv4 } = require('uuid');

class ClaseService {
  constructor(claseRepository, estudianteClaseRepository) {
    this.claseRepository = claseRepository;
    this.estudianteClaseRepository = estudianteClaseRepository;
  }

  async createClase(data) {
    // Validar datos requeridos
    if (!data.nombre || !data.codigoUnico || !data.curso || !data.idDocente) {
      throw new Error('Datos incompletos para crear clase');
    }

    // Verificar que el código único no existe
    const existingClase = await this.claseRepository.findByCodigoUnico(data.codigoUnico);
    if (existingClase) {
      throw new Error('El código de clase ya existe');
    }

    const claseData = {
      id: uuidv4(),
      nombre: data.nombre,
      codigoUnico: data.codigoUnico,
      curso: data.curso,
      idDocente: data.idDocente,
    };

    const clase = new Clase(claseData);
    if (!clase.isValid()) {
      throw new Error('Datos inválidos para crear clase');
    }

    return await this.claseRepository.create(clase);
  }

  async validarCodigoClase(codigo) {
    // H.U. 001 - Validar código de clase
    const clase = await this.claseRepository.findByCodigoUnico(codigo);
    if (!clase) {
      throw new Error('Código de clase inválido o no existe');
    }
    return clase;
  }

  async unirseAClase(idEstudiante, codigoUnico) {
    // H.U. 011 - Unirse a una clase con código único
    // Validar que la clase existe
    const clase = await this.validarCodigoClase(codigoUnico);

    // Verificar que el estudiante no está ya en la clase
    const existingRelation = await this.estudianteClaseRepository.findByEstudianteClase(
      idEstudiante,
      clase.id
    );
    if (existingRelation) {
      throw new Error('Ya estás inscrito en esta clase');
    }

    // Crear relación estudiante-clase
    const estudianteClaseData = {
      idEstudiante,
      idClase: clase.id,
      fechaIngreso: new Date(),
    };

    return await this.estudianteClaseRepository.create(estudianteClaseData);
  }

  async getMisClases(idEstudiante) {
    // H.U. 117 - Obtener mis clases
    const estudianteClases = await this.estudianteClaseRepository.findByEstudiante(
      idEstudiante
    );

    const clases = [];
    for (const ec of estudianteClases) {
      const clase = await this.claseRepository.findById(ec.idClase);
      if (clase) {
        clases.push({
          ...clase.toJSON(),
          fechaIngreso: ec.fechaIngreso,
        });
      }
    }

    return clases;
  }

  async getClaseById(id) {
    const clase = await this.claseRepository.findById(id);
    if (!clase) {
      throw new Error('Clase no encontrada');
    }
    return clase;
  }

  async getEstudiantesByClase(idClase) {
    // Obtener lista de estudiantes en una clase
    const estudianteClases = await this.estudianteClaseRepository.findByClase(idClase);
    return estudianteClases;
  }

  async updateClase(id, data) {
    // Verificar que la clase existe
    const clase = await this.getClaseById(id);

    // Si se intenta cambiar el código, verificar que no existe
    if (data.codigoUnico && data.codigoUnico !== clase.codigoUnico) {
      const existing = await this.claseRepository.findByCodigoUnico(data.codigoUnico);
      if (existing) {
        throw new Error('El código de clase ya existe');
      }
    }

    return await this.claseRepository.update(id, data);
  }

  async deleteClase(id) {
    // Eliminar todos los estudiantes de la clase primero
    await this.estudianteClaseRepository.deleteByClase(id);
    // Luego eliminar la clase
    return await this.claseRepository.delete(id);
  }

  async abandonarClase(idEstudiante, idClase) {
    // Permitir que un estudiante se retire de una clase
    return await this.estudianteClaseRepository.delete(idEstudiante, idClase);
  }
}

module.exports = ClaseService;
