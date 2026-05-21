import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { s, C } from '../../styles/screens/ForgotPasswordScreen.styles';

const checkPolicy = (p) => ({
  length:    p.length >= 8,
  uppercase: /[A-Z]/.test(p),
  number:    /[0-9]/.test(p),
});

export default function ResetPasswordScreen({ navigation }) {
  const [token,       setToken]       = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [cargando,    setCargando]    = useState(false);
  const [error,       setError]       = useState('');
  const [exito,       setExito]       = useState(false);

  const policy   = checkPolicy(newPass);
  const policyOk = policy.length && policy.uppercase && policy.number;
  const match    = newPass === confirmPass && newPass.length > 0;

  const handleReset = async () => {
    if (!token.trim()) { setError('Ingresa el token de recuperación'); return; }
    if (!policyOk)     { setError('La contraseña no cumple los requisitos'); return; }
    if (!match)        { setError('Las contraseñas no coinciden'); return; }

    setCargando(true);
    setError('');
    try {
      await api.post('/auth/reset-password', {
        token:           token.trim(),
        newPassword:     newPass,
        confirmPassword: confirmPass,
      });
      setExito(true);
    } catch (e) {
      const msg = e.response?.data?.error?.message || 'Error al restablecer la contraseña';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <View style={{ flex: 1, backgroundColor: C.white, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Feather name="check-circle" size={60} color={C.green} />
        <Text style={{ fontSize: 20, fontWeight: '800', color: C.textDark, marginTop: 20, marginBottom: 8 }}>
          Contraseña actualizada
        </Text>
        <Text style={{ fontSize: 14, color: C.textGray, textAlign: 'center', lineHeight: 20, marginBottom: 32 }}>
          Tu contraseña fue restablecida. El enlace de recuperación ha sido invalidado.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#1c1c1e', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 }}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: C.white, fontSize: 15, fontWeight: '600' }}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nueva contraseña</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <View style={s.formGroup}>
          <Text style={s.label}>Token de recuperación</Text>
          <TextInput
            style={s.input}
            value={token}
            onChangeText={(t) => { setToken(t); setError(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Pega aquí el token recibido"
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={[s.formGroup, { marginBottom: newPass.length > 0 ? 5 : 20 }]}>
          <Text style={s.label}>Nueva contraseña</Text>
          <TextInput
            style={s.input}
            value={newPass}
            onChangeText={setNewPass}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {newPass.length > 0 && (
          <View style={[s.reqBox, { marginBottom: 20 }]}>
            {[
              { ok: policy.length,    label: '8 caracteres mínimo' },
              { ok: policy.uppercase, label: '1 mayúscula' },
              { ok: policy.number,    label: '1 número' },
            ].map(({ ok, label }, i, arr) => (
              <View key={label} style={[s.reqRow, i === arr.length - 1 && s.reqRowLast]}>
                <View style={[s.reqCircle, ok ? s.reqCircleOk : s.reqCircleFail]}>
                  <Text style={s.reqCircleText}>{ok ? '✓' : '✕'}</Text>
                </View>
                <Text style={s.reqLabel}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.formGroup}>
          <Text style={s.label}>Confirmar contraseña</Text>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
              autoCapitalize="none"
            />
            {match && <Text style={s.checkIcon}>✓</Text>}
          </View>
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[s.btnPrimary, cargando && s.btnDisabled]}
          onPress={handleReset}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color={C.white} />
            : <Text style={s.btnPrimaryText}>Restablecer contraseña</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
