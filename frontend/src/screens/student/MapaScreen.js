// MapaScreen.js
// H.U. 117 - Vista del mapa de aprendizaje por curso/clase y bimestre
// H.U. 123 - Visualizacion de progreso por modulo
// H.U. 302 - Barra de XP dentro del mapa de cada clase

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const BIMESTRES = [
  { label: 'I',   value: 1 },
  { label: 'II',  value: 2 },
  { label: 'III', value: 3 },
  { label: 'IV',  value: 4 },
];

const LIGA_XP = {
  Amauta: { threshold: 500,  next: 'Panaca' },
  Panaca: { threshold: 1000, next: 'Auqui'  },
  Auqui:  { threshold: 2000, next: 'Inca'   },
  Inca:   { threshold: null, next: null      },
};

// Config visual por estado del modulo
const ESTADO = {
  disponible:  {
    bg: '#ffffff', border: '#1a1a1a',
    icon: 'play-circle', iconColor: '#1a1a1a',
    badge: '#1a1a1a', badgeText: '#ffffff', badgeLabel: 'Disponible',
    textColor: '#1a1a1a',
  },
  en_progreso: {
    bg: '#f0fdf4', border: '#16a34a',
    icon: 'loader', iconColor: '#16a34a',
    badge: '#dcfce7', badgeText: '#16a34a', badgeLabel: 'En progreso',
    textColor: '#1a1a1a',
  },
  completado:  {
    bg: '#f0fdf4', border: '#16a34a',
    icon: 'check-circle', iconColor: '#16a34a',
    badge: '#16a34a', badgeText: '#ffffff', badgeLabel: 'Completado',
    textColor: '#1a1a1a',
  },
  bloqueado:   {
    bg: '#fafafa', border: '#e5e7eb',
    icon: 'lock', iconColor: '#d1d5db',
    badge: '#f3f4f6', badgeText: '#9ca3af', badgeLabel: 'Bloqueado',
    textColor: '#9ca3af',
  },
};

function calcularEstado(progreso, index, lista) {
  var comp  = (progreso && progreso.ejerciciosCompletados) || 0;
  var total = (progreso && progreso.totalEjercicios) || 0;

  if (comp > 0 && comp < total) return 'en_progreso';
  if (total > 0 && comp >= total) return 'completado';
  if (index === 0) return 'disponible';

  var ant      = lista[index - 1];
  var antProg  = ant && ant.progreso;
  var antComp  = (antProg && antProg.ejerciciosCompletados) || 0;
  var antTotal = (antProg && antProg.totalEjercicios) || 0;
  return (antTotal > 0 && antComp >= antTotal) ? 'disponible' : 'bloqueado';
}

// Tarjeta de modulo individual
function ModuloCard({ item, index, lista }) {
  var modulo  = item.modulo;
  var progreso = item.progreso;
  var estado  = calcularEstado(progreso, index, lista);
  var cfg     = ESTADO[estado];
  var comp    = (progreso && progreso.ejerciciosCompletados) || 0;
  var total   = (progreso && progreso.totalEjercicios) || 0;
  var pct     = total > 0 ? Math.round((comp / total) * 100) : 0;
  var bloq    = estado === 'bloqueado';

  return (
    <View style={[st.moduloCard, { backgroundColor: cfg.bg, borderColor: cfg.border, opacity: bloq ? 0.6 : 1 }]}>
      {/* Fila superior: numero + nombre + badge estado */}
      <View style={st.moduloTop}>
        {/* Circulo numerado */}
        <View style={[st.numCircle, { borderColor: cfg.border, backgroundColor: bloq ? '#f3f4f6' : cfg.bg }]}>
          <Text style={[st.numText, { color: cfg.textColor }]}>
            {modulo.orden != null ? modulo.orden : index + 1}
          </Text>
        </View>

        {/* Nombre */}
        <Text style={[st.moduloNombre, { color: cfg.textColor }]} numberOfLines={2}>
          {modulo.nombre}
        </Text>

        {/* Icono de estado */}
        <Feather name={cfg.icon} size={20} color={cfg.iconColor} />
      </View>

      {/* Badge de estado */}
      <View style={st.moduloBadgeRow}>
        <View style={[st.badge, { backgroundColor: cfg.badge }]}>
          <Text style={[st.badgeText, { color: cfg.badgeText }]}>{cfg.badgeLabel}</Text>
        </View>
      </View>

      {/* H.U. 123 - Barra de progreso */}
      {!bloq && total > 0 && (
        <View style={st.progresoWrap}>
          <View style={st.progresoMeta}>
            <Text style={st.progresoLabel}>{comp}/{total} ejercicios</Text>
            <Text style={[st.progresoLabel, { fontWeight: '700', color: pct === 100 ? '#16a34a' : '#1a1a1a' }]}>
              {pct}%
            </Text>
          </View>
          <View style={st.barBg}>
            <View
              style={[
                st.barFill,
                {
                  width: pct + '%',
                  backgroundColor: pct === 100 ? '#16a34a' : '#1a1a1a',
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Mensaje bloqueado */}
      {bloq && (
        <View style={st.bloqRow}>
          <Feather name="info" size={12} color="#9ca3af" />
          <Text style={st.bloqText}>Completa el modulo anterior para desbloquear</Text>
        </View>
      )}
    </View>
  );
}

// Pantalla principal
export default function MapaScreen() {
  var [clases,       setClases]       = useState([]);
  var [tabActivo,    setTabActivo]    = useState(0);
  var [bimestre,     setBimestre]     = useState(1);
  var [modulos,      setModulos]      = useState([]);
  var [xpClase,      setXpClase]      = useState(0);
  var [ligaNombre,   setLigaNombre]   = useState('Amauta');
  var [cargando,     setCargando]     = useState(true);
  var [cargandoMapa, setCargandoMapa] = useState(false);
  var [errorMapa,    setErrorMapa]    = useState(null);

  var cargarMapa = function(idClase, bim) {
    setCargandoMapa(true);
    setModulos([]);
    setErrorMapa(null);
    api.get('/mapa/clase/' + idClase + '/bimestre/' + bim)
      .then(function(res) {
        var data = res.data && res.data.data;
        setModulos((data && data.modulos) || []);
      })
      .catch(function(err) {
        var msg = (err.response && err.response.data && err.response.data.error && err.response.data.error.message)
          || err.message || 'Error al cargar modulos';
        setErrorMapa(msg);
      })
      .finally(function() {
        setCargandoMapa(false);
      });
  };

  var cargarXP = function(idClase) {
    api.get('/xp/clase/' + idClase)
      .then(function(res) {
        var data = res.data && res.data.data;
        setXpClase((data && data.xpTotal) || 0);
      })
      .catch(function() { setXpClase(0); });
  };

  var cargarClases = function() {
    return api.get('/clases/mis-clases')
      .then(function(res) {
        var lista = (res.data && res.data.data) || [];
        setClases(lista);
        if (lista.length > 0) {
          cargarMapa(lista[0].id, 1);
          cargarXP(lista[0].id);
        }
      })
      .catch(function() {});
  };

  var cargarLiga = function() {
    return api.get('/perfil')
      .then(function(res) {
        var liga = res.data &&
                   res.data.data &&
                   res.data.data.estadisticas &&
                   res.data.data.estadisticas.liga;
        setLigaNombre((liga && liga.nombre) || 'Amauta');
      })
      .catch(function() {});
  };

  useFocusEffect(
    useCallback(function() {
      setCargando(true);
      Promise.all([cargarClases(), cargarLiga()]).finally(function() {
        setCargando(false);
      });
    }, []),
  );

  var cambiarClase = function(idx) {
    setTabActivo(idx);
    setBimestre(1);
    if (clases[idx]) {
      cargarMapa(clases[idx].id, 1);
      cargarXP(clases[idx].id);
    }
  };

  var cambiarBimestre = function(bim) {
    setBimestre(bim);
    if (clases[tabActivo]) cargarMapa(clases[tabActivo].id, bim);
  };

  // Loading inicial
  if (cargando) {
    return (
      <View style={st.centered}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  var claseActiva  = clases[tabActivo];
  var ligaInfo     = LIGA_XP[ligaNombre] || LIGA_XP.Amauta;
  var xpMax        = ligaInfo.threshold || (xpClase > 0 ? xpClase : 1);
  var xpPct        = ligaInfo.threshold
    ? Math.min(Math.round((xpClase / xpMax) * 100), 100)
    : 100;
  var bimestreLabel = (BIMESTRES.find(function(b) { return b.value === bimestre; }) || {}).label;

  return (
    <View style={st.root}>

      {/* Header */}
      <View style={st.header}>
        <Text style={st.headerTitle}>Mapa de aprendizaje</Text>
        {claseActiva && (
          <Text style={st.headerSub}>{claseActiva.nombre}</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Tabs de clase */}
        {clases.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.tabsContainer}
          >
            {clases.map(function(c, i) {
              var activo = tabActivo === i;
              var cur = c.curso ? c.curso.toLowerCase() : '';
              var emoji = cur.includes('mat') ? '📐' : cur.includes('com') ? '📖' : '📚';
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={function() { cambiarClase(i); }}
                  activeOpacity={0.8}
                  style={[st.tab, activo ? st.tabOn : st.tabOff]}
                >
                  <Text style={{ fontSize: 15 }}>{emoji}</Text>
                  <Text style={[st.tabText, { color: activo ? '#ffffff' : '#6b7280' }]}>
                    {c.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* H.U. 302 - Tarjeta XP */}
        {claseActiva && (
          <View style={st.xpCard}>
            <View style={st.xpTop}>
              {/* Liga + nombre clase */}
              <View>
                <Text style={st.xpLiga}>{ligaNombre}</Text>
                <Text style={st.xpClaseNombre}>{claseActiva.nombre}</Text>
              </View>
              {/* XP valor */}
              <View style={st.xpValorWrap}>
                <Text style={st.xpValor}>{xpClase}</Text>
                <Text style={st.xpUnidad}>XP</Text>
              </View>
            </View>

            {/* Barra XP */}
            <View style={st.xpBarBg}>
              <View style={[st.xpBarFill, { width: xpPct + '%' }]} />
            </View>

            {/* Meta */}
            <View style={st.xpBottom}>
              {ligaInfo.next ? (
                <Text style={st.xpMeta}>
                  {Math.max(xpMax - xpClase, 0)} XP para subir a{' '}
                  <Text style={{ fontWeight: '700' }}>{ligaInfo.next}</Text>
                </Text>
              ) : (
                <Text style={st.xpMeta}>Nivel maximo alcanzado 🏆</Text>
              )}
              <Text style={st.xpPct}>{xpPct}%</Text>
            </View>
          </View>
        )}

        {/* Selector de bimestre */}
        <View style={st.bimRow}>
          {BIMESTRES.map(function(b) {
            var activo = bimestre === b.value;
            return (
              <TouchableOpacity
                key={b.value}
                onPress={function() { cambiarBimestre(b.value); }}
                activeOpacity={0.8}
                style={[st.bimBtn, activo && st.bimBtnOn]}
              >
                <Text style={[st.bimText, activo && st.bimTextOn]}>Bim {b.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contenido: cargando / error / sin modulos / lista */}
        {cargandoMapa ? (
          <View style={st.mapaLoading}>
            <ActivityIndicator color="#1a1a1a" size="large" />
            <Text style={st.mapaLoadingText}>Cargando modulos...</Text>
          </View>

        ) : errorMapa ? (
          <View style={st.emptyWrap}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>⚠️</Text>
            <Text style={st.emptyTitle}>Error al cargar</Text>
            <Text style={st.emptySub}>{errorMapa}</Text>
          </View>

        ) : modulos.length === 0 ? (
          <View style={st.emptyWrap}>
            <Text style={{ fontSize: 52, marginBottom: 14 }}>🗺️</Text>
            <Text style={st.emptyTitle}>Sin modulos</Text>
            <Text style={st.emptySub}>
              El docente aun no asigno modulos para el Bimestre {bimestreLabel}.
            </Text>
          </View>

        ) : (
          <View>
            {/* Encabezado de la lista */}
            <View style={st.listaHeader}>
              <Text style={st.listaHeaderText}>
                BIMESTRE {bimestreLabel}
              </Text>
              <View style={st.listaPill}>
                <Text style={st.listaPillText}>
                  {modulos.length} modulo{modulos.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Linea vertical + tarjetas */}
            <View style={st.timeline}>
              {modulos.map(function(item, index) {
                var estado = calcularEstado(item.progreso, index, modulos);
                var isLast = index === modulos.length - 1;
                return (
                  <View key={item.modulo.id} style={st.timelineItem}>
                    {/* Punto en la linea */}
                    <View style={st.timelineDot}>
                      <View style={[
                        st.dot,
                        estado === 'completado'  ? st.dotOk   :
                        estado === 'en_progreso' ? st.dotProg :
                        estado === 'disponible'  ? st.dotDis  :
                        st.dotBloq,
                      ]} />
                      {!isLast && <View style={st.timelineLine} />}
                    </View>
                    {/* Tarjeta */}
                    <View style={st.timelineCard}>
                      <ModuloCard item={item} index={index} lista={modulos} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f9fafb' },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },

  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, color: '#6b7280', marginTop: 2 },

  scroll: { paddingBottom: 40 },

  // Tabs de clase
  tabsContainer: { paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  tab:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1.5 },
  tabOn:  { backgroundColor: '#111827', borderColor: '#111827' },
  tabOff: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  tabText:{ fontSize: 13, fontWeight: '600' },

  // XP Card (H.U. 302)
  xpCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
  },
  xpTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  xpLiga:       { fontSize: 11, color: '#9ca3af', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  xpClaseNombre:{ fontSize: 15, fontWeight: '700', color: '#ffffff', marginTop: 2 },
  xpValorWrap:  { alignItems: 'flex-end' },
  xpValor:      { fontSize: 28, fontWeight: '800', color: '#ffffff', lineHeight: 32 },
  xpUnidad:     { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  xpBarBg:      { height: 6, backgroundColor: '#374151', borderRadius: 3, marginBottom: 10 },
  xpBarFill:    { height: '100%', backgroundColor: '#4ade80', borderRadius: 3 },
  xpBottom:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpMeta:       { fontSize: 12, color: '#9ca3af' },
  xpPct:        { fontSize: 12, color: '#4ade80', fontWeight: '700' },

  // Bimestres
  bimRow:    { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  bimBtn:    { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center', backgroundColor: '#ffffff' },
  bimBtnOn:  { backgroundColor: '#111827', borderColor: '#111827' },
  bimText:   { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  bimTextOn: { color: '#ffffff' },

  // Loading/empty del mapa
  mapaLoading:     { alignItems: 'center', paddingVertical: 60 },
  mapaLoadingText: { marginTop: 12, fontSize: 13, color: '#6b7280' },
  emptyWrap:  { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub:   { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  // Lista header
  listaHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  listaHeaderText: { fontSize: 11, fontWeight: '700', color: '#6b7280', letterSpacing: 1 },
  listaPill:   { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  listaPillText:{ fontSize: 11, color: '#6b7280', fontWeight: '600' },

  // Timeline
  timeline:     { paddingHorizontal: 20 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineDot:  { width: 28, alignItems: 'center' },
  dot:          { width: 12, height: 12, borderRadius: 6, marginTop: 16 },
  dotOk:        { backgroundColor: '#16a34a' },
  dotProg:      { backgroundColor: '#16a34a', borderWidth: 2, borderColor: '#dcfce7' },
  dotDis:       { backgroundColor: '#111827' },
  dotBloq:      { backgroundColor: '#e5e7eb' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#e5e7eb', marginTop: 4 },
  timelineCard: { flex: 1, paddingBottom: 12 },

  // Tarjeta modulo
  moduloCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginLeft: 8,
  },
  moduloTop:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  numCircle:   { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  numText:     { fontSize: 13, fontWeight: '800' },
  moduloNombre:{ flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20, marginRight: 8 },

  // Badge estado
  moduloBadgeRow: { marginBottom: 10 },
  badge:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Progreso (H.U. 123)
  progresoWrap:  { marginTop: 2 },
  progresoMeta:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progresoLabel: { fontSize: 11, color: '#6b7280' },
  barBg:         { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  barFill:       { height: '100%', borderRadius: 3 },

  // Bloqueado
  bloqRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  bloqText: { fontSize: 11, color: '#9ca3af', flex: 1 },
});
