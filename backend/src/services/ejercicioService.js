const { v4: uuidv4 } = require('uuid');
const Ejercicio = require('../models/Ejercicio');

class EjercicioService {
  constructor(ejercicioRepository, respuestaRepository) {
    this.ejercicioRepository = ejercicioRepository;
    this.respuestaRepository = respuestaRepository;
  }

  async createEjercicio(data) {
    if (!data.idModulo || !data.enunciado || !data.respuestaCorrecta) {
      throw new Error('Datos incompletos para crear ejercicio');
    }

    const ejercicioData = {
      id: uuidv4(),
      idModulo: data.idModulo,
      tipo: data.tipo || 'seleccion_multiple',
      enunciado: data.enunciado,
      respuestaCorrecta: data.respuestaCorrecta,
    };

    const ejercicio = new Ejercicio(ejercicioData);
    if (!ejercicio.isValid()) {
      throw new Error('Datos inválidos para crear ejercicio');
    }

    return await this.ejercicioRepository.create(ejercicio);
  }

  async getEjerciciosByModulo(idModulo, idEstudiante) {
    // Obtener ejercicios del módulo con estado de respuesta del estudiante
    const ejercicios = await this.ejercicioRepository.findByModulo(idModulo);

    const resultado = [];
    for (const ej of ejercicios) {
      // Buscar si el estudiante ya respondió este ejercicio
      const respuestas = await this.respuestaRepository.findByEstudianteModulo(
        idEstudiante,
        idModulo
      );

      const respuestaEstudiante = respuestas.find(r => r.idEjercicio === ej.id);

      resultado.push({
        ...ej.toJSON(),
        respondido: !!respuestaEstudiante,
        esCorrecta: respuestaEstudiante?.esCorrecta || null,
      });
    }

    return resultado;
  }

  async getEjercicioById(id) {
    const ejercicio = await this.ejercicioRepository.findById(id);
    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }
    return ejercicio;
  }

  async getEjercicioDocenteById(id) {
    // Obtener ejercicio con respuestaCorrecta visible (solo para docentes)
    const ejercicio = await this.getEjercicioById(id);
    return {
      ...ejercicio.toJSON(),
      respuestaCorrecta: ejercicio.respuestaCorrecta,
    };
  }

  async updateEjercicio(id, data) {
    await this.getEjercicioById(id); // Validar que existe
    return await this.ejercicioRepository.update(id, data);
  }

  async deleteEjercicio(id) {
    return await this.ejercicioRepository.delete(id);
  }
}

module.exports = EjercicioService;
