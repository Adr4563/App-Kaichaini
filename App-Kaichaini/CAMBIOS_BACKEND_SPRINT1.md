# Cambios en el Backend - Sprint 1

## Archivos modificados

---

### 1. `src/config/database.js`
**Motivo:** La base de datos en AWS RDS requiere conexión cifrada.

**Cambio:**
```js
// ANTES
port: process.env.DB_PORT || 5432,

// DESPUÉS
port: process.env.DB_PORT || 5432,
ssl: { rejectUnauthorized: false },
```

---

### 2. `src/middleware/roleMiddleware.js`
**Motivo:** El export incorrecto causaba error `requireRole is not a function` al iniciar el servidor.

**Cambio:**
```js
// ANTES
module.exports = {
  requireRole,
};

// DESPUÉS
module.exports = requireRole;
```

---

### 3. `src/services/respuestaService.js`
**Motivo:** JavaScript no soporta el keyword `private` — causaba error de sintaxis al cargar el módulo.

**Cambio:**
```js
// ANTES
private getRetroalimentacion(correctas, total) {

// DESPUÉS
getRetroalimentacion(correctas, total) {
```

---

### 4. `src/services/authService.js`
**Motivo:** El método `resetPassword` estaba sin implementar — lanzaba un error intencional pidiendo query paramétrica (H.U. 008).

**Cambio:** Se implementó completamente el flujo de reset:
- Busca al usuario (estudiante o docente) por token usando query paramétrica en BD
- Verifica que el token no haya expirado
- Hashea la nueva contraseña y la guarda
- Limpia el token una vez usado

```js
// ANTES
throw new Error('resetPassword: Método debe ser implementado con query paramétrica en BD');

// DESPUÉS
let usuario = await this.estudianteRepository.findByResetToken(token);
let isEstudiante = !!usuario;
if (!usuario) usuario = await this.docenteRepository.findByResetToken(token);
if (!usuario) throw new Error('Token inválido o expirado');
if (usuario.resetPasswordExpires && new Date(usuario.resetPasswordExpires) < new Date())
  throw new Error('El token ha expirado. Solicita uno nuevo');
const hashedPassword = await hashPassword(newPassword);
await repository.update(usuario.id, { contrasena: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null });
```

---

### 5. `src/repositories/estudianteRepository.js`
**Motivo:** `authService.js` necesita buscar un estudiante por su token de reset de contraseña.

**Cambio:** Se agregó el método `findByResetToken`:
```js
async findByResetToken(token) {
  const query = 'SELECT * FROM USUARIO WHERE "resetPasswordToken" = $1 AND rol = $2';
  const { rows } = await pool.query(query, [token, 'Estudiante']);
  return rows.length ? new Estudiante(rows[0]) : null;
}
```

---

### 6. `src/repositories/docenteRepository.js`
**Motivo:** Mismo caso que `estudianteRepository.js` pero para docentes.

**Cambio:** Se agregó el método `findByResetToken`:
```js
async findByResetToken(token) {
  const query = 'SELECT * FROM USUARIO WHERE "resetPasswordToken" = $1 AND rol = $2';
  const { rows } = await pool.query(query, [token, 'Docente']);
  return rows.length ? new Docente(rows[0]) : null;
}
```


