// MapaScreen.js
// H.U. 117 - Vista del mapa de aprendizaje por curso/clase y bimestre
// H.U. 123 - Visualizacion de progreso por modulo
// H.U. 302 - Barra de progreso de XP dentro del mapa de cada clase

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

// Bimestres disponibles
const BIMESTRES = [
  { label: 'I',   value: 1 },
  { label: 'II',  value: 2 },
  { label: 'III', value: 3 },
  { label: 'IV',  value: 4 },
];

// XP necesario para subir de liga (H.U. 302)
const LIGA_XP = {
  Amauta: { threshold: 500,  next: 'Panaca' },
  Panaca: { threshold: 1000, next: 'Auqui'  },
  Auqui:  { threshold: 2000, next: 'Inca'   },
  Inca:   { threshold: null, next: null      },
};

// Estilos visuales por estado del modulo
const ESTADO_STYLE = {
  disponible:  { bg: '#fff',    border: '#1a1a1a', icon: 'play-circle',  iconColor: '#1a1a1a', textColor: '#1a1a1a' },
  en_progreso: { bg: '#f0f7f0', border: '#2e7d32', icon: 'loader',       iconColor: '#2e7d32', textColor: '#1a1a1a' },
  completado:  { bg: '#e8f5e9', border: '#2e7d32', icon: 'check-circle', iconColor: '#2e7d32', textColor: '#1a1a1a' },
  bloqueado:   { bg: '#f5f5f5', border: '#e0e0e0', icon: 'lock',         iconColor: '#bbb',    textColor: '#bbb'    },
};

// Calcula el estado visual de un modulo segun progreso y orden
function calcularEstado(progreso, index, modulosConProgreso) {
  const completados = (progreso && progreso.ejerciciosCompletados) || 0;
  const total       = (progreso && progreso.totalEjercicios) || 0;

  if (completados > 0 && completados < total) return 'en_progreso';
  if (total > 0 && completados >= total) return 'completado';
  if (index === 0) return 'disponible';

  const anterior     = modulosConProgreso[index - 1];
  const antProg      = anterior && anterior.progreso;
  const antComp      = (antProg && antProg.ejerciciosCompletados) || 0;
  const antTotal     = (antProg && antProg.totalEjercicios) || 0;
  const anteriorOk   = antTotal > 0 && antComp >= antTotal;

  return anteriorOk ? 'disponible' : 'bloqueado';
}

// Tarjeta de modulo individual (H.U. 117 + H.U. 123)
function ModuloCard({ item, index, modulosConProgreso, navigation }) {
  const { modulo, progreso } = item;
  const estado  = calcularEstado(progreso, index, modulosConProgreso);
  const st      = ESTADO_STYLE[estado];
  const comp    = (progreso && progreso.ejerciciosCompletados) || 0;
  const total   = (progreso && progreso.totalEjercicios) || 0;
  const pct     = total > 0 ? Math.round((comp / total) * 100) : 0;
  const bloq    = estado === 'bloqueado';

  return (
    <TouchableOpacity
      disabled={bloq}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('EjerciciosModulo', {
          idModulo: modulo.id,
          nombreModulo: modulo.nombre,
        })
      }
      style={[s.moduloCard, { backgroundColor: st.bg, borderColor: st.border }]}
    >
      {/* Fila: numero + nombre + icono de estado */}
      <View style={s.moduloHeader}>
        <View style={[s.ordenCircle, { borderColor: st.border, backgroundColor: bloq ? '#e0e0e0' : '#fff' }]}>
          <Text style={[s.ordenText, { color: st.textColor }]}>
            {modulo.orden != null ? modulo.orden : index + 1}
          </Text>
        </View>
        <Text
          style={[s.moduloNombre, { color: st.textColor }]}
          numberOfLines={2}
        >
          {modulo.nombre}
        </Text>
        <Feather name={st.icon} size={20} color={st.iconColor} />
      </View>

      {/* H.U. 123 - Barra de progreso del modulo */}
      {!bloq && total > 0 && (
        <View style={s.progresoContainer}>
          <View style={s.progresoBarBg}>
            <View
              style={[
                s.progresoBarFill,
                {
                  width: pct + '%',
                  backgroundColor: estado === 'completado' ? '#2e7d32' : '#1a1a1a',
                },
              ]}
            />
          </View>
          <Text style={[s.progresoText, { color: st.textColor }]}>
            {comp}/{total} ejercicios
          </Text>
        </View>
      )}

      {/* Modulo bloqueado */}
      {bloq && (
        <Text style={s.bloqText}>Completa el modulo anterior para desbloquear</Text>
      )}
    </TouchableOpacity>
  );
}

// Pantalla principal del mapa
export default function MapaScreen({ navigation }) {
  const [clases,       setClases]       = useState([]);
  const [tabActivo,    setTabActivo]    = useState(0);
  const [bimestre,     setBimestre]     = useState(1);
  const [modulos,      setModulos]      = useState([]);
  const [xpClase,      setXpClase]      = useState(0);
  const [ligaNombre,   setLigaNombre]   = useState('Amauta');
  const [cargando,     setCargando]     = useState(true);
  const [cargandoMapa, setCargandoMapa] = useState(false);

  // Carga las clases del estudiante
  const cargarClases = async () => {
    try {
      const res = await api.get('/clases/mis-clases');
      const lista = (res.data && res.data.data) || [];
      setClases(lista);
      if (lista.length > 0) {
        await cargarMapa(lista[0].id, 1);
        await cargarXP(lista[0].id);
      }
    } catch (_) {}
  };

  // Carga modulos con progreso por clase y bimestre (H.U. 117)
  const cargarMapa = async (idClase, bim) => {
    setCargandoMapa(true);
    setModulos([]);
    try {
      const res = await api.get('/mapa/clase/' + idClase + '/bimestre/' + bim);
      const data = res.data && res.data.data;
      setModulos((data && data.modulos) || []);
    } catch (_) {
      setModulos([]);
    } finally {
      setCargandoMapa(false);
    }
  };

  // Carga XP acumulado en la clase (H.U. 302)
  const cargarXP = async (idClase) => {
    try {
      const res = await api.get('/xp/clase/' + idClase);
      const data = res.data && res.data.data;
      setXpClase((data && data.xpTotal) || 0);
    } catch (_) {
      setXpClase(0);
    }
  };

  // Carga la liga del perfil para la barra XP
  const cargarLiga = async () => {
    try {
      const res = await api.get('/perfil');
      const liga = res.data &&
                   res.data.data &&
                   res.data.data.estadisticas &&
                   res.data.data.estadisticas.liga;
      setLigaNombre((liga && liga.nombre) || 'Amauta');
    } catch (_) {}
  };

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      Promise.all([cargarClases(), cargarLiga()]).finally(() => setCargando(false));
    }, []),
  );

  const cambiarClase = (idx) => {
    setTabActivo(idx);
    setBimestre(1);
    if (clases[idx]) {
      cargarMapa(clases[idx].id, 1);
      cargarXP(clases[idx].id);
    }
  };

  const cambiarBimestre = (bim) => {
    setBimestre(bim);
    if (clases[tabActivo]) cargarMapa(clases[tabActivo].id, bim);
  };

  if (cargando) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  const claseActiva = clases[tabActivo];
  const ligaInfo    = LIGA_XP[ligaNombre] || LIGA_XP.Amauta;
  const xpMax       = ligaInfo.threshold || (xpClase > 0 ? xpClase : 1);
  const xpPct       = ligaInfo.threshold
    ? Math.min(Math.round((xpClase / xpMax) * 100), 100)
    : 100;
  const bimestreLabel = (BIMESTRES.find(function(b) { return b.value === bimestre; }) || {}).label;

  return (
    <View style={s.root}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mapa de aprendizaje</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* H.U. 117 - Tabs por clase */}
        {clases.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {clases.map(function(c, i) {
              const activo = tabActivo === i;
              let emoji = '📚';
              if (c.curso) {
                const cur = c.curso.toLowerCase();
                if (cur.includes('mat')) emoji = '📐';
                else if (cur.includes('com')) emoji = '📖';
              }
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => cambiarClase(i)}
                  style={[s.tab, activo ? s.tabActivo : s.tabInactivo]}
                >
                  <Text style={{ fontSize: 14 }}>{emoji}</Text>
                  <Text style={[s.tabText, { color: activo ? '#fff' : '#666' }]}>
                    {c.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* H.U. 302 - Barra de XP de la clase */}
        {claseActiva && (
          <View style={s.xpCard}>
            <View style={s.xpRow}>
              <Text style={s.xpLabel}>XP en {claseActiva.nombre}</Text>
              <Text style={s.xpValue}>
                {xpClase}{ligaInfo.threshold ? ' / ' + xpMax : ''} XP
              </Text>
            </View>
            <View style={s.xpBarBg}>
              <View style={[s.xpBarFill, { width: xpPct + '%' }]} />
            </View>
            {ligaInfo.next ? (
              <Text style={s.xpMeta}>
                {Math.max(xpMax - xpClase, 0)} XP para subir a {ligaInfo.next}
              </Text>
            ) : (
              <Text style={s.xpMeta}>Nivel maximo alcanzado</Text>
            )}
          </View>
        )}

        {/* H.U. 117 - Selector de bimestre */}
        <View style={s.bimestreRow}>
          {BIMESTRES.map(function(b) {
            const activo = bimestre === b.value;
            return (
              <TouchableOpacity
                key={b.value}
                onPress={() => cambiarBimestre(b.value)}
                style={[s.bimestreBtn, activo && s.bimestreBtnActivo]}
              >
                <Text style={[s.bimestreText, activo && s.bimestreTextActivo]}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* H.U. 117/123 - Lista de modulos */}
        {cargandoMapa ? (
          <ActivityIndicator color="#1a1a1a" style={{ marginTop: 40 }} />

        ) : modulos.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 14 }}>🗺️</Text>
            <Text style={s.emptyTitle}>Sin modulos</Text>
            <Text style={s.emptySubtitle}>
              El docente aun no asigno modulos para el bimestre {bimestreLabel}.
            </Text>
          </View>

        ) : (
          <View>
            <Text style={s.sectionTitle}>
              Bimestre {bimestreLabel} · {modulos.length} modulo{modulos.length !== 1 ? 's' : ''}
            </Text>
            {modulos.map(function(item, index) {
              return (
                <ModuloCard
                  key={item.modulo.id}
                  item={item}
                  index={index}
                  modulosConProgreso={modulos}
                  navigation={navigation}
                />
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#fff' },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  header: {
    height: 80,
    paddingHorizontal: 20,
    paddingTop: 24,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },

  tab:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, marginRight: 10 },
  tabActivo:  { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  tabInactivo:{ backgroundColor: '#fff',    borderColor: '#e0e0e0' },
  tabText:    { fontSize: 13, fontWeight: '600' },

  xpCard:  { borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 20 },
  xpRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontSize: 12, color: '#666' },
  xpValue: { fontSize: 12, fontWeight: '700', color: '#1a1a1a' },
  xpBarBg: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 6 },
  xpBarFill:{ height: '100%', backgroundColor: '#1b5e20', borderRadius: 4 },
  xpMeta:  { fontSize: 11, color: '#999' },

  bimestreRow:       { flexDirection: 'row', gap: 8, marginBottom: 20 },
  bimestreBtn:       { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  bimestreBtnActivo: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  bimestreText:      { fontSize: 14, fontWeight: '600', color: '#666' },
  bimestreTextActivo:{ color: '#fff' },

  sectionTitle: { fontSize: 12, color: '#999', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 },

  moduloCard:   { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  moduloHeader: { flexDirection: 'row', alignItems: 'center' },
  ordenCircle:  { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  ordenText:    { fontSize: 13, fontWeight: '700' },
  moduloNombre: { fontSize: 14, fontWeight: '600', lineHeight: 20, flex: 1, marginRight: 8 },

  progresoContainer: { marginTop: 12 },
  progresoBarBg:     { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginBottom: 4 },
  progresoBarFill:   { height: '100%', borderRadius: 3 },
  progresoText:      { fontSize: 11 },

  bloqText: { fontSize: 11, color: '#bbb', marginTop: 8 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle:  { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, maxWidth: 260 },
});
