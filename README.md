# Level-Up Gamer - Evaluacion 1 (DSY1104)

Proyecto de tienda web para la asignatura Desarrollo Fullstack II (Duoc UC).
Corresponde a la **Forma B: Tienda LEVEL-UP GAMER**.

## Integrantes
- Maximiliano Dinamarca
- Patricio Muñoz

## Tecnologias utilizadas
- HTML5 (semantico)
- CSS3 (hojas de estilo externas)
- JavaScript (Vanilla, persistencia con LocalStorage)

## Como ejecutar el proyecto
1. Clonar el repositorio o descargar los archivos.
2. Iniciar el servidor local:
   ```bash
   node server.js
   ```
   Y abrir en el navegador `http://localhost:3000`.
3. Tambien se puede abrir directamente el archivo `index.html` con Live Server o doble clic.

## Cuentas de prueba para login
- **Administrador:** `admin@duoc.cl` / `Admin123!`
- **Vendedor:** `vendedor@profesor.duoc.cl` / `Vendedor123!`
- **Cliente:** `estudiante@duoc.cl` / `Cliente123!` (aplica 20% de descuento automatico en carrito)

## Cupones para el carrito
- `DUOC2026` (20% dcto)
- `LEVELUP20` (20% dcto)
- `GAMER10` (10% dcto)

## Funcionalidades principales
- Catalogo de productos con filtros por categoria y buscador en tiempo real.
- Ficha de detalle de producto con galeria de fotos.
- Carrito de compras con persistencia en LocalStorage y calculo de totales.
- Formulario de registro con validacion de RUN (Modulo 11), calculo de mayoria de edad (+18) y restriccion de correos.
- Panel de administracion con resumen de stock critico y control de permisos segun el rol del usuario.
- Formulario de contacto con enlace a WhatsApp y seccion Sobre Nosotros con video institucional.
