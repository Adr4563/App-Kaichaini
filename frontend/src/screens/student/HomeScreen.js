import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { usuario } = useAuth();

  return (
    <View style={s.container}>
      <Text style={s.title}>Mapa de aprendizaje</Text>
      <Text style={s.subtitle}>Bienvenido, {usuario?.nombre}</Text>

      {/* ── Accesos rápidos H.U. 401 y 408 ────────────────────────── */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.btn}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Silabo')}
        >
          <Text style={s.btnIcon}>📄</Text>
          <Text style={s.btnText}>Sílabo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btn}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Material')}
        >
          <Text style={s.btnIcon}>📚</Text>
          <Text style={s.btnText}>Material académico</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 36,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  btnIcon: {
    fontSize: 16,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
