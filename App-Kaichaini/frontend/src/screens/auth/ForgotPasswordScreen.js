import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { s, C } from '../../styles/screens/ForgotPasswordScreen.styles';

export default function ForgotPasswordScreen({ navigation }) {
  const [correo,   setCorreo]   = useState('');
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');
  const [enviado,  setEnviado]  = useState(false);

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  const handleEnviar = async () => {
    if (!correoValido) { setError('Ingresa un correo válido'); return; }
    setCargando(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { correo: correo.trim() });
      setEnviado(true);
    } catch (e) {
      const msg = e.response?.data?.error?.message || 'Error al enviar el enlace';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Recuperar contraseña</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {!enviado ? (
          <>
            <Text style={s.description}>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              El enlace tiene vigencia de 1 hora.
            </Text>

            <View style={s.formGroup}>
              <Text style={s.label}>Correo</Text>
              <View style={s.inputWrapper}>
                <TextInput
                  style={s.input}
                  value={correo}
                  onChangeText={(t) => { setCorreo(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {correoValido && <Text style={s.checkIcon}>✓</Text>}
              </View>
            </View>

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.btnPrimary, (!correoValido || cargando) && s.btnDisabled]}
              onPress={handleEnviar}
              disabled={!correoValido || cargando}
            >
              {cargando
                ? <ActivityIndicator color={C.white} />
                : <Text style={s.btnPrimaryText}>Enviar enlace</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <View style={s.successBox}>
            <Feather name="mail" size={44} color={C.green} />
            <Text style={[s.successTitle, { marginTop: 16 }]}>Enlace enviado</Text>
            <Text style={s.successText}>
              Revisa tu correo{' '}
              <Text style={s.successEmail}>{correo}</Text>.{'\n'}
              El enlace expira en 1 hora.
            </Text>
            <TouchableOpacity
              style={s.resetLinkBtn}
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Text style={s.resetLinkText}>Ya tengo el token → Restablecer contraseña</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
