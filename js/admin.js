document.addEventListener('DOMContentLoaded', function() {
  verificarAccesoAdmin();
  cargarTablaProductos();
  iniciarFormularioProducto();
  cargarTablaUsuarios();
  iniciarFormularioUsuario();
});

// Administrador: Acceso total
// Vendedor: Solo puede ver lista de productos y detalle; no puede crear ni ver usuarios
function verificarAccesoAdmin() {
  let usuario = obtenerSesionActual();

  // Si no hay usuario logueado, asignamos el administrador por defecto
  if (!usuario) {
    const adminPorDefecto = obtenerUsuarios().find(function(u) {
      return u.tipoUsuario === 'Administrador';
    });
    if (adminPorDefecto) {
      guardarSesionActual(adminPorDefecto);
      usuario = adminPorDefecto;
    }
  }

  // Renderizamos el saludo en la barra superior
  const displayUsuario = document.getElementById('admin-user-display');
  if (displayUsuario && usuario) {
    displayUsuario.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>Usuario: <strong>${usuario.tipoUsuario === 'Administrador' ? 'Admin' : usuario.nombre}</strong></span>
        <span class="badge-${usuario.tipoUsuario.toLowerCase()}">${usuario.tipoUsuario}</span>

        <select onchange="cambiarRolPrueba(this.value)" style="padding: 4px; font-size: 0.8rem;">
          <option value="Administrador" ${usuario.tipoUsuario === 'Administrador' ? 'selected' : ''}>Rol: Administrador</option>
          <option value="Vendedor" ${usuario.tipoUsuario === 'Vendedor' ? 'selected' : ''}>Rol: Vendedor</option>
        </select>

        <a href="../../index.html" class="btn btn-sm btn-secondary" target="_blank">Ver Tienda</a>
        <a href="../login.html" class="btn btn-sm btn-outline" onclick="cerrarSesion()">Salir</a>
      </div>
    `;
  }

  // Aplicamos restricciones según el rol: VENDEDOR
  if (usuario && usuario.tipoUsuario === 'Vendedor') {
    // Ocultamos los links de usuarios del menú
    const enlacesUsuarios = document.querySelectorAll('.nav-link-users');
    enlacesUsuarios.forEach(function(el) {
      el.style.display = 'none';
    });

    // Ocultamos botones de crear nuevo producto y eliminar
    const botonesCrear = document.querySelectorAll('.btn-admin-create, .btn-admin-delete');
    botonesCrear.forEach(function(btn) {
      btn.style.display = 'none';
    });

    // Si intenta entrar directamente a la URL de usuarios, lo redirigimos
    if (window.location.pathname.includes('admin-usuario')) {
      alert('Acceso denegado: El rol Vendedor no tiene permisos para gestionar usuarios.');
      window.location.href = 'admin-productos.html';
    }
  }
}

function cambiarRolPrueba(nuevoRol) {
  const usuario = obtenerUsuarios().find(function(u) {
    return u.tipoUsuario === nuevoRol;
  });
  if (usuario) {
    guardarSesionActual(usuario);
    window.location.reload();
  }
}

function cargarTablaProductos() {
  const tablaBody = document.getElementById('table-products-body');
  if (!tablaBody) return;

  const productos = obtenerProductos();
  const usuario = obtenerSesionActual();
  const esVendedor = usuario && usuario.esVendedor();

  if (productos.length === 0) {
    tablaBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay productos registrados.</td></tr>';
    return;
  }

  let html = '';
  productos.forEach(function(p) {
    const prod = p instanceof Producto ? p : new Producto(p);
    const esCritico = prod.esStockCritico();
    const claseFila = esCritico ? 'fila-stock-critico' : '';

    html += `
      <tr class="${claseFila}">
        <td><code>${prod.codigo}</code></td>
        <td><img src="${prod.imagen}" alt="${prod.nombre}" class="img-miniatura-tabla"></td>
        <td>
          <strong>${prod.nombre}</strong><br>
          <small style="color: #8e9bb3;">${prod.marca}</small>
        </td>
        <td>${prod.categoria}</td>
        <td>${prod.formatearPrecio()}</td>
        <td><strong>${prod.stock} un.</strong></td>
        <td>
          ${esCritico ? `<span class="badge-critico">Stock Crítico (${prod.stockCritico})</span>` : (prod.stockCritico || 'N/A')}
        </td>
        <td>
          <a href="../detalle-producto.html?id=${prod.id}" target="_blank" class="btn btn-sm btn-outline">Ver</a>
          ${!esVendedor ? `
            <a href="admin-producto-form.html?id=${prod.id}" class="btn btn-sm btn-secondary" style="margin: 0 4px;">Editar</a>
            <button type="button" class="btn btn-sm btn-outline" onclick="eliminarProducto(${prod.id})" style="color: #ef4444;">Eliminar</button>
          ` : ''}
        </td>
      </tr>
    `;
  });

  tablaBody.innerHTML = html;
}

function eliminarProducto(id) {
  if (confirm('¿Seguro que deseas eliminar este producto?')) {
    let productos = obtenerProductos();
    productos = productos.filter(function(p) { return p.id !== Number(id); });
    guardarProductos(productos);
    cargarTablaProductos();
    mostrarNotificacion('Producto eliminado.');
  }
}

// Formulario Nuevo / Editar Producto (admin-producto-form.html)
function iniciarFormularioProducto() {
  const form = document.getElementById('form-producto-admin');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const idProducto = params.get('id');

  // Si viene con ID, estamos EDITANDO
  if (idProducto) {
    const prod = buscarProductoPorId(idProducto);
    if (prod) {
      document.getElementById('form-title').textContent = 'Editar Producto: ' + prod.nombre;
      document.getElementById('prod-codigo').value = prod.codigo;
      document.getElementById('prod-nombre').value = prod.nombre;
      const elMarca = document.getElementById('prod-marca') || document.getElementById('prod-autor');
      if (elMarca) elMarca.value = prod.marca || prod.autor || '';
      document.getElementById('prod-categoria').value = prod.categoria;
      document.getElementById('prod-precio').value = prod.precio;
      document.getElementById('prod-stock').value = prod.stock;
      document.getElementById('prod-stock-critico').value = prod.stockCritico || '';
      document.getElementById('prod-descripcion').value = prod.descripcion || '';
      document.getElementById('prod-imagen').value = prod.imagen || '';
    }
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let esValido = true;

    const inputCodigo = document.getElementById('prod-codigo');
    const inputNombre = document.getElementById('prod-nombre');
    const selectCategoria = document.getElementById('prod-categoria');
    const inputPrecio = document.getElementById('prod-precio');
    const inputStock = document.getElementById('prod-stock');
    const inputStockCritico = document.getElementById('prod-stock-critico');
    const inputDescripcion = document.getElementById('prod-descripcion');
    const inputImagen = document.getElementById('prod-imagen');

    // Código: Requerido, mín 3
    if (inputCodigo.value.trim().length < 3) {
      mostrarError(inputCodigo, 'El código debe tener al menos 3 caracteres.');
      esValido = false;
    } else {
      limpiarError(inputCodigo);
    }

    // Nombre: Requerido, máx 100
    if (inputNombre.value.trim().length < 2 || inputNombre.value.length > 100) {
      mostrarError(inputNombre, 'El nombre es obligatorio (hasta 100 caracteres).');
      esValido = false;
    } else {
      limpiarError(inputNombre);
    }

    // Categoría: Requerido
    if (!selectCategoria.value) {
      mostrarError(selectCategoria, 'Seleccione una categoría.');
      esValido = false;
    } else {
      limpiarError(selectCategoria);
    }

    // Precio: Requerido, mín 0 (0 = FREE)
    const precio = parseFloat(inputPrecio.value);
    if (isNaN(precio) || precio < 0) {
      mostrarError(inputPrecio, 'El precio debe ser un número mayor o igual a 0.');
      esValido = false;
    } else {
      limpiarError(inputPrecio);
    }

    // Stock: Requerido, entero mín 0
    const stock = parseInt(inputStock.value, 10);
    if (isNaN(stock) || stock < 0) {
      mostrarError(inputStock, 'El stock debe ser un número entero mayor o igual a 0.');
      esValido = false;
    } else {
      limpiarError(inputStock);
    }

    // Stock Crítico: Opcional, entero mín 0
    let stockCritico = 0;
    if (inputStockCritico.value.trim() !== '') {
      stockCritico = parseInt(inputStockCritico.value, 10);
      if (isNaN(stockCritico) || stockCritico < 0) {
        mostrarError(inputStockCritico, 'El stock crítico debe ser un número entero mayor o igual a 0.');
        esValido = false;
      } else {
        limpiarError(inputStockCritico);
      }
    }

    if (esValido) {
      const productos = obtenerProductos();
      const elMarca = document.getElementById('prod-marca') || document.getElementById('prod-autor');
      const datosProducto = {
        codigo: inputCodigo.value.trim().toUpperCase(),
        nombre: inputNombre.value.trim(),
        marca: elMarca ? elMarca.value.trim() || 'Level-Up' : 'Level-Up',
        categoria: selectCategoria.value,
        precio: precio,
        stock: stock,
        stockCritico: stockCritico,
        descripcion: inputDescripcion.value.trim(),
        imagen: inputImagen.value.trim() || 'assets/img/productos/detalle-1.jpg'
      };

      if (idProducto) {
        // Actualizar existente
        const index = productos.findIndex(function(p) { return p.id === Number(idProducto); });
        if (index !== -1) {
          productos[index] = Object.assign(productos[index], datosProducto);
        }
      } else {
        // Crear nuevo
        datosProducto.id = productos.length > 0 ? Math.max.apply(null, productos.map(function(p) { return p.id; })) + 1 : 1;
        productos.push(datosProducto);
      }

      guardarProductos(productos);
      alert('¡Producto guardado exitosamente!');
      window.location.href = 'admin-productos.html';
    }
  });
}

// Cargar tabla de usuarios en admin-usuarios.html
function cargarTablaUsuarios() {
  const tablaBody = document.getElementById('table-users-body');
  if (!tablaBody) return;

  const usuarios = obtenerUsuarios();
  let html = '';

  usuarios.forEach(function(u) {
    const user = u instanceof Usuario ? u : new Usuario(u);
    html += `
      <tr>
        <td><code>${user.run}</code></td>
        <td><strong>${user.nombreCompleto}</strong></td>
        <td>${user.correo}</td>
        <td><span class="badge-${user.tipoUsuario.toLowerCase()}">${user.tipoUsuario}</span></td>
        <td>${user.region || 'Metropolitana'}</td>
        <td>${user.comuna || 'Santiago'}</td>
        <td>
          <a href="admin-usuario-form.html?id=${user.id}" class="btn btn-sm btn-secondary">Editar</a>
          <button type="button" class="btn btn-sm btn-outline" onclick="eliminarUsuario(${user.id})" style="color: #ef4444; margin-left: 4px;">Eliminar</button>
        </td>
      </tr>
    `;
  });

  tablaBody.innerHTML = html;
}

function eliminarUsuario(id) {
  if (confirm('¿Seguro que deseas eliminar este usuario?')) {
    let usuarios = obtenerUsuarios();
    usuarios = usuarios.filter(function(u) { return u.id !== Number(id); });
    guardarUsuarios(usuarios);
    cargarTablaUsuarios();
    mostrarNotificacion('Usuario eliminado.');
  }
}

// Formulario Crear / Editar Usuario en Admin (admin-usuario-form.html)
function iniciarFormularioUsuario() {
  const form = document.getElementById('form-usuario-admin');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const idUsuario = params.get('id');

  if (idUsuario) {
    const usuarios = obtenerUsuarios();
    const user = usuarios.find(function(u) { return u.id === Number(idUsuario); });
    if (user) {
      document.getElementById('form-title').textContent = 'Editar Usuario: ' + user.nombre;
      document.getElementById('usr-run').value = user.run;
      document.getElementById('usr-nombre').value = user.nombre;
      document.getElementById('usr-apellidos').value = user.apellidos;
      document.getElementById('usr-correo').value = user.correo;
      document.getElementById('usr-tipo').value = user.tipoUsuario;
      document.getElementById('usr-direccion').value = user.direccion || '';
      cargarRegionesYComunas('usr-region', 'usr-comuna', user.region, user.comuna);
    }
  } else {
    cargarRegionesYComunas('usr-region', 'usr-comuna');
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let esValido = true;

    const inputRun = document.getElementById('usr-run');
    const inputNombre = document.getElementById('usr-nombre');
    const inputApellidos = document.getElementById('usr-apellidos');
    const inputCorreo = document.getElementById('usr-correo');
    const inputPass = document.getElementById('usr-pass');
    const selectTipo = document.getElementById('usr-tipo');
    const selectRegion = document.getElementById('usr-region');
    const selectComuna = document.getElementById('usr-comuna');
    const inputDireccion = document.getElementById('usr-direccion');

    // RUN Módulo 11
    const valRun = validarRUN(inputRun.value);
    if (!valRun.valido) {
      mostrarError(inputRun, valRun.mensaje);
      esValido = false;
    } else {
      limpiarError(inputRun);
    }

    // Nombre (máx 50)
    if (inputNombre.value.trim().length < 2 || inputNombre.value.length > 50) {
      mostrarError(inputNombre, 'El nombre es obligatorio (hasta 50 caracteres).');
      esValido = false;
    } else {
      limpiarError(inputNombre);
    }

    // Apellidos (máx 100)
    if (inputApellidos.value.trim().length < 2 || inputApellidos.value.length > 100) {
      mostrarError(inputApellidos, 'Los apellidos son obligatorios (hasta 100 caracteres).');
      esValido = false;
    } else {
      limpiarError(inputApellidos);
    }

    // Correo (@duoc.cl, @profesor.duoc.cl, @gmail.com)
    const valCorreo = validarCorreo(inputCorreo.value);
    if (!valCorreo.valido) {
      mostrarError(inputCorreo, valCorreo.mensaje);
      esValido = false;
    } else {
      limpiarError(inputCorreo);
    }

    // Rol / Tipo
    if (!selectTipo.value) {
      mostrarError(selectTipo, 'Debe seleccionar un rol.');
      esValido = false;
    } else {
      limpiarError(selectTipo);
    }

    // Dirección
    if (inputDireccion.value.trim().length < 5) {
      mostrarError(inputDireccion, 'La dirección es obligatoria.');
      esValido = false;
    } else {
      limpiarError(inputDireccion);
    }

    if (esValido) {
      const usuarios = obtenerUsuarios();
      const datosUsuario = {
        run: inputRun.value.trim().toUpperCase(),
        nombre: inputNombre.value.trim(),
        apellidos: inputApellidos.value.trim(),
        correo: inputCorreo.value.trim().toLowerCase(),
        tipoUsuario: selectTipo.value,
        region: selectRegion.value,
        comuna: selectComuna.value,
        direccion: inputDireccion.value.trim()
      };

      if (inputPass.value) {
        datosUsuario.password = inputPass.value;
      }

      if (idUsuario) {
        const index = usuarios.findIndex(function(u) { return u.id === Number(idUsuario); });
        if (index !== -1) {
          usuarios[index] = Object.assign(usuarios[index], datosUsuario);
        }
      } else {
        datosUsuario.id = usuarios.length > 0 ? Math.max.apply(null, usuarios.map(function(u) { return u.id; })) + 1 : 1;
        datosUsuario.password = inputPass.value || '1234';
        usuarios.push(datosUsuario);
      }

      guardarUsuarios(usuarios);
      alert('¡Usuario guardado exitosamente!');
      window.location.href = 'admin-usuarios.html';
    }
  });
}
