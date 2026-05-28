const { v4: uuidv4 } = require('uuid');
const Respuesta = require('../models/Respuesta');
const { XP_POR_TIPO_EJERCICIO, XP_BONO_MODULO_COMPLETADO, RETROALIMENTACION_THRESHOLDS } = require('../utils/constants');

class RespuestaService {
  constructor(
    respuestaRepository,
    ejercicioRepository,
    moduloRepository,
    xpService,
    ligaService,
    insigniaService
  ) {
    this.respuestaRepository = respuestaRepository;
    this.ejercicioRepository = ejercicioRepository;
    this.moduloRepository = moduloRepository;
    this.xpService = xpService;
    this.ligaService = ligaService;
    this.insigniaService = insigniaService;
  }

  async responder(idEstudiante, idEjercicio, respuestaDada, reintentar = false) {
    // H.U. 309, 311, 312 - CORE del sistema de gamificación
    // 1. Obtener ejercicio
    const ejercicio = await this.ejercicioRepository.findById(idEjercicio);
    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    // 2. Verificar si ya fue respondido correctamente (para no duplicar XP al reintentar)
    const yaCorrectoAntes = await this.respuestaRepository.yaRespondioCorrectamente(idEstudiante, idEjercicio);

    // 3. Comparar respuesta (normalizar: trim, lowercase)
    const respuestaCorrecta = ejercicio.respuestaCorrecta.trim().toLowerCase();
    const respuestaEstudiante = respuestaDada.trim().toLowerCase();
    const esCorrecta = respuestaCorrecta === respuestaEstudiante;


    // 4. Guardar respuesta (siempre se registra el intento)
    const respuestaData = {
      id: uuidv4(),
      idEstudiante,
      idEjercicio,
      respuesta: respuestaDada,
      esCorrecta,
      fechaRespuesta: new Date(),
    };

    const respuestaGuardada = await this.respuestaRepository.create(respuestaData);

    let xpGanado = 0;
    let insigniasDesbloqueadas = [];
    let ligaActualizada = null;

    if (esCorrecta) {
      // 5. Solo otorgar XP si: primera vez correcta Y no es un reintento de módulo
      if (!yaCorrectoAntes && !reintentar) {
        const xpPorEste = XP_POR_TIPO_EJERCICIO[ejercicio.tipo] || 10;
        xpGanado = xpPorEste;
      }

      // Otorgar XP y actualizar liga (solo si hay XP que otorgar)
      let xpTotal;
      if (xpGanado > 0) {
        const resultado = await this.xpService.otorgarYActualizarLiga(idEstudiante, xpGanado);
        xpTotal = resultado.xpTotal;
        ligaActualizada = resultado.liga;
      } else {
        xpTotal = await this.xpService.getXPTotal(idEstudiante);
      }

      // 5. Calcular progreso del módulo
      const modulo = await this.moduloRepository.findById(ejercicio.idModulo);
      const totalEjercicios = await this.ejercicioRepository.contarByModulo(ejercicio.idModulo);
      const correctas = await this.respuestaRepository.contarCorrectasPorModulo(
        idEstudiante,
        ejercicio.idModulo
      );

      const porcentajeAciertos = (correctas / totalEjercicios) * 100;
      const progresoModulo = {
        idModulo: ejercicio.idModulo,
        totalEjercicios,
        correctas,
        porcentajeAciertos,
      };

      // 6. Si módulo al 100%: desbloquear siguiente
      if (porcentajeAciertos === 100) {
        await this.moduloRepository.desbloquear(ejercicio.idModulo);
        const siguienteModulo = await this.moduloRepository.findSiguienteModulo(ejercicio.idModulo);
        if (siguienteModulo) {
          await this.moduloRepository.desbloquear(siguienteModulo.id);
        }
      }

      // 7. Bono XP al cruzar 80% por PRIMERA vez
      // Solo aplica si este ejercicio se responde correctamente por primera vez
      // y el porcentaje recién supera 80 (antes estaba debajo)
      if (!yaCorrectoAntes) {
        const porcentajeAntes = totalEjercicios > 0
          ? ((correctas - 1) / totalEjercicios) * 100
          : 0;
        if (porcentajeAntes < 80 && porcentajeAciertos >= 80) {
          await this.xpService.otorgarYActualizarLiga(idEstudiante, XP_BONO_MODULO_COMPLETADO);
          xpGanado += XP_BONO_MODULO_COMPLETADO;
        }
      }

      // 8. Verificar y desbloquear insignias
      const totalCorrectasGlobal = await this.respuestaRepository.contarTotalCorrectas(idEstudiante);

      insigniasDesbloqueadas = await this.insigniaService.verificarYDesbloquear(
        idEstudiante,
        {
          primerEjercicioCorrecto: true,
          primerModuloCompletado: porcentajeAciertos === 100,
          notaPerfecta: porcentajeAciertos === 100,
          totalCorrectasGlobal,
          xpTotal,
        }
      );

      return {
        esCorrecta: true,
        xpGanado,
        xpTotal,
        liga: ligaActualizada ? ligaActualizada.toJSON() : null,
        progresoModulo,
        insigniasDesbloqueadas,
        retroalimentacion: this.getRetroalimentacion(correctas, totalEjercicios),
      };
    } else {
      // Si incorrecta: solo calcular retroalimentación
      const modulo = await this.moduloRepository.findById(ejercicio.idModulo);
      const totalEjercicios = await this.ejercicioRepository.contarByModulo(ejercicio.idModulo);
      const correctas = await this.respuestaRepository.contarCorrectasPorModulo(
        idEstudiante,
        ejercicio.idModulo
      );

      return {
        esCorrecta: false,
        xpGanado: 0,
        retroalimentacion: this.getRetroalimentacion(correctas, totalEjercicios),
      };
    }
  }

  getRetroalimentacion(correctas, total) {
    // H.U. 207 - Retroalimentación basada en errores
    const errores = total - correctas;

    if (errores <= 2) {
      return RETROALIMENTACION_THRESHOLDS.EXCELENTE.mensaje;
    } else if (errores <= 5) {
      return RETROALIMENTACION_THRESHOLDS.BUENO.mensaje;
    } else {
      return RETROALIMENTACION_THRESHOLDS.NECESITA_MEJORA.mensaje;
    }
  }

  async getHistorial(idEstudiante, idModulo = null) {
    // H.U. 203 - Obtener historial de respuestas
    let respuestas;

    if (idModulo) {
      respuestas = await this.respuestaRepository.findByEstudianteModulo(
        idEstudiante,
        idModulo
      );
    } else {
      respuestas = await this.respuestaRepository.findByEstudiante(idEstudiante);
    }

    return respuestas.map(r => ({
      ...r.toJSON(),
      ejercicio: {
        id: r.idEjercicio,
        enunciado: r.enunciado,
        tipo: r.tipo,
      },
    }));
  }

  async getRetroalimentacionModulo(idEstudiante, idModulo) {
    // H.U. 207 - Obtener retroalimentación de un módulo
    // Agrupa por ejercicio para que los reintentos no inflen los conteos
    const respuestas = await this.respuestaRepository.findByEstudianteModulo(
      idEstudiante,
      idModulo
    );

    // Un ejercicio = correcto si tuvo AL MENOS UNA respuesta correcta
    const ejerciciosMap = new Map(); // idEjercicio -> boolean (alguna vez correcto)
    for (const r of respuestas) {
      if (!ejerciciosMap.has(r.idEjercicio)) {
        ejerciciosMap.set(r.idEjercicio, false);
      }
      if (r.esCorrecta) {
        ejerciciosMap.set(r.idEjercicio, true);
      }
    }

    const total    = ejerciciosMap.size;
    const correctas = [...ejerciciosMap.values()].filter(v => v).length;
    const errores   = total - correctas;

    return {
      totalRespuestas:        total,
      respuestasCorrectas:    correctas,
      respuestasIncorrectas:  errores,
      porcentajeAciertos:     total > 0 ? (correctas / total) * 100 : 0,
      retroalimentacion:      this.getRetroalimentacion(correctas, total),
    };
  }

  async getEvaluacionModulo(idEstudiante, idModulo) {
    // H.U. 314 - Evaluación al completar un módulo
    const modulo = await this.moduloRepository.findById(idModulo);
    const retroalimentacion = await this.getRetroalimentacionModulo(idEstudiante, idModulo);
    const xpPorClase = await this.xpService.getXPPorClase(idEstudiante, modulo.idClase);

    return {
      modulo: modulo.toJSON(),
      evaluacion: retroalimentacion,
      xpEnClase: xpPorClase,
      timestamp: new Date(),
    };
  }
}

module.exports = RespuestaService;
