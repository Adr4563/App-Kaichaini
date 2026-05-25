// H.U. 118 - Vista 'Mi Colección' de insignias obtenidas
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const INSIGNIA_ICONS = [
  'star', 'zap', 'award', 'check-circle',
  'target', 'book-open', 'shield', 'sun',
];

export default function MiColeccionScreen({ navigation }) {
  const [todas,    setTodas]    = useState([]);
  const [ganadas,  setGanadas]  = useState([]);
  const [filtro,   setFiltro]   = useState('todas');
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const [{ data: t }, { data: g }] = await Promise.all([
        api.get('/insignias'),
        api.get('/insignias/mis-insignias'),
      ]);
      setTodas(t.data || []);
      setGanadas(g.data || []);
    } catch (_) {
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const ganadosIds = new Set(ganadas.map(i => i.id));

  const lista =
    filtro === 'obtenidas'
      ? todas.filter(i => ganadosIds.has(i.id))
      : filtro === 'por_desbloquear'
      ? todas.filter(i => !ganadosIds.has(i.id))
      : todas;

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mi colección</Text>
        </View>
        <Text style={s.contador}>{ganadas.length} / {todas.length}</Text>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtros}>
        {[
          { key: 'todas',           label: `Todas · ${todas.length}` },
          { key: 'obtenidas',       label: `Obtenidas · ${ganadas.length}` },
          { key: 'por_desbloquear', label: `Por desbloquear · ${todas.length - ganadas.length}` },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filtroBtn, filtro === f.key && s.filtroBtnActivo]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[s.filtroBtnText, filtro === f.key && s.filtroBtnTextActivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid de insignias */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {lista.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Feather name="inbox" size={40} color="#ccc" />
            <Text style={{ fontSize: 14, color: '#999', marginTop: 12 }}>Sin insignias en esta categoría</Text>
          </View>
        ) : (
          <View style={s.grid}>
            {lista.map((insignia, i) => {
              const desbloqueada = ganadosIds.has(insignia.id);
              const iconName     = INSIGNIA_ICONS[i % INSIGNIA_ICONS.length];

              return (
                <View
                  key={insignia.id}
                  style={[s.badge, desbloqueada ? s.badgeGanado : s.badgeBloqueado]}
                >
                  <View style={[s.badgeIconWrap, { backgroundColor: desbloqueada ? '#f39c12' : '#e5e5e5' }]}>
                    <Feather
                      name={desbloqueada ? iconName : 'lock'}
                      size={22}
                      color={desbloqueada ? '#fff' : '#aaa'}
                    />
                  </View>

                  <Text style={[s.badgeNombre, !desbloqueada && s.badgeNombreLock]} numberOfLines={2}>
                    {insignia.nombre}
                  </Text>

                  <Text style={s.badgeEstado}>
                    {desbloqueada ? 'Ganada' : 'Bloqueada'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header:             { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:        { fontSize: 20, fontWeight: '700', color: '#111' },
  contador:           { fontSize: 14, color: '#8e8e93', fontWeight: '500' },
  filtros:            { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filtroBtn:          { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#e5e5e5' },
  filtroBtnActivo:    { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  filtroBtnText:      { fontSize: 13, fontWeight: '600', color: '#666' },
  filtroBtnTextActivo:{ color: '#fff' },
  grid:               { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge:              { width: '30%', borderRadius: 16, padding: 10, alignItems: 'center', minHeight: 115, justifyContent: 'space-between' },
  badgeGanado:        { borderWidth: 2, borderColor: '#111', backgroundColor: '#fff' },
  badgeBloqueado:     { borderWidth: 1, borderColor: '#ededed', backgroundColor: '#fafafa' },
  badgeIconWrap:      { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  badgeNombre:        { fontSize: 11, fontWeight: '700', color: '#111', textAlign: 'center', lineHeight: 14 },
  badgeNombreLock:    { color: '#8e8e93' },
  badgeEstado:        { fontSize: 9, color: '#8e8e93', fontWeight: '500' },
});
