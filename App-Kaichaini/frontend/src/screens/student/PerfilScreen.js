import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';

export default function PerfilScreen() {
  const { usuario, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={s.container}>
      <Text style={s.name}>{usuario?.nombre}</Text>
      <Text style={s.correo}>{usuario?.correo}</Text>

      <TouchableOpacity style={s.btn} onPress={() => setShowModal(true)}>
        <Text style={s.btnText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <LogoutModal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={async () => { setShowModal(false); await logout(); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24 },
  name:      { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 4 },
  correo:    { fontSize: 14, color: '#666', marginBottom: 32 },
  btn:       { borderWidth: 1, borderColor: '#333', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  btnText:   { fontSize: 15, fontWeight: '600', color: '#111' },
});
