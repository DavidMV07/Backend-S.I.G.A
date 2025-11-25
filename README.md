npm start
# api-registro

Backend de `api-registro` (API REST con autenticación JWT) usado por la app S.I.G.A.

Este README contiene instrucciones para configurar, ejecutar y depurar el backend.

## Resumen
- Node.js (ES Modules) + Express
- MongoDB (Mongoose)
- Autenticación por JWT
- Roles: `admin`, `supervisor`, `profesor`, `alumno`

## Estructura relevante

```
api-registro/
├─ src/
│  ├─ controllers/
│  │  └─ authController.js
│  ├─ middlewares/
│  │  └─ authMiddleware.js
│  ├─ models/
│  │  └─ userModel.js
│  ├─ routes/
│  │  ├─ authRoutes.js
│  │  └─ adminUserRoutes.js
│  ├─ config/
│  │  └─ db.js
│  ├─ app.js
│  └─ scripts/
│     └─ createAdmin.js (opcional)
├─ package.json
└─ README.md
```

## Variables de entorno

En la raíz crea un archivo `.env` con:

```
MONGODB_URI=mongodb://localhost:27017/mi_basedatos
JWT_SECRET=una_clave_secreta_segura
PORT=5000
```

- `MONGODB_URI`: cadena de conexión a MongoDB.
- `JWT_SECRET`: secreto para firmar y verificar tokens JWT. Si no está definido, la verificación fallará y se devolverán 401/403.
- `PORT`: puerto opcional (por defecto 5000 si no se especifica).

## Instalar y ejecutar

```powershell
cd api-registro
npm install
npm run dev   # usa nodemon
# o
npm start     # iniciar en producción
```

## Endpoints

- `POST /api/auth/register` — Registrar usuario. Body: `{ email, password, role? }`.
- `POST /api/auth/login` — Login. Body: `{ email, password }`. Respuesta: `{ token, role, message }`.
- `GET /api/auth/me` — Obtener info del usuario; requiere `Authorization: Bearer <token>`.
- `GET /api/admin/users` — Listar usuarios (solo admin).
- `POST /api/admin/users` — Crear usuario (solo admin).
- `PUT /api/admin/users/:id` — Actualizar usuario (solo admin).
- `DELETE /api/admin/users/:id` — Eliminar usuario (solo admin).

Todas las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`.

## Problemas comunes y soluciones

- No puedes iniciar sesión / recibes 401 o 403:
  - Verifica que `JWT_SECRET` esté configurada en `.env` y el servidor fue reiniciado después de cambiarla.
  - Revisa los logs del servidor: si `jwt.verify` falla verás mensajes en consola.
  - Asegúrate de que el usuario existe en la colección `users` y que la contraseña es correcta.

- El endpoint `/api/admin/users` responde 403 aunque tengas token válido:
  - El token puede no contener `role: 'admin'`. Verifica `role` en tu documento `users` en MongoDB.

## Crear un usuario admin rápidamente

Hay dos maneras:

1) Editar directamente en MongoDB el campo `role` de un usuario y establecer `admin`.

2) Usar el script incluido (requiere que `.env` esté configurado):

```powershell
node src/scripts/createAdmin.js --email admin@example.com --password S3cret123
```

El script comprobará si el usuario existe y, si no, lo creará con `role: 'admin'`.

## Seguridad y producción

- No uses un `JWT_SECRET` débil en producción.
- Considera usar un flujo de `refresh tokens` para mejorar UX cuando los tokens expiran.

## Ayuda y debugging

- Revisa la consola donde corre el backend para ver errores.
- Si quieres, puedo añadir una pequeña ruta de desarrollo para crear admin (sólo para entornos locales) o exportar una colección Postman para probar.

----
Si quieres, genero el script `src/scripts/createAdmin.js` y las instrucciones para usarlo (lo puedo añadir en este repo ahora).