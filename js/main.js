document.addEventListener('DOMContentLoaded', function() {
  cargarBarraSesion();
  cargarDestacadosInicio();
  cargarCatalogoProductos();
  cargarDetalleProducto();
  iniciarFormularioRegistro();
  iniciarFormularioLogin();
  iniciarFormularioContacto();
  cargarNoticiasBlog();
});

// Mostrar nombre de usuario en la barra superior si inició sesión
function cargarBarraSesion() {
  const contenedorSesion = document.getElementById('user-session-links');
  if (!contenedorSesion) return;

  const usuario = obtenerSesionActual();
  if (usuario) {
    contenedorSesion.innerHTML = `
      <span>Hola, <strong>${usuario.tipoUsuario === 'Administrador' ? 'Admin' : usuario.nombre}</strong> (${usuario.tipoUsuario})</span>
      ${usuario.esAdmin() || usuario.esVendedor() ? 
        `<a href="${getRelativeRoot()}pages/admin/admin.html" style="color: #ffc107; font-weight: bold;">[Panel Admin]</a>` : ''}
      <button type="button" class="btn-cerrar-sesion" onclick="cerrarSesionUsuario()">Cerrar sesión</button>
    `;
  }
}

function cerrarSesionUsuario() {
  cerrarSesion();
  mostrarNotificacion('Has cerrado sesión.');
  setTimeout(function() {
    window.location.href = getRelativeRoot() + 'index.html';
  }, 400);
}

// Generar tarjeta HTML de un producto utilizando métodos de la clase Producto
function crearTarjetaHTML(producto) {
  const prod = producto instanceof Producto ? producto : new Producto(producto);
  const sinStock = !prod.hayStock(1);
  const esCritico = prod.esStockCritico();

  return `
    <div class="tarjeta-producto">
      <div class="tarjeta-img-wrap">
        <a href="${getRelativeRoot()}pages/detalle-producto.html?id=${prod.id}">
          <img src="${prod.imagen}" alt="${prod.nombre}">
        </a>
        ${esCritico ? `<span class="alerta-stock">Pocas unidades (${prod.stock})</span>` : ''}
        ${sinStock ? `<span class="alerta-stock" style="background-color: #4b5563;">Agotado</span>` : ''}
      </div>
      <div class="tarjeta-info">
        <span class="tarjeta-categoria">${prod.categoria}</span>
        <h3 class="tarjeta-titulo">
          <a href="${getRelativeRoot()}pages/detalle-producto.html?id=${prod.id}">${prod.nombre}</a>
        </h3>
        <p class="tarjeta-autor">${prod.marca}</p>
        <div class="tarjeta-pie">
          <span class="tarjeta-precio">${prod.formatearPrecio()}</span>
          <button type="button" class="btn btn-sm btn-primary" 
            onclick="agregarAlCarrito(${prod.id}, 1)" ${sinStock ? 'disabled' : ''}>
            ${sinStock ? 'Agotado' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Cargar productos destacados en la página de inicio (index.html)
function cargarDestacadosInicio() {
  const contenedor = document.getElementById('home-featured-products');
  if (!contenedor) return;

  const productos = obtenerProductos();
  const destacados = productos.filter(function(p) {
    return p.destacado === true;
  });

  let html = '';
  destacados.forEach(function(prod) {
    html += crearTarjetaHTML(prod);
  });
  contenedor.innerHTML = html;
}

// Cargar catálogo completo y filtros (productos.html)
let categoriaActual = 'all';
let textoBusqueda = '';

function cargarCatalogoProductos() {
  const contenedor = document.getElementById('catalog-products-list');
  if (!contenedor) return;

  let productos = obtenerProductos();

  // Filtro por categoría
  if (categoriaActual !== 'all') {
    productos = productos.filter(function(p) {
      return p.categoria.toLowerCase().includes(categoriaActual.toLowerCase());
    });
  }

  // Filtro por buscador de texto
  if (textoBusqueda !== '') {
    const q = textoBusqueda.toLowerCase();
    productos = productos.filter(function(p) {
      const marca = (p.marca || p.autor || '').toLowerCase();
      return p.nombre.toLowerCase().includes(q) || 
             marca.includes(q) ||
             p.codigo.toLowerCase().includes(q);
    });
  }

  if (productos.length === 0) {
    contenedor.innerHTML = '<p style="padding: 20px; color: #8e9bb3;">No se encontraron productos en esta categoría.</p>';
    return;
  }

  let html = '';
  productos.forEach(function(prod) {
    html += crearTarjetaHTML(prod);
  });
  contenedor.innerHTML = html;

  // Escuchador de botones de filtro
  const botonesFiltro = document.querySelectorAll('.category-filter-btn');
  botonesFiltro.forEach(function(btn) {
    btn.onclick = function() {
      botonesFiltro.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      categoriaActual = btn.getAttribute('data-category');
      cargarCatalogoProductos();
    };
  });

  // Escuchador del buscador
  const inputBuscar = document.getElementById('catalog-search-input');
  if (inputBuscar) {
    inputBuscar.oninput = function(e) {
      textoBusqueda = e.target.value.trim();
      cargarCatalogoProductos();
    };
  }
}

// Cargar detalle de un producto (detalle-producto.html)
function cargarDetalleProducto() {
  const contenedor = document.getElementById('product-detail-container');
  if (!contenedor) return;

  // Leemos el parámetro ?id=X de la URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 1;
  const producto = buscarProductoPorId(id);

  if (!producto) {
    contenedor.innerHTML = '<p style="padding: 20px; color: #8e9bb3;">El producto solicitado no existe.</p>';
    return;
  }

  const sinStock = producto.stock <= 0;

  // Generamos las opciones del select de cantidad (hasta 10 o el stock disponible)
  let opcionesCantidad = '';
  const maxOpciones = Math.min(producto.stock, 10);
  for (let i = 1; i <= maxOpciones; i++) {
    opcionesCantidad += `<option value="${i}">${i}</option>`;
  }

  contenedor.innerHTML = `
    <div class="breadcrumbs">
      <a href="${getRelativeRoot()}index.html">Inicio</a> &gt; 
      <a href="${getRelativeRoot()}pages/productos.html">Catálogo</a> &gt; 
      <span>${producto.nombre}</span>
    </div>

    <div class="detalle-layout">
      <div>
        <div class="detalle-foto-principal">
          <img id="foto-grande" src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="detalle-miniaturas">
          ${
            producto.imagenes && producto.imagenes.length > 1
              ? producto.imagenes.map(function(img, idx) {
                  return '<div class="miniatura ' + (idx === 0 ? 'activa' : '') + '" onclick="cambiarFoto(\'' + img + '\', this)">' +
                         '<img src="' + img + '" alt="' + producto.nombre + ' ángulo ' + (idx + 1) + '">' +
                         '</div>';
                }).join('')
              : ''
          }
        </div>
      </div>

      <div>
        <h1 class="detalle-nombre">${producto.nombre}</h1>
        <div class="detalle-precio">${formatearPrecio(producto.precio)}</div>

        <div class="detalle-datos">
          <p><strong>Marca:</strong> ${producto.marca || producto.autor || 'Level-Up'}</p>
          <p><strong>Código:</strong> ${producto.codigo}</p>
          <p><strong>Categoría:</strong> ${producto.categoria}</p>
          <p><strong>Garantía:</strong> ${producto.garantia || '6 meses'}</p>
          <p><strong>Stock disponible:</strong> ${producto.stock} unidades</p>
        </div>

        <div class="detalle-descripcion">
          <p>${producto.descripcion}</p>
        </div>

        <div class="detalle-accion">
          <label for="select-qty">Cantidad:</label>
          <select id="select-qty" class="select-cantidad" ${sinStock ? 'disabled' : ''}>
            ${opcionesCantidad}
          </select>

          <button type="button" class="btn btn-primary" 
            onclick="agregarDesdeDetalle(${producto.id})" ${sinStock ? 'disabled' : ''}>
            ${sinStock ? 'Sin stock' : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </div>
  `;

  // Cargar productos relacionados
  const contenedorRelacionados = document.getElementById('related-products-list');
  if (contenedorRelacionados) {
    const productos = obtenerProductos();
    const relacionados = productos.filter(function(p) { return p.id !== producto.id; }).slice(0, 4);
    let relHTML = '';
    relacionados.forEach(function(r) { relHTML += crearTarjetaHTML(r); });
    contenedorRelacionados.innerHTML = relHTML;
  }
}

function cambiarFoto(url, elemento) {
  document.getElementById('foto-grande').src = url;
  const miniaturas = document.querySelectorAll('.miniatura');
  miniaturas.forEach(function(m) { m.classList.remove('activa'); });
  elemento.classList.add('activa');
}

function agregarDesdeDetalle(idProducto) {
  const select = document.getElementById('select-qty');
  const cantidad = select ? parseInt(select.value, 10) : 1;
  agregarAlCarrito(idProducto, cantidad);
}

// Formulario de Registro con validaciones JavaScript (registro.html)
function iniciarFormularioRegistro() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  // Cargamos los selects de regiones y comunas
  cargarRegionesYComunas('select-region', 'select-comuna');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let esValido = true;

    const inputRun = document.getElementById('reg-run');
    const inputNombre = document.getElementById('reg-nombre');
    const inputApellidos = document.getElementById('reg-apellidos');
    const inputCorreo = document.getElementById('reg-correo');
    const inputPass = document.getElementById('reg-pass');
    const inputConfirmPass = document.getElementById('reg-confirm-pass');
    const inputFecha = document.getElementById('reg-fecha');
    const inputReferido = document.getElementById('reg-referido');
    const selectRegion = document.getElementById('select-region');
    const selectComuna = document.getElementById('select-comuna');
    const inputDireccion = document.getElementById('reg-direccion');

    // Validación de RUN (Módulo 11)
    const valRun = validarRUN(inputRun.value);
    if (!valRun.valido) {
      mostrarError(inputRun, valRun.mensaje);
      esValido = false;
    } else {
      limpiarError(inputRun);
    }

    // Validación Nombre
    if (inputNombre.value.trim().length < 2) {
      mostrarError(inputNombre, 'El nombre es obligatorio (mínimo 2 letras).');
      esValido = false;
    } else {
      limpiarError(inputNombre);
    }

    // Validación Apellidos
    if (inputApellidos.value.trim().length < 2) {
      mostrarError(inputApellidos, 'Los apellidos son obligatorios.');
      esValido = false;
    } else {
      limpiarError(inputApellidos);
    }

    // Validación Fecha de Nacimiento (Mayor de 18 años)
    if (inputFecha) {
      const valFecha = validarMayorDeEdad(inputFecha.value);
      if (!valFecha.valido) {
        mostrarError(inputFecha, valFecha.mensaje);
        esValido = false;
      } else {
        limpiarError(inputFecha);
      }
    }

    // Validación Correo (@duoc.cl, @profesor.duoc.cl, @gmail.com)
    const valCorreo = validarCorreo(inputCorreo.value);
    if (!valCorreo.valido) {
      mostrarError(inputCorreo, valCorreo.mensaje);
      esValido = false;
    } else {
      limpiarError(inputCorreo);
    }

    // Validación Contraseña (4 a 10 caracteres)
    const valPass = validarContrasena(inputPass.value);
    if (!valPass.valido) {
      mostrarError(inputPass, valPass.mensaje);
      esValido = false;
    } else {
      limpiarError(inputPass);
    }

    // Confirmar Contraseña
    if (inputConfirmPass.value !== inputPass.value) {
      mostrarError(inputConfirmPass, 'Las contraseñas no coinciden.');
      esValido = false;
    } else {
      limpiarError(inputConfirmPass);
    }

    // Región y Comuna
    if (!selectRegion.value) {
      mostrarError(selectRegion, 'Debe seleccionar una región.');
      esValido = false;
    } else {
      limpiarError(selectRegion);
    }

    if (!selectComuna.value) {
      mostrarError(selectComuna, 'Debe seleccionar una comuna.');
      esValido = false;
    } else {
      limpiarError(selectComuna);
    }

    // Dirección
    if (inputDireccion.value.trim().length < 5) {
      mostrarError(inputDireccion, 'Ingrese una dirección válida.');
      esValido = false;
    } else {
      limpiarError(inputDireccion);
    }

    // Guardar usuario en localStorage
    if (esValido) {
      const usuarios = obtenerUsuarios();
      const correoLimpio = inputCorreo.value.trim().toLowerCase();
      const esDuoc = correoLimpio.endsWith('@duoc.cl') || correoLimpio.endsWith('@profesor.duoc.cl');
      const codigoRef = inputReferido ? inputReferido.value.trim().toUpperCase() : '';

      const nuevoUsuario = new Usuario({
        id: usuarios.length + 1,
        run: inputRun.value.trim().toUpperCase(),
        nombre: inputNombre.value.trim(),
        apellidos: inputApellidos.value.trim(),
        fechaNacimiento: inputFecha ? inputFecha.value : '',
        correo: correoLimpio,
        password: inputPass.value,
        tipoUsuario: 'Cliente',
        region: selectRegion.value,
        comuna: selectComuna.value,
        direccion: inputDireccion.value.trim(),
        codigoReferido: codigoRef
      });

      usuarios.push(nuevoUsuario);
      guardarUsuarios(usuarios);
      guardarSesionActual(nuevoUsuario);

      if (nuevoUsuario.esComunidadDuoc()) {
        alert('¡Registro exitoso! Por ser miembro de Duoc UC se ha activado tu beneficio del 20% de descuento vitalicio en Level-Up Gamer.');
      } else {
        alert('¡Bienvenido/a a Level-Up Gamer! Tu cuenta ha sido creada exitosamente.');
      }

      window.location.href = getRelativeRoot() + 'index.html';
    }
  });
}

// Formulario de Inicio de Sesión (login.html)
function iniciarFormularioLogin() {
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let esValido = true;

    const inputCorreo = document.getElementById('login-correo');
    const inputPass = document.getElementById('login-pass');

    const valCorreo = validarCorreo(inputCorreo.value);
    if (!valCorreo.valido) {
      mostrarError(inputCorreo, valCorreo.mensaje);
      esValido = false;
    } else {
      limpiarError(inputCorreo);
    }

    const valPass = validarContrasena(inputPass.value);
    if (!valPass.valido) {
      mostrarError(inputPass, valPass.mensaje);
      esValido = false;
    } else {
      limpiarError(inputPass);
    }

    if (esValido) {
      const correo = inputCorreo.value.trim().toLowerCase();
      const pass = inputPass.value;

      const usuarios = obtenerUsuarios();
      const usuarioEncontrado = usuarios.find(function(u) {
        return u.correo.toLowerCase() === correo && u.password === pass;
      });

      if (!usuarioEncontrado) {
        mostrarError(inputPass, 'Correo o contraseña incorrectos.');
        return;
      }

      guardarSesionActual(usuarioEncontrado);
      alert(usuarioEncontrado.esAdmin() ? 'Bienvenido Administrador' : 'Bienvenido/a, ' + usuarioEncontrado.nombre);

      // Redirección según rol oficial mediante métodos P.O.O.
      if (usuarioEncontrado.esAdmin() || usuarioEncontrado.esVendedor()) {
        window.location.href = getRelativeRoot() + 'pages/admin/admin.html';
      } else {
        window.location.href = getRelativeRoot() + 'index.html';
      }
    }
  });
}

// Formulario de Contacto (contacto.html)
function iniciarFormularioContacto() {
  const form = document.getElementById('form-contacto');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let esValido = true;

    const inputNombre = document.getElementById('contacto-nombre');
    const inputCorreo = document.getElementById('contacto-correo');
    const inputMensaje = document.getElementById('contacto-mensaje');

    // Nombre (máx 100)
    if (inputNombre.value.trim().length < 2 || inputNombre.value.length > 100) {
      mostrarError(inputNombre, 'El nombre es obligatorio (hasta 100 caracteres).');
      esValido = false;
    } else {
      limpiarError(inputNombre);
    }

    // Correo
    const valCorreo = validarCorreo(inputCorreo.value);
    if (!valCorreo.valido) {
      mostrarError(inputCorreo, valCorreo.mensaje);
      esValido = false;
    } else {
      limpiarError(inputCorreo);
    }

    // Mensaje (máx 500)
    if (inputMensaje.value.trim().length < 5 || inputMensaje.value.length > 500) {
      mostrarError(inputMensaje, 'El mensaje es obligatorio (máximo 500 caracteres).');
      esValido = false;
    } else {
      limpiarError(inputMensaje);
    }

    if (esValido) {
      alert('¡Gracias por escribirnos! Tu mensaje ha sido enviado.');
      form.reset();
    }
  });
}

// Carga de Blogs (blog.html)
function cargarNoticiasBlog() {
  const contenedor = document.getElementById('blogs-list-container');
  if (!contenedor) return;

  // Si ya tiene artículos renderizados en el HTML estático, no sobreescribir para evitar saltos
  if (contenedor.children.length > 0) return;

  let html = '';
  INITIAL_BLOGS.forEach(function(b) {
    html += `
      <article class="tarjeta-producto" style="margin-bottom: 20px;">
        <div style="height: 200px; overflow: hidden;">
          <img src="${b.imagen}" alt="${b.titulo}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 15px;">
          <span style="font-size: 0.8rem; color: var(--primary); font-weight: bold;">${b.fecha}</span>
          <h2 style="font-size: 1.2rem; margin: 6px 0;">${b.titulo}</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">${b.resumen}</p>
          <a href="${getRelativeRoot()}pages/blog/blog-detalle-${b.id}.html" class="btn btn-sm btn-outline">Leer artículo</a>
        </div>
      </article>
    `;
  });
  contenedor.innerHTML = html;
}
