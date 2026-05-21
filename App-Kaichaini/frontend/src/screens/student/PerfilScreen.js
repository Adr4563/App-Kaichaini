import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Modal, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';
import api from '../../services/api';

const LIGA_NEXT = {
  Amauta: { next: 'Panaca', threshold: 500  },
  Panaca: { next: 'Auqui',  threshold: 1000 },
  Auqui:  { next: 'Inca',   threshold: 2000 },
  Inca:   { next: null,     threshold: null  },
};

const INSIGNIA_ICONS = ['⭐', '🏆', '🎯', '💎', '🔥', '⚡', '🌟', '🎖️'];

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [perfil,       setPerfil]       = useState(null);
  const [todasInsig,   setTodasInsig]   = useState([]);
  const [clases,       setClases]       = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [showConfig,   setShowConfig]   = useState(false);
  const [showLogout,   setShowLogout]   = useState(false);

  const cargar = async () => {
    try {
      const [{ data: p }, { data: ins }, { data: cls }] = await Promise.all([
        api.get('/perfil'),
        api.get('/insignias'),
        api.get('/clases/mis-clases'),
      ]);
      setPerfil(p.data);
      setTodasInsig(ins.data || []);
      setClases(cls.data || []);
    } catch (_) {
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const nombre     = perfil?.usuario?.nombre || usuario?.nombre || '';
  const avatarUri  = perfil?.usuario?.avatar || usuario?.avatar;
  const xpTotal    = perfil?.estadisticas?.xpTotal ?? 0;
  const ligaNombre = perfil?.estadisticas?.liga?.nombre ?? 'Amauta';
  const ganadas    = perfil?.estadisticas?.insignias ?? [];
  const claseActual = clases[0];

  const initials = nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

  const { next: nextNombre, threshold: nextThreshold } = LIGA_NEXT[ligaNombre] || LIGA_NEXT.Amauta;
  const progress  = nextThreshold ? Math.min(xpTotal / nextThreshold, 1) : 1;
  const remaining = nextThreshold ? Math.max(nextThreshold - xpTotal, 0) : 0;

  const ganadosIds = new Set(ganadas.map(i => i.id));
  const totalSlots = Math.max(todasInsig.length, 8);

  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={{ height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eaeaea' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a' }}>Mi perfil</Text>
        <TouchableOpacity onPress={() => setShowConfig(true)}>
          <Feather name="settings" size={20} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Tarjeta de perfil */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          {avatarUri
            ? <Image source={{ uri: avatarUri }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#1a1a1a' }} />
            : (
              <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#1a1a1a', backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 26, fontWeight: '700', color: '#666' }}>{initials}</Text>
              </View>
            )
          }
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 }}>{nombre}</Text>
            {claseActual ? (
              <Text style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
                {claseActual.nombre}
                {claseActual.curso ? ` · ${claseActual.curso}` : ''}
              </Text>
            ) : null}
            <View style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#1a1a1a' }}>🏆 Liga {ligaNombre}</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta XP */}
        <View style={{ borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>XP total</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#1a1a1a' }}>
              {nextThreshold ? `${xpTotal} / ${nextThreshold} XP` : `${xpTotal} XP`}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 8 }}>
            <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: '#1b5e20', borderRadius: 4 }} />
          </View>
          {nextNombre
            ? <Text style={{ fontSize: 11, color: '#999' }}>{remaining} XP para subir a 🏆 {nextNombre}</Text>
            : <Text style={{ fontSize: 11, color: '#999' }}>Has alcanzado el nivel máximo</Text>
          }
        </View>

        {/* Insignias */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a' }}>Mis insignias</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Ver todas →</Text>
        </View>

        {ganadas.length === 0 && todasInsig.length === 0 ? (
          <Text style={{ fontSize: 14, color: '#666', fontStyle: 'italic', lineHeight: 20 }}>
            Aún no tienes insignias. Completa módulos para ganarlas.
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {todasInsig.map((ins, i) => {
              const desbloqueada = ganadosIds.has(ins.id);
              return (
                <View
                  key={ins.id}
                  style={{
                    width: '22%', aspectRatio: 1, borderRadius: 12,
                    backgroundColor: desbloqueada ? '#fff' : '#f5f5f5',
                    borderWidth: desbloqueada ? 1 : 0,
                    borderColor: '#1a1a1a',
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20, color: desbloqueada ? '#000' : '#ccc' }}>
                    {desbloqueada ? (INSIGNIA_ICONS[i] || '⭐') : '?'}
                  </Text>
                </View>
              );
            })}
            {Array.from({ length: Math.max(0, 8 - todasInsig.length) }).map((_, i) => (
              <View key={`lock-${i}`} style={{ width: '22%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, color: '#ccc' }}>?</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Panel de configuración */}
      <Modal visible={showConfig} transparent animationType="slide" onRequestClose={() => setShowConfig(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowConfig(false)}
        >
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eaeaea', gap: 14 }}
              onPress={() => { setShowConfig(false); navigation.navigate('PersonalizarPerfil'); }}
            >
              <Feather name="edit-2" size={18} color="#1a1a1a" />
              <Text style={{ fontSize: 16, color: '#1a1a1a', fontWeight: '500' }}>Personalizar perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eaeaea', gap: 14 }}
              onPress={() => { setShowConfig(false); navigation.navigate('UnirseAClase'); }}
            >
              <Feather name="users" size={18} color="#1a1a1a" />
              <Text style={{ fontSize: 16, color: '#1a1a1a', fontWeight: '500' }}>Unirse a una clase</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 }}
              onPress={() => { setShowConfig(false); setTimeout(() => setShowLogout(true), 300); }}
            >
              <Feather name="log-out" size={18} color="#cc0000" />
              <Text style={{ fontSize: 16, color: '#cc0000', fontWeight: '500' }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <LogoutModal
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={async () => { setShowLogout(false); await logout(); }}
      />
    </View>
  );
}
