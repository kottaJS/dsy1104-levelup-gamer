// Carrito de compras


class ItemCarrito {
  constructor(producto, cantidad = 1) {
    this.producto = producto instanceof Producto ? producto : new Producto(producto);
    this.cantidad = Math.max(1, Number(cantidad) || 1);
  }

  get id() { return this.producto.id; }
  get codigo() { return this.producto.codigo; }
  get nombre() { return this.producto.nombre; }
  get categoria() { return this.producto.categoria; }
  get precio() { return this.producto.precio; }
  get imagen() { return this.producto.imagen; }
  get stock() { return this.producto.stock; }

  // Subtotal de la línea de producto
  get subtotal() {
    return this.producto.precio * this.cantidad;
  }

  incrementar() {
    if (this.producto.hayStock(this.cantidad + 1)) {
      this.cantidad++;
      return true;
    }
    return false;
  }

  decrementar() {
    if (this.cantidad > 1) {
      this.cantidad--;
      return true;
    }
    return false;
  }

  // Serialización para guardar en localStorage
  toJSON() {
    return {
      id: this.producto.id,
      codigo: this.producto.codigo,
      nombre: this.producto.nombre,
      categoria: this.producto.categoria,
      precio: this.producto.precio,
      imagen: (this.producto._imagen || this.producto.imagen || '').replace(/^(\.\.\/)+/, '').replace(/^\//, ''),
      stock: this.producto.stock,
      cantidad: this.cantidad
    };
  }
}


class Carrito {
  constructor() {
    this.items = [];
    this.cupon = null;
    this.cargar();
  }

  // Carga los datos almacenados y los reconstruye en instancias P.O.O.
  cargar() {
    const datos = GestorStorage.obtenerCarrito();
    this.items = datos.map(item => {
      const prodCatalogo = GestorStorage.buscarProductoPorId(item.id);
      return new ItemCarrito(prodCatalogo || item, item.cantidad);
    });
    this.cupon = GestorStorage.obtenerCupon();
  }

  // Guarda en el almacenamiento local
  guardar() {
    GestorStorage.guardarCarrito(this.items.map(item => item.toJSON()));
    GestorStorage.guardarCupon(this.cupon);
    this.actualizarBadges();
  }

  // Agrega un producto al carrito
  agregar(idProducto, cantidad = 1) {
    const producto = GestorStorage.buscarProductoPorId(idProducto);
    if (!producto) {
      if (typeof alert !== 'undefined') alert('El producto no existe.');
      return false;
    }

    if (!producto.hayStock(1)) {
      Validador.mostrarNotificacion('Este producto no tiene stock disponible.');
      return false;
    }

    const itemExistente = this.items.find(i => i.id === producto.id);
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) {
        Validador.mostrarNotificacion(`No puedes agregar más del stock disponible (${producto.stock} unidades).`);
        return false;
      }
      itemExistente.cantidad = nuevaCantidad;
    } else {
      this.items.push(new ItemCarrito(producto, cantidad));
    }

    this.guardar();
    Validador.mostrarNotificacion(`¡"${producto.nombre}" fue añadido al carrito!`);
    return true;
  }

  // Modifica la cantidad de un ítem
  cambiarCantidad(idProducto, nuevaCantidad) {
    const indice = this.items.findIndex(i => i.id === Number(idProducto));
    if (indice === -1) return;

    if (nuevaCantidad <= 0) {
      this.eliminar(idProducto);
      return;
    }

    const item = this.items[indice];
    if (nuevaCantidad > item.stock) {
      Validador.mostrarNotificacion(`Stock máximo alcanzado (${item.stock} unidades).`);
      return;
    }

    item.cantidad = nuevaCantidad;
    this.guardar();
    this.renderizar();
  }

  // Elimina un ítem específico
  eliminar(idProducto) {
    this.items = this.items.filter(i => i.id !== Number(idProducto));
    this.guardar();
    this.renderizar();
    Validador.mostrarNotificacion('Producto eliminado del carrito.');
  }

  // Vacía todos los ítems
  vaciar() {
    const confirmar = typeof confirm !== 'undefined' ? confirm('¿Seguro que deseas vaciar el carrito?') : true;
    if (confirmar) {
      this.items = [];
      this.cupon = null;
      this.guardar();
      this.renderizar();
      Validador.mostrarNotificacion('El carrito ha sido vaciado.');
    }
  }

  // Aplica un cupón promocional
  aplicarCupon(codigo) {
    if (!codigo || !codigo.trim()) {
      if (typeof alert !== 'undefined') alert('Ingrese un código de cupón.');
      return;
    }

    const cod = codigo.trim().toUpperCase();
    const cuponEncontrado = INITIAL_COUPONS.find(c => c.codigo === cod);

    if (!cuponEncontrado) {
      if (typeof alert !== 'undefined') alert('El cupón ingresado no es válido. Puedes probar con DUOC2026.');
      return;
    }

    this.cupon = cuponEncontrado;
    this.guardar();
    Validador.mostrarNotificacion(`¡Cupón ${cuponEncontrado.codigo} aplicado! (${cuponEncontrado.porcentaje}% de descuento)`);
    this.renderizar();
  }

  // Quita el cupón activo
  removerCupon() {
    this.cupon = null;
    this.guardar();
    this.renderizar();
    Validador.mostrarNotificacion('Cupón removido.');
  }

  // Total de unidades físicas en el carrito
  obtenerTotalUnidades() {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }

  // Subtotal sin descuentos
  calcularSubtotal() {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }

  // Cálculo de descuento (20% vitalicio Duoc UC o cupón)
  calcularDescuento(usuario) {
    const subtotal = this.calcularSubtotal();
    if (subtotal === 0) return { monto: 0, porcentaje: 0, motivo: '' };

    let porcentaje = 0;
    let motivo = '';

    // Regla de negocio oficial Forma B: 20% automático para comunidad Duoc
    if (usuario && usuario.esComunidadDuoc()) {
      porcentaje = 20;
      motivo = 'Comunidad Duoc UC (20% vitalicio)';
    }

    if (this.cupon && this.cupon.porcentaje > porcentaje) {
      porcentaje = this.cupon.porcentaje;
      motivo = `Cupón ${this.cupon.codigo} (${this.cupon.porcentaje}%)`;
    }

    const monto = Math.round((subtotal * porcentaje) / 100);
    return { monto, porcentaje, motivo };
  }

  // Total final neto a pagar
  calcularTotal(usuario) {
    const subtotal = this.calcularSubtotal();
    const { monto } = this.calcularDescuento(usuario);
    return Math.max(0, subtotal - monto);
  }

  // Actualiza los badges de navegación en todas las páginas
  actualizarBadges() {
    if (typeof document === 'undefined' || !document.querySelectorAll) return;
    const totalUnidades = this.obtenerTotalUnidades();
    const badges = document.querySelectorAll('.cart-btn, .cart-count-badge, #btn-cart-nav');
    badges.forEach(b => {
      b.textContent = `Carrito (${totalUnidades})`;
    });
  }

  // Procesa el pago y descuenta stock
  pagar() {
    if (this.items.length === 0) {
      if (typeof alert !== 'undefined') alert('El carrito está vacío.');
      return;
    }

    const confirmar = typeof confirm !== 'undefined' ? confirm('¿Deseas confirmar tu compra en Level-Up Gamer?') : true;
    if (confirmar) {
      const productos = GestorStorage.obtenerProductos();

      this.items.forEach(item => {
        const prod = productos.find(p => p.id === item.id);
        if (prod) {
          prod.reducirStock(item.cantidad);
        }
      });

      GestorStorage.guardarProductos(productos);
      this.items = [];
      this.cupon = null;
      this.guardar();
      this.renderizar();

      if (typeof alert !== 'undefined') {
        alert('¡Gracias por tu compra!\nTu pedido ha sido procesado exitosamente.');
      }
    }
  }

  // Renderiza la vista de carrito.html
  renderizar() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    const contenedorItems = document.getElementById('cart-items-list');
    const contenedorResumen = document.getElementById('cart-summary-container');
    if (!contenedorItems || !contenedorResumen) return;

    if (this.items.length === 0) {
      contenedorItems.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 15px;">Tu carrito de compras está vacío.</p>
          <a href="${getRelativeRoot()}pages/productos.html" class="btn btn-primary">Ver catálogo de productos</a>
        </div>
      `;
      contenedorResumen.innerHTML = `
        <div class="carrito-resumen">
          <h3 class="carrito-total-titulo">
            <span>TOTAL:</span>
            <span>$ 0</span>
          </h3>
        </div>
      `;
      return;
    }

    let itemsHTML = '';
    this.items.forEach(item => {
      itemsHTML += `
        <div class="carrito-fila">
          <img src="${item.imagen}" alt="${item.nombre}" class="carrito-img">
          
          <div class="carrito-info">
            <h4>${item.nombre}</h4>
            <p>${item.categoria} · Código: ${item.codigo}</p>
            <p style="font-weight: bold; margin-top: 4px;">${item.producto.formatearPrecio()} c/u</p>
          </div>

          <div class="carrito-controles">
            <button type="button" class="btn-control-qty" onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
            <input type="number" class="input-control-qty" value="${item.cantidad}" readonly>
            <button type="button" class="btn-control-qty" onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
            <button type="button" class="btn-eliminar-item" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
          </div>

          <div class="carrito-subtotal-item">
            ${new Producto({ precio: item.subtotal }).formatearPrecio()}
          </div>
        </div>
      `;
    });
    contenedorItems.innerHTML = itemsHTML;

    const usuario = GestorStorage.obtenerSesionActual();
    const subtotal = this.calcularSubtotal();
    const descuentoInfo = this.calcularDescuento(usuario);
    const total = this.calcularTotal(usuario);

    contenedorResumen.innerHTML = `
      <div class="carrito-resumen">
        <h3 class="carrito-total-titulo">
          <span>TOTAL:</span>
          <span style="color: var(--accent);">${new Producto({ precio: total }).formatearPrecio()}</span>
        </h3>

        <div style="margin-bottom: 15px; font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>${new Producto({ precio: subtotal }).formatearPrecio()}</span>
          </div>
          ${descuentoInfo.porcentaje > 0 ? `
            <div style="display: flex; justify-content: space-between; color: var(--accent); margin-bottom: 6px;">
              <span>Descuento (${descuentoInfo.motivo}):</span>
              <span>-${new Producto({ precio: descuentoInfo.monto }).formatearPrecio()}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; color: var(--accent);">
            <span>Envío a todo Chile:</span>
            <strong>GRATIS</strong>
          </div>
        </div>

        <div class="cupon-box">
          <label for="input-cupon">Ingrese cupón de descuento:</label>
          <div class="cupon-input-grupo">
            <input type="text" id="input-cupon" class="form-control" placeholder="Ej: LEVELUP20" value="${this.cupon ? this.cupon.codigo : ''}">
            <button type="button" class="btn btn-secondary btn-sm" onclick="aplicarCupon()">APLICAR</button>
          </div>
          ${this.cupon ? `
            <p style="font-size: 0.8rem; color: var(--accent); margin-top: 6px;">
              ✓ Cupón activo. <a href="#" onclick="eliminarCupon(); return false;" style="color: #ef4444;">Quitar</a>
            </p>
          ` : `
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;">(Prueba con <code>LEVELUP20</code> o <code>DUOC2026</code> para 20% OFF)</p>
          `}
        </div>

        <button type="button" class="btn-pagar-verde" onclick="pagarCarrito()">
          PAGAR
        </button>
      </div>
    `;
  }
}

// Carrito de compras
const carritoApp = new Carrito();

function formatearPrecio(precio) {
  return new Producto({ precio }).formatearPrecio();
}

function agregarAlCarrito(idProducto, cantidad = 1) {
  return carritoApp.agregar(idProducto, cantidad);
}

function cambiarCantidad(idProducto, nuevaCantidad) {
  carritoApp.cambiarCantidad(idProducto, nuevaCantidad);
}

function eliminarDelCarrito(idProducto) {
  carritoApp.eliminar(idProducto);
}

function vaciarCarrito() {
  carritoApp.vaciar();
}

function aplicarCupon() {
  const input = document.getElementById('input-cupon');
  carritoApp.aplicarCupon(input ? input.value : '');
}

function eliminarCupon() {
  carritoApp.removerCupon();
}

function actualizarContadorCarrito() {
  carritoApp.actualizarBadges();
}

function renderizarCarrito() {
  carritoApp.renderizar();
}

function pagarCarrito() {
  carritoApp.pagar();
}

// Escuchador para actualizar contador en la carga del DOM
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', function() {
    carritoApp.actualizarBadges();
  });
}

if (typeof window !== 'undefined') {
  window.ItemCarrito = ItemCarrito;
  window.Carrito = Carrito;
  window.carritoApp = carritoApp;
  window.formatearPrecio = formatearPrecio;
  window.agregarAlCarrito = agregarAlCarrito;
  window.cambiarCantidad = cambiarCantidad;
  window.eliminarDelCarrito = eliminarDelCarrito;
  window.vaciarCarrito = vaciarCarrito;
  window.aplicarCupon = aplicarCupon;
  window.eliminarCupon = eliminarCupon;
  window.actualizarContadorCarrito = actualizarContadorCarrito;
  window.renderizarCarrito = renderizarCarrito;
  window.pagarCarrito = pagarCarrito;
}
if (typeof global !== 'undefined') {
  global.ItemCarrito = ItemCarrito;
  global.Carrito = Carrito;
  global.carritoApp = carritoApp;
  global.formatearPrecio = formatearPrecio;
  global.agregarAlCarrito = agregarAlCarrito;
  global.cambiarCantidad = cambiarCantidad;
  global.eliminarDelCarrito = eliminarDelCarrito;
  global.vaciarCarrito = vaciarCarrito;
  global.aplicarCupon = aplicarCupon;
  global.eliminarCupon = eliminarCupon;
  global.actualizarContadorCarrito = actualizarContadorCarrito;
  global.renderizarCarrito = renderizarCarrito;
  global.pagarCarrito = pagarCarrito;
}

