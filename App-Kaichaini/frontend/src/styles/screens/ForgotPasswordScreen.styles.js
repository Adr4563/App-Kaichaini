import { StyleSheet } from 'react-native';

export const C = {
  green:      '#1d6a40',
  textDark:   '#111111',
  textGray:   '#666666',
  border:     '#333333',
  white:      '#ffffff',
  error:      '#cc0000',
  reqSuccess: '#2e7d32',
  reqError:   '#9c3333',
};

export const s = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: C.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },
  content:     { padding: 24, paddingBottom: 40 },

  description: { fontSize: 14, color: C.textGray, lineHeight: 22, marginBottom: 28 },

  formGroup:    { marginBottom: 20 },
  label:        { fontSize: 13, color: C.textGray, marginBottom: 6 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    color: C.textDark,
  },
  checkIcon: { position: 'absolute', right: 16, fontSize: 14, color: '#bbb' },

  reqBox:        { backgroundColor: '#f3f3f3', borderRadius: 10, padding: 12, marginBottom: 20 },
  reqRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reqRowLast:    { marginBottom: 0 },
  reqCircle:     { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reqCircleOk:   { backgroundColor: C.reqSuccess },
  reqCircleFail: { backgroundColor: C.reqError },
  reqCircleText: { color: C.white, fontSize: 9, fontWeight: '700' },
  reqLabel:      { fontSize: 13, color: C.textGray },

  errorText: { fontSize: 13, color: C.error, marginBottom: 10 },

  btnPrimary:     { backgroundColor: C.green, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 15 },
  btnDisabled:    { opacity: 0.5 },
  btnPrimaryText: { color: C.white, fontSize: 16, fontWeight: '600' },

  successBox:   { alignItems: 'center', paddingTop: 40 },
  successTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 12 },
  successText:  { fontSize: 14, color: C.textGray, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  successEmail: { fontWeight: '700', color: C.textDark },
  resetLinkBtn: { marginTop: 8 },
  resetLinkText:{ fontSize: 13, color: '#5b7484', textDecorationLine: 'underline', textAlign: 'center' },
});
