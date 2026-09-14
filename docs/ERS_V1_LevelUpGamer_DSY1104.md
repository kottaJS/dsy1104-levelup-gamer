# DOCUMENTO DE ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (ERS)
## Versión 1.0 — Evaluación Parcial 1 (Forma B)

**Asignatura:** DSY1104 — Desarrollo Fullstack II  
**Institución:** Duoc UC — Escuela de Informática y Telecomunicaciones  
**Proyecto Asignado:** LEVEL-UP GAMER (Forma B)  
**Integrantes:** Maximiliano Dinamarca · Patricio Muñoz  
**Semestre:** Primavera 2026  
**Fecha de Evaluación:** Septiembre 2026  

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
El presente documento de Especificación de Requisitos de Software (ERS) define de manera rigurosa y sistemática los requerimientos funcionales, no funcionales, reglas de negocio institucionales y arquitectura técnica correspondiente a la **Evaluación Parcial 1 (Forma B: Tienda LEVEL-UP GAMER)** de la asignatura DSY1104.

### 1.2 Alcance del Sistema
**LEVEL-UP GAMER** es una plataforma web de comercio electrónico especializada en hardware gamer de alto rendimiento, consolas de última generación, periféricos de precisión, juegos de mesa estratégicos, indumentaria personalizada y servicio técnico especializado para la comunidad gamer en Chile.

En esta primera versión (Front-End desacoplado):
* **Tienda Pública:** Catálogo interactivo con filtrado en tiempo real, ficha técnica detallada con selector de imágenes, carrito de compras persistente con cálculo dinámico, blog de noticias del ecosistema gamer, sección Nosotros con Misión/Visión y video institucional, y formulario de contacto con soporte directo vía WhatsApp.
* **Panel de Administración y Mantenedores:** Dashboard con métricas de inventario y stock crítico, CRUD de productos con categorías oficiales de Forma B, y gestión de usuarios con control de roles (Administrador, Vendedor y Cliente).
* **Reglas de Negocio Específicas Forma B:**
  1. Validación obligatoria de mayoría de edad (mínimo 18 años cumplidos al momento del registro) mediante cálculo sobre la fecha de nacimiento.
  2. Descuento institucional permanente y automático del 20% en el carrito de compras para usuarios con cuenta `@duoc.cl` o `@profesor.duoc.cl`.
  3. Catálogo base oficial con los 10 productos canónicos exigidos por la pauta más el servicio técnico gratuito ($0 FREE).
* **Persistencia en Cliente:** Manejo del ciclo de vida del estado mediante `localStorage` bajo esquema JSON.

---

## 2. DESCRIPCIÓN GENERAL Y ROLES

### 2.1 Identidad Visual y Experiencia de Usuario (UI/UX)
* **Paleta de Colores:** Fondo Negro Espacial (`#0a0c14` / `#000000`), Azul Eléctrico (`#1E90FF`) y Verde Neón (`#39FF14`) para detalles y confirmaciones.
* **Tipografías Oficiales:**
  * Titulares, logotipos y precios destacados: **Orbitron** (Google Fonts).
  * Textos de lectura, formularios y tablas de datos: **Roboto** (Google Fonts).
* **Diseño Responsivo:** Compatibilidad multiplataforma garantizada para resoluciones de escritorio, tablets y dispositivos móviles mediante Media Queries estándar.

### 2.2 Roles de Acceso
1. **Cliente:** Navega por el catálogo, filtra por categorías, agrega ítems al carrito, accede a su descuento institucional Duoc del 20% e interactúa con el blog y soporte.
2. **Vendedor:** Acceso exclusivo a la lectura del inventario y estado de existencias en el panel de administración. Se restringen de forma automática las opciones de creación de productos, eliminación y gestión de usuarios.
3. **Administrador:** Privilegios globales sobre el sistema: administración de productos (alta, baja, modificación), monitoreo de stock crítico y gestión integral de cuentas de usuario y asignación de roles.

---

## 3. ESPECIFICACIÓN DE REQUISITOS DEL SOFTWARE

### 3.1 Requisitos Funcionales (RF)

#### Tienda Pública y Catálogo
* **RF-01 (Navegación Coherente):** Menú de cabecera con enlaces a Inicio, Productos, Nosotros, Blog, Contacto, Carrito y Acceso / Perfil.
* **RF-02 (Catálogo Dinámico):** Renderizado dinámico de los productos desde `localStorage`, con barra de búsqueda por texto y filtros por categorías (`Juegos de Mesa`, `Accesorios`, `Consolas`, `Computadores Gamers`, `Sillas Gamers`, `Mouse`, `Mousepad`, `Poleras Personalizadas`, `Polerones Gamers Personalizados`, `Servicio Técnico`).
* **RF-03 (Ficha de Producto):** Vista de detalle que muestra código de producto, marca/fabricante, especificaciones técnicas, precio formateado en CLP, stock disponible, indicador de stock crítico y galería de fotos interactiva.
* **RF-04 (Carrito de Compras Persistente):** Gestión de items (agregar, aumentar, disminuir y remover) con persistencia local mediante la clave `levelup_carrito`.
* **RF-05 (Descuento Institucional Duoc 20%):** Detección automática del correo del usuario activo; si pertenece a `@duoc.cl` o `@profesor.duoc.cl`, se aplica automáticamente un 20% de descuento sobre el total de la compra.
* **RF-06 (Cupones y Promociones):** Admisión de cupones promocionales adicionales (`LEVELUP20`, `GAMER10`, `DUOC2026`).
* **RF-07 (Sección Nosotros):** Exposición de la Misión y Visión corporativa oficial de Level-Up Gamer e integración de un video institucional de hardware.
* **RF-08 (Contacto y Asistencia WhatsApp):** Formulario de contacto con validación de campos y enlace de derivación directa a soporte técnico por WhatsApp.
* **RF-09 (Blog Gamer):** Listado de artículos de noticias gaming con vistas de lectura detallada.

#### Validaciones de Formularios JavaScript (Reglas de Negocio)
* **RF-10 (Validación de RUN Chileno):** Validación de RUN sin puntos ni guion mediante el algoritmo de dígito verificador **Módulo 11**.
* **RF-11 (Validación Mayor de Edad +18):** En el formulario de registro, el usuario debe tener al menos 18 años calculados a la fecha actual para poder registrarse con éxito.
* **RF-12 (Restricción de Dominios de Correo):** Se admiten únicamente correos pertenecientes a `@duoc.cl`, `@profesor.duoc.cl` o `@gmail.com`.
* **RF-13 (Selector en Cascada Regiones y Comunas):** Carga dinámica de las 16 regiones oficiales de Chile y filtrado dependiente de sus respectivas comunas.
* **RF-14 (Seguridad de Contraseña):** Validación de contraseña entre 4 y 10 caracteres alfanuméricos con coincidencia de confirmación.

#### Panel Administrativo y Control de Roles
* **RF-15 (Dashboard con Métricas):** Visualización en vivo de productos totales, cantidad de productos en stock crítico, total de usuarios y artículos en carritos activos.
* **RF-16 (Mantenedor CRUD de Productos):** Formulario para crear y editar productos con código, marca, categoría, precio, stock actual y stock crítico.
* **RF-17 (Alerta Visual de Stock Crítico):** Si el stock de un producto es menor o igual al valor de `stockCritico`, se resalta la fila en rojo y se despliega la insignia `¡Crítico!`.
* **RF-18 (Mantenedor CRUD de Usuarios):** Formulario administrativo para alta, edición y baja de usuarios, con asignación del rol (`Administrador`, `Vendedor`, `Cliente`).
* **RF-19 (Control de Permisos Vendedor vs Administrador):** Ocultación dinámica en la interfaz de elementos de borrado y menús de usuarios para sesiones con rol *Vendedor*.

---

## 4. CATÁLOGO BASE OFICIAL (FORMA B)

| Código | Nombre del Producto | Categoría | Precio CLP | Stock Base | Stock Crítico | Marca |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **JM001** | Catan | Juegos de Mesa | $29.990 | 18 | 4 | Devir |
| **JM002** | Carcassonne | Juegos de Mesa | $24.990 | 12 | 3 | Devir |
| **AC001** | Controlador Inalámbrico Xbox Series X | Accesorios | $59.990 | 22 | 5 | Microsoft |
| **AC002** | Auriculares Gamer HyperX Cloud II | Accesorios | $79.990 | 3 | 5 *(Crítico)* | HyperX |
| **CO001** | PlayStation 5 | Consolas | $549.990 | 9 | 3 | Sony |
| **CG001** | PC Gamer ASUS ROG Strix | Computadores Gamers | $1.299.990 | 5 | 2 | ASUS |
| **SG001** | Silla Gamer Secretlab Titan | Sillas Gamers | $349.990 | 7 | 2 | Secretlab |
| **MS001** | Mouse Gamer Logitech G502 HERO | Mouse | $49.990 | 4 | 5 *(Crítico)* | Logitech |
| **MP001** | Mousepad Razer Goliathus Extended | Mousepad | $29.990 | 25 | 5 | Razer |
| **PP001** | Polera Gamer Personalizada 'Level-Up' | Poleras Personalizadas | $14.990 | 50 | 10 | Level-Up Apparel |
| **ST001** | Diagnóstico y Mantenimiento Hardware | Servicio Técnico | $0 *(FREE)* | 100 | 10 | Level-Up Tech |

---

## 5. ESTRUCTURA DE ARCHIVOS Y ORGANIZACIÓN DEL PROYECTO

```
pryfs2/
├── index.html                   # Vista de Inicio / Home de la Tienda
├── README.md                    # Documentación general y puesta en marcha
├── server.js                    # Servidor local Node.js (puerto 3000)
├── css/
│   ├── style.css                # Estilos globales de la tienda (Orbitron/Roboto, Dark Neon)
│   └── admin.css                # Estilos del panel de administración y mantenedores
├── js/
│   ├── data.js                  # Catálogo oficial Forma B, usuarios demo y regiones
│   ├── storage.js               # Capa de persistencia LocalStorage (levelup_*)
│   ├── validations.js           # Validación Módulo 11, Mayor de 18 años y correos Duoc
│   ├── cart.js                  # Lógica del carrito, persistencia y 20% descuento Duoc
│   ├── main.js                  # Controladores de vistas públicas, catálogo y filtros
│   └── admin.js                 # Controladores del panel admin, CRUD y roles
├── pages/
│   ├── productos.html           # Catálogo con búsqueda y filtros por categoría
│   ├── detalle-producto.html    # Ficha de producto con selector de imágenes
│   ├── carrito.html             # Resumen de compra y desglose con descuento Duoc
│   ├── nosotros.html            # Misión, Visión oficial y video institucional
│   ├── contacto.html            # Formulario de contacto y botón de WhatsApp
│   ├── login.html               # Inicio de sesión y conmutación de cuentas
│   ├── registro.html            # Formulario de registro con validación +18 años
│   ├── blog/
│   │   ├── blog.html            # Listado de noticias del ecosistema gamer
│   │   ├── blog-detalle-1.html  # Artículo: Tendencias de Hardware 2026
│   │   └── blog-detalle-2.html  # Artículo: Guía de periféricos competitivos
│   └── admin/
│       ├── admin.html           # Dashboard administrativo y métricas
│       ├── admin-productos.html # Listado de inventario con alerta de stock crítico
│       ├── admin-producto-form.html # Formulario de alta/edición de productos
│       ├── admin-usuarios.html  # Listado de cuentas y roles de usuario
│       └── admin-usuario-form.html  # Formulario de creación/edición de usuarios
└── docs/
    ├── ERS_V1_LevelUpGamer_DSY1104.md  # Especificación de Requisitos oficial
    ├── GUIA_VIDEO_Y_COMMITS.md         # Pauta para video y registro de commits
    ├── PREPARACION_INTERROGACION.md    # Guía técnica para interrogación docente
    └── pautas_duoc/                    # Pautas y rúbricas oficiales Duoc UC
```

---

## 6. CUENTAS DE DEMOSTRACIÓN PRECONFIGURADAS

| Rol | Correo Electrónico | Contraseña | RUN (RUT) | Acceso Permitido |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@duoc.cl` | `Admin123!` | `19011022K` | Acceso global a todas las vistas y mantenedores |
| **Vendedor** | `vendedor@profesor.duoc.cl` | `Vendedor123!` | `184523310` | Vista de inventario y stock; edición y usuarios restringidos |
| **Cliente** | `estudiante@duoc.cl` | `Cliente123!` | `201234565` | Tienda pública, 20% descuento automático Duoc en carrito |
