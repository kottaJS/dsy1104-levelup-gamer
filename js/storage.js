// Persistencia en LocalStorage


class GestorStorage {
  static CLAVE_PRODUCTOS = 'levelup_productos';
  static CLAVE_USUARIOS = 'levelup_usuarios';
  static CLAVE_CARRITO = 'levelup_carrito';
  static CLAVE_SESION = 'levelup_sesion';
  static CLAVE_CUPON = 'levelup_cupon';

  // Inicializar almacenamiento con datos oficiales si está vacío
  static inicializar() {
    const productosGuardados = localStorage.getItem(this.CLAVE_PRODUCTOS);
    if (!productosGuardados) {
      localStorage.setItem(this.CLAVE_PRODUCTOS, JSON.stringify(INITIAL_PRODUCTS));
    } else {
      // Si el navegador tiene cacheadas imágenes antiguas de Unsplash, actualizarlas a las rutas locales oficiales
      try {
        const lista = JSON.parse(productosGuardados);
        let modificado = false;
        lista.forEach(p => {
          const prodDefecto = INITIAL_PRODUCTS.find(ip => ip.codigo === p.codigo);
          if (prodDefecto) {
            if (!p.imagenes || JSON.stringify(p.imagenes) !== JSON.stringify(prodDefecto.imagenes)) {
              p.imagenes = prodDefecto.imagenes;
              modificado = true;
            }
            if (p.imagen && (p.imagen.includes('images.unsplash.com') || (p.imagen.endsWith('.jpg') && prodDefecto.imagen.endsWith('.webp')))) {
              p.imagen = prodDefecto.imagen;
              modificado = true;
            }
          }
        });
        if (modificado) {
          localStorage.setItem(this.CLAVE_PRODUCTOS, JSON.stringify(lista));
        }
      } catch (e) {
        localStorage.setItem(this.CLAVE_PRODUCTOS, JSON.stringify(INITIAL_PRODUCTS));
      }
    }
    const usuariosGuardados = localStorage.getItem(this.CLAVE_USUARIOS);
    if (!usuariosGuardados) {
      localStorage.setItem(this.CLAVE_USUARIOS, JSON.stringify(INITIAL_USERS));
    } else {
      try {
        const uLista = JSON.parse(usuariosGuardados);
        let uModificado = false;
        INITIAL_USERS.forEach(defU => {
          const idx = uLista.findIndex(u => u.correo.toLowerCase() === defU.correo.toLowerCase());
          if (idx === -1) {
            uLista.push(defU);
            uModificado = true;
          } else {
            if (uLista[idx].password !== defU.password || uLista[idx].nombre !== defU.nombre) {
              uLista[idx].password = defU.password;
              uLista[idx].nombre = defU.nombre;
              uLista[idx].apellidos = defU.apellidos;
              uModificado = true;
            }
          }
        });
        if (uModificado) {
          localStorage.setItem(this.CLAVE_USUARIOS, JSON.stringify(uLista));
        }
      } catch (e) {
        localStorage.setItem(this.CLAVE_USUARIOS, JSON.stringify(INITIAL_USERS));
      }
    }
    if (!localStorage.getItem(this.CLAVE_CARRITO)) {
      localStorage.setItem(this.CLAVE_CARRITO, JSON.stringify([]));
    }
  }

  // --- PRODUCTOS ---
  static obtenerProductos() {
    const datos = localStorage.getItem(this.CLAVE_PRODUCTOS);
    const lista = datos ? JSON.parse(datos) : [];
    // Deserializar a instancias de la clase Producto
    return lista.map(p => new Producto(p));
  }

  static guardarProductos(productos) {
    localStorage.setItem(this.CLAVE_PRODUCTOS, JSON.stringify(productos));
  }

  static buscarProductoPorId(id) {
    const productos = this.obtenerProductos();
    return productos.find(p => p.id === Number(id)) || null;
  }

  // --- USUARIOS ---
  static obtenerUsuarios() {
    const datos = localStorage.getItem(this.CLAVE_USUARIOS);
    const lista = datos ? JSON.parse(datos) : [];
    // Deserializar a instancias de la clase Usuario
    return lista.map(u => new Usuario(u));
  }

  static guardarUsuarios(usuarios) {
    localStorage.setItem(this.CLAVE_USUARIOS, JSON.stringify(usuarios));
  }

  // --- SESIÓN ACTUAL ---
  static obtenerSesionActual() {
    const datos = localStorage.getItem(this.CLAVE_SESION);
    return datos ? new Usuario(JSON.parse(datos)) : null;
  }

  static guardarSesionActual(usuario) {
    if (usuario) {
      localStorage.setItem(this.CLAVE_SESION, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(this.CLAVE_SESION);
    }
  }

  static cerrarSesion() {
    localStorage.removeItem(this.CLAVE_SESION);
  }

  // --- CARRITO Y CUPONES ---
  static obtenerCarrito() {
    const datos = localStorage.getItem(this.CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : [];
  }

  static guardarCarrito(carrito) {
    localStorage.setItem(this.CLAVE_CARRITO, JSON.stringify(carrito));
    if (typeof actualizarContadorCarrito === 'function') {
      actualizarContadorCarrito();
    }
  }

  static limpiarCarrito() {
    localStorage.setItem(this.CLAVE_CARRITO, JSON.stringify([]));
    localStorage.removeItem(this.CLAVE_CUPON);
    if (typeof actualizarContadorCarrito === 'function') {
      actualizarContadorCarrito();
    }
  }

  static obtenerCupon() {
    const cupon = localStorage.getItem(this.CLAVE_CUPON);
    return cupon ? JSON.parse(cupon) : null;
  }

  static guardarCupon(cupon) {
    if (cupon) {
      localStorage.setItem(this.CLAVE_CUPON, JSON.stringify(cupon));
    } else {
      localStorage.removeItem(this.CLAVE_CUPON);
    }
  }
}

// Ejecutar inicialización de almacenamiento
GestorStorage.inicializar();

// Persistencia en LocalStorage
function inicializarLocalStorage() { GestorStorage.inicializar(); }
function obtenerProductos() { return GestorStorage.obtenerProductos(); }
function guardarProductos(lista) { GestorStorage.guardarProductos(lista); }
function buscarProductoPorId(id) { return GestorStorage.buscarProductoPorId(id); }
function obtenerUsuarios() { return GestorStorage.obtenerUsuarios(); }
function guardarUsuarios(lista) { GestorStorage.guardarUsuarios(lista); }
function obtenerSesionActual() { return GestorStorage.obtenerSesionActual(); }
function guardarSesionActual(usuario) { GestorStorage.guardarSesionActual(usuario); }
function cerrarSesion() { GestorStorage.cerrarSesion(); }
function obtenerCarrito() { return GestorStorage.obtenerCarrito(); }
function guardarCarrito(carrito) { GestorStorage.guardarCarrito(carrito); }
function limpiarCarrito() { GestorStorage.limpiarCarrito(); }
function obtenerCupon() { return GestorStorage.obtenerCupon(); }
function guardarCupon(cupon) { GestorStorage.guardarCupon(cupon); }

if (typeof window !== 'undefined') {
  window.GestorStorage = GestorStorage;
  window.obtenerProductos = obtenerProductos;
  window.guardarProductos = guardarProductos;
  window.buscarProductoPorId = buscarProductoPorId;
  window.obtenerUsuarios = obtenerUsuarios;
  window.guardarUsuarios = guardarUsuarios;
  window.obtenerSesionActual = obtenerSesionActual;
  window.guardarSesionActual = guardarSesionActual;
  window.cerrarSesion = cerrarSesion;
  window.obtenerCarrito = obtenerCarrito;
  window.guardarCarrito = guardarCarrito;
  window.limpiarCarrito = limpiarCarrito;
  window.obtenerCupon = obtenerCupon;
  window.guardarCupon = guardarCupon;
}
if (typeof global !== 'undefined') {
  global.GestorStorage = GestorStorage;
  global.obtenerProductos = obtenerProductos;
  global.guardarProductos = guardarProductos;
  global.buscarProductoPorId = buscarProductoPorId;
  global.obtenerUsuarios = obtenerUsuarios;
  global.guardarUsuarios = guardarUsuarios;
  global.obtenerSesionActual = obtenerSesionActual;
  global.guardarSesionActual = guardarSesionActual;
  global.cerrarSesion = cerrarSesion;
  global.obtenerCarrito = obtenerCarrito;
  global.guardarCarrito = guardarCarrito;
  global.limpiarCarrito = limpiarCarrito;
  global.obtenerCupon = obtenerCupon;
  global.guardarCupon = guardarCupon;
}

