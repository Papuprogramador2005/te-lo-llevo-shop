# Configuración inicial de MongoDB

La aplicación ya cuenta con una API de Node.js en la carpeta `server/`. La página React todavía utiliza Supabase; el siguiente paso será reemplazar esas llamadas por esta API, una sección por vez.

## 1. Configura Atlas

En MongoDB Atlas:

1. Ve a **Security > Database Access** y crea un usuario exclusivo para la aplicación. Dale el permiso `readWrite` solo para la base `te_lo_llevo`; no uses tu cuenta personal de Atlas en el código.
2. Ve a **Security > Network Access** y agrega tu IP actual para desarrollo. Cuando publiques el backend, sustituye esta regla por la IP del servidor. No dejes `0.0.0.0/0` en producción.
3. En **Database > Connect > Drivers**, copia la cadena de conexión de Node.js.

## 2. Crea el archivo secreto

En la raíz del proyecto, copia `.env.example` y renómbralo a `.env`.

Completa estos valores:

```env
MONGODB_URI=tu-cadena-de-atlas-aqui
MONGODB_DB_NAME=te_lo_llevo
JWT_SECRET=una-clave-larga-aleatoria
CLIENT_ORIGINS=http://localhost:8080
PORT=4000
```

Para generar `JWT_SECRET` en PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

No subas `.env` a GitHub ni envíes su contenido por chat.

## 3. Inicia la API y crea tu administrador

En una terminal de Visual Studio Code:

```powershell
npm run server
```

En una segunda terminal:

```powershell
npm run create-admin -- tu-correo@ejemplo.com "Tu nombre"
```

El comando te pedirá la contraseña; usa 12 caracteres o más. No la escribas como parte del comando.

Si todo está correcto, Atlas mostrará la base `te_lo_llevo` y la colección `users` después de crear el administrador.

## Colecciones previstas

- `users`: clientes, administradores, empleados e inventario.
- `products`: precios, imágenes, stock y categorías. Solo el administrador puede cambiar precios o imágenes; inventario puede actualizar el stock.
- `orders`: pedidos, estados y empleado asignado.

La API calcula el total del pedido usando los precios guardados en MongoDB, no datos enviados por el navegador. Así un cliente no puede alterar el total desde la consola.
