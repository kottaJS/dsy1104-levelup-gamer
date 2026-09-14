// Datos y clases base

// Permite resolver rutas relativas hacia la raíz según la profundidad de la URL actual
function getRelativeRoot() {
  if (typeof window === 'undefined' || !window.location || !window.location.pathname) {
    return '';
  }
  const p = window.location.pathname.replace(/\\/g, '/');
  if (p.includes('/pages/admin/') || p.includes('/pages/blog/')) {
    return '../../';
  }
  if (p.includes('/pages/')) {
    return '../';
  }
  return '';
}

// Resuelve rutas de imágenes para que funcionen tanto en raíz como en subdirectorios
function resolverRutaImagen(ruta) {
  if (!ruta) return '';
  if (ruta.startsWith('http://') || ruta.startsWith('https://') || ruta.startsWith('data:')) {
    return ruta;
  }
  const limpia = ruta.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
  return getRelativeRoot() + limpia;
}


class Producto {
  constructor(datos = {}) {
    this.id = Number(datos.id) || 0;
    this.codigo = datos.codigo || '';
    this.nombre = datos.nombre || '';
    this.categoria = datos.categoria || '';
    this.precio = Number(datos.precio) || 0;
    this.stock = Number(datos.stock) || 0;
    this.stockCritico = Number(datos.stockCritico) || 0;
    this.descripcion = datos.descripcion || '';
    this._imagen = datos.imagen || '';
    this._imagenes = Array.isArray(datos.imagenes) ? datos.imagenes : [];
    this.destacado = Boolean(datos.destacado);
    this.marca = datos.marca || datos.autor || 'Level-Up';
    this.garantia = datos.garantia || '3 meses';
  }

    get imagen() {
    return resolverRutaImagen(this._imagen);
  }

  set imagen(val) {
    this._imagen = val;
  }

  // Lista de imágenes para galería de detalles
  get imagenes() {
    if (this._imagenes && this._imagenes.length > 0) {
      return this._imagenes.map(img => resolverRutaImagen(img));
    }
    return [this.imagen];
  }

    toJSON() {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      categoria: this.categoria,
      precio: this.precio,
      stock: this.stock,
      stockCritico: this.stockCritico,
      descripcion: this.descripcion,
      imagen: (this._imagen || '').replace(/^(\.\.\/)+/, '').replace(/^\//, ''),
      imagenes: (this._imagenes || []).map(img => (img || '').replace(/^(\.\.\/)+/, '').replace(/^\//, '')),
      destacado: this.destacado,
      marca: this.marca,
      garantia: this.garantia
    };
  }

    hayStock(cantidad = 1) {
    return this.stock >= cantidad;
  }

    esStockCritico() {
    return this.stock > 0 && this.stockCritico > 0 && this.stock <= this.stockCritico;
  }

    formatearPrecio() {
    if (this.precio === 0) return 'GRATIS (FREE)';
    return '$ ' + this.precio.toLocaleString('es-CL');
  }

    calcularPrecioConDescuento(porcentaje) {
    if (!porcentaje || porcentaje <= 0) return this.precio;
    const factor = 1 - (porcentaje / 100);
    return Math.max(0, Math.round(this.precio * factor));
  }

    reducirStock(cantidad = 1) {
    if (this.hayStock(cantidad)) {
      this.stock -= cantidad;
      return true;
    }
    return false;
  }
}


class Usuario {
  constructor(datos = {}) {
    this.id = datos.id || null;
    this.run = datos.run || '';
    this.nombre = datos.nombre || '';
    this.apellidos = datos.apellidos || '';
    this.correo = datos.correo || '';
    this.password = datos.password || '';
    this.fechaNacimiento = datos.fechaNacimiento || '';
    this.tipoUsuario = datos.tipoUsuario || 'Cliente';
    this.region = datos.region || '';
    this.comuna = datos.comuna || '';
    this.direccion = datos.direccion || '';
    this.codigoReferido = datos.codigoReferido || '';
  }

  // Nombre completo
  get nombreCompleto() {
    return `${this.nombre} ${this.apellidos}`.trim();
  }

  // 20% de descuento para correos de Duoc
  esComunidadDuoc() {
    if (!this.correo) return false;
    const c = this.correo.toLowerCase();
    return c.endsWith('@duoc.cl') || c.endsWith('@profesor.duoc.cl');
  }

  esAdmin() {
    return this.tipoUsuario === 'Administrador';
  }

  esVendedor() {
    return this.tipoUsuario === 'Vendedor';
  }

  esCliente() {
    return this.tipoUsuario === 'Cliente';
  }
}

// REGIONES Y COMUNAS OFICIALES DE CHILE
const REGIONES_CHILE = [
  {
    id: 15,
    nombre: "Región de Arica y Parinacota",
    comunas: ["Arica", "Camarones", "Putre", "General Lagos"]
  },
  {
    id: 1,
    nombre: "Región de Tarapacá",
    comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"]
  },
  {
    id: 2,
    nombre: "Región de Antofagasta",
    comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"]
  },
  {
    id: 3,
    nombre: "Región de Atacama",
    comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"]
  },
  {
    id: 4,
    nombre: "Región de Coquimbo",
    comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"]
  },
  {
    id: 5,
    nombre: "Región de Valparaíso",
    comunas: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"]
  },
  {
    id: 13,
    nombre: "Región Metropolitana de Santiago",
    comunas: ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"]
  },
  {
    id: 6,
    nombre: "Región del Libertador Gral. Bernardo O'Higgins",
    comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"]
  },
  {
    id: 7,
    nombre: "Región del Maule",
    comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"]
  },
  {
    id: 16,
    nombre: "Región de Ñuble",
    comunas: ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"]
  },
  {
    id: 8,
    nombre: "Región del Biobío",
    comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"]
  },
  {
    id: 9,
    nombre: "Región de La Araucanía",
    comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"]
  },
  {
    id: 14,
    nombre: "Región de Los Ríos",
    comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"]
  },
  {
    id: 10,
    nombre: "Región de Los Lagos",
    comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"]
  },
  {
    id: 11,
    nombre: "Región de Aysén del Gral. Carlos Ibáñez del Campo",
    comunas: ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"]
  },
  {
    id: 12,
    nombre: "Región de Magallanes y de la Antártica Chilena",
    comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
  }
];

const INITIAL_CATEGORIES = [
  "Juegos de Mesa",
  "Accesorios",
  "Consolas",
  "Computadores Gamers",
  "Sillas Gamers",
  "Mouse",
  "Mousepad",
  "Poleras Personalizadas",
  "Polerones Gamers Personalizados",
  "Servicio Técnico"
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    codigo: "JM001",
    nombre: "Catan",
    categoria: "Juegos de Mesa",
    precio: 29990,
    stock: 18,
    stockCritico: 4,
    descripcion: "Un clásico juego de estrategia donde los jugadores compiten por colonizar y expandirse en la isla de Catan. Ideal para 3-4 jugadores y perfecto para noches de juego en familia o con amigos.",
    imagen: "assets/img/productos/catan.webp",
    imagenes: [
      "assets/img/productos/catan.webp",
      "assets/img/productos/catan-2.webp"
    ],
    destacado: true,
    marca: "Devir",
    garantia: "6 meses"
  },
  {
    id: 2,
    codigo: "JM002",
    nombre: "Carcassonne",
    categoria: "Juegos de Mesa",
    precio: 24990,
    stock: 14,
    stockCritico: 3,
    descripcion: "Un juego de colocación de fichas donde los jugadores construyen el paisaje alrededor de la fortaleza medieval de Carcassonne. Ideal para 2-5 jugadores y fácil de aprender.",
    imagen: "assets/img/productos/carcassonne.webp",
    imagenes: [
      "assets/img/productos/carcassonne.webp",
      "assets/img/productos/carcassonne-2.webp"
    ],
    destacado: false,
    marca: "Devir",
    garantia: "6 meses"
  },
  {
    id: 3,
    codigo: "AC001",
    nombre: "Controlador Inalámbrico Xbox Series X",
    categoria: "Accesorios",
    precio: 59990,
    stock: 22,
    stockCritico: 5,
    descripcion: "Ofrece una experiencia de juego cómoda con botones mapeables y una respuesta táctil mejorada. Compatible con consolas Xbox y PC.",
    imagen: "assets/img/productos/control-xbox.webp",
    imagenes: [
      "assets/img/productos/control-xbox.webp",
      "assets/img/productos/control-xbox-2.webp",
      "assets/img/productos/control-xbox-3.webp",
      "assets/img/productos/control-xbox-4.webp"
    ],
    destacado: true,
    marca: "Microsoft",
    garantia: "1 año"
  },
  {
    id: 4,
    codigo: "AC002",
    nombre: "Auriculares Gamer HyperX Cloud II",
    categoria: "Accesorios",
    precio: 79990,
    stock: 3,
    stockCritico: 5,
    descripcion: "Proporcionan un sonido envolvente de calidad con un micrófono desmontable y almohadillas de espuma viscoelástica para mayor comodidad durante largas sesiones de juego.",
    imagen: "assets/img/productos/hyperx-cloud.webp",
    imagenes: [
      "assets/img/productos/hyperx-cloud.webp",
      "assets/img/productos/hyperx-cloud-2.webp",
      "assets/img/productos/hyperx-cloud-3.webp"
    ],
    destacado: true,
    marca: "HyperX",
    garantia: "2 años"
  },
  {
    id: 5,
    codigo: "CO001",
    nombre: "PlayStation 5",
    categoria: "Consolas",
    precio: 549990,
    stock: 9,
    stockCritico: 3,
    descripcion: "La consola de última generación de Sony, que ofrece gráficos impresionantes y tiempos de carga ultrarrápidos para una experiencia de juego inmersiva.",
    imagen: "assets/img/productos/ps5.webp",
    imagenes: [
      "assets/img/productos/ps5.webp",
      "assets/img/productos/ps5-2.webp"
    ],
    destacado: true,
    marca: "Sony",
    garantia: "1 año"
  },
  {
    id: 6,
    codigo: "CG001",
    nombre: "PC Gamer ASUS ROG Strix",
    categoria: "Computadores Gamers",
    precio: 1299990,
    stock: 5,
    stockCritico: 2,
    descripcion: "Un potente equipo diseñado para los gamers más exigentes, equipado con los últimos componentes para ofrecer un rendimiento excepcional en cualquier juego.",
    imagen: "assets/img/productos/pc-asus-rog.webp",
    imagenes: [
      "assets/img/productos/pc-asus-rog.webp",
      "assets/img/productos/pc-asus-rog-2.webp"
    ],
    destacado: true,
    marca: "ASUS ROG",
    garantia: "2 años"
  },
  {
    id: 7,
    codigo: "SG001",
    nombre: "Silla Gamer Secretlab Titan",
    categoria: "Sillas Gamers",
    precio: 349990,
    stock: 7,
    stockCritico: 2,
    descripcion: "Diseñada para el máximo confort, esta silla ofrece un soporte ergonómico y personalización ajustable para sesiones de juego prolongadas.",
    imagen: "assets/img/productos/silla-secretlab.webp",
    imagenes: [
      "assets/img/productos/silla-secretlab.webp",
      "assets/img/productos/silla-secretlab-2.webp"
    ],
    destacado: false,
    marca: "Secretlab",
    garantia: "3 años"
  },
  {
    id: 8,
    codigo: "MS001",
    nombre: "Mouse Gamer Logitech G502 HERO",
    categoria: "Mouse",
    precio: 49990,
    stock: 28,
    stockCritico: 6,
    descripcion: "Con sensor de alta precisión y botones personalizables, este mouse es ideal para gamers que buscan un control preciso y personalización.",
    imagen: "assets/img/productos/logitech-g502.webp",
    imagenes: [
      "assets/img/productos/logitech-g502.webp",
      "assets/img/productos/logitech-g502-2.webp",
      "assets/img/productos/logitech-g502-3.webp"
    ],
    destacado: true,
    marca: "Logitech G",
    garantia: "2 años"
  },
  {
    id: 9,
    codigo: "MP001",
    nombre: "Mousepad Razer Goliathus Extended Chroma",
    categoria: "Mousepad",
    precio: 29990,
    stock: 25,
    stockCritico: 5,
    descripcion: "Ofrece un área de juego amplia con iluminación RGB personalizable, asegurando una superficie suave y uniforme para el movimiento del mouse.",
    imagen: "assets/img/productos/mousepad-razer.webp",
    imagenes: [
      "assets/img/productos/mousepad-razer.webp",
      "assets/img/productos/mousepad-razer-2.webp"
    ],
    destacado: false,
    marca: "Razer",
    garantia: "1 año"
  },
  {
    id: 10,
    codigo: "PP001",
    nombre: "Polera Gamer Personalizada 'Level-Up'",
    categoria: "Poleras Personalizadas",
    precio: 14990,
    stock: 50,
    stockCritico: 10,
    descripcion: "Una camiseta cómoda y estilizada, con la posibilidad de personalizarla con tu gamer tag o diseño favorito.",
    imagen: "assets/img/productos/polera-levelup.webp",
    imagenes: [
      "assets/img/productos/polera-levelup.webp"
    ],
    destacado: false,
    marca: "Level-Up Apparel",
    garantia: "3 meses"
  },
  {
    id: 11,
    codigo: "ST001",
    nombre: "Diagnóstico y Mantenimiento de Hardware",
    categoria: "Servicio Técnico",
    precio: 0,
    stock: 100,
    stockCritico: 10,
    descripcion: "Evaluación técnica preliminar y limpieza de componentes para consolas y computadores gamers sin costo para usuarios registrados.",
    imagen: "assets/img/productos/servicio-tecnico.webp",
    imagenes: [
      "assets/img/productos/servicio-tecnico.webp",
      "assets/img/productos/servicio-tecnico-2.webp"
    ],
    destacado: false,
    marca: "Level-Up Tech",
    garantia: "3 meses"
  }
];

const INITIAL_USERS = [
  {
    id: 1,
    run: "19011029K",
    nombre: "Admin",
    apellidos: "Level-Up",
    correo: "admin@duoc.cl",
    password: "Admin123!",
    fechaNacimiento: "1998-05-14",
    tipoUsuario: "Administrador",
    region: "Región Metropolitana de Santiago",
    comuna: "Santiago",
    direccion: "Av. España 8, Santiago Centro"
  },
  {
    id: 2,
    run: "184523310",
    nombre: "Vendedor",
    apellidos: "Tienda",
    correo: "vendedor@profesor.duoc.cl",
    password: "Vendedor123!",
    fechaNacimiento: "1994-11-20",
    tipoUsuario: "Vendedor",
    region: "Región de Valparaíso",
    comuna: "Viña del Mar",
    direccion: "Calle Libertad 450, Depto 302"
  },
  {
    id: 3,
    run: "201234565",
    nombre: "Estudiante",
    apellidos: "Duoc",
    correo: "estudiante@duoc.cl",
    password: "Cliente123!",
    fechaNacimiento: "2001-08-30",
    tipoUsuario: "Cliente",
    region: "Región del Biobío",
    comuna: "Concepción",
    direccion: "Barros Arana 1020"
  },
  {
    id: 4,
    run: "219876543",
    nombre: "Matías",
    apellidos: "González Silva",
    correo: "gamer@gmail.com",
    password: "Cliente123!",
    fechaNacimiento: "2003-02-15",
    tipoUsuario: "Cliente",
    region: "Región Metropolitana de Santiago",
    comuna: "Providencia",
    direccion: "Av. Providencia 1450"
  }
];

const INITIAL_BLOGS = [
  {
    id: 1,
    titulo: "Guía 2026: Cómo armar tu PC Gamer paso a paso",
    slug: "guia-armar-pc-gamer-2026",
    fecha: "10 de Septiembre, 2026",
    autor: "Equipo Técnico Level-Up",
    categoria: "Hardware & Guias",
    imagen: "assets/img/blog/guia-pc.jpg",
    resumen: "Consejos clave para elegir procesador, tarjeta gráfica y fuente de poder según tu presupuesto y evitar cuellos de botella.",
    contenido: `
      <p>Armar un computador gamer en 2026 ofrece un rendimiento insuperable frente a las consolas tradicionales si se eligen los componentes adecuados. Lo más importante es mantener el equilibrio entre el procesador y la tarjeta gráfica.</p>
      <h3>1. Procesador y Tarjeta de Video</h3>
      <p>Para jugar a 1440p o 4K, prioriza GPUs con al menos 12 GB de VRAM. Asegúrate de acompañarla con un CPU de 6 u 8 núcleos modernos para evitar caídas bruscas de fotogramas en títulos competitivos.</p>
      <h3>2. Fuente de Poder con Certificación</h3>
      <p>Nunca escatimes en la fuente de poder (PSU). Opta por marcas reconocidas con certificación 80 Plus Gold o superior para proteger tu inversión frente a variaciones de voltaje.</p>
      <h3>3. Flujo de Aire y Temperatura</h3>
      <p>Un gabinete con panel frontal de malla (mesh) y al menos tres ventiladores (dos de entrada y uno de salida) prolonga la vida útil de tus componentes y mantiene un funcionamiento silencioso.</p>
    `
  },
  {
    id: 2,
    titulo: "Mantenimiento Pro: Cómo limpiar teclados mecánicos y calibrar sensores de mouse",
    slug: "mantenimiento-teclado-mouse-gamer",
    fecha: "05 de Septiembre, 2026",
    autor: "Servicio Técnico Level-Up",
    categoria: "Periféricos & Cuidado",
    imagen: "assets/img/blog/mantenimiento.jpg",
    resumen: "Aprende a desarmar tus keycaps, lubricar switches mecánicos y mantener la lente del sensor óptico en óptimas condiciones de precisión.",
    contenido: `
      <p>El polvo, la grasa de los dedos y las partículas ambientales pueden arruinar la precisión de un sensor óptico y volver pegajosos los switches de tu teclado mecánico.</p>
      <h3>1. Limpieza de Keycaps</h3>
      <p>Retira las teclas utilizando un extractor de alambre y sumérgelas en agua tibia con jabón neutro durante 30 minutos. Déjalas secar al aire libre sobre una toalla limpia antes de volver a instalarlas.</p>
      <h3>2. Cuidado del Sensor Óptico</h3>
      <p>Limpia la lente del sensor de tu mouse con un hisopo de algodón humedecido ligeramente en alcohol isopropílico. Evita frotar con fuerza para no rayar el prisma óptico.</p>
      <h3>3. Desgaste de los Skates o Glides</h3>
      <p>Si notas resistencia en el desplazamiento sobre tu mousepad, reemplaza los deslizadores por skates de PTFE puro para recuperar la fluidez original.</p>
    `
  }
];

const INITIAL_COUPONS = [
  { codigo: "DUOC2026", porcentaje: 20, descripcion: "20% de descuento de por vida para estudiantes y docentes Duoc UC" },
  { codigo: "LEVELUP20", porcentaje: 20, descripcion: "20% de descuento oficial de lanzamiento Level-Up Gamer" },
  { codigo: "GAMER10", porcentaje: 10, descripcion: "10% de descuento en periféricos y accesorios" }
];

// Exportar a window/global
if (typeof window !== 'undefined') {
  window.Producto = Producto;
  window.Usuario = Usuario;
  window.REGIONES_CHILE = REGIONES_CHILE;
  window.INITIAL_CATEGORIES = INITIAL_CATEGORIES;
  window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
  window.INITIAL_USERS = INITIAL_USERS;
  window.INITIAL_BLOGS = INITIAL_BLOGS;
  window.INITIAL_COUPONS = INITIAL_COUPONS;
  window.getRelativeRoot = getRelativeRoot;
  window.resolverRutaImagen = resolverRutaImagen;
}
if (typeof global !== 'undefined') {
  global.Producto = Producto;
  global.Usuario = Usuario;
  global.REGIONES_CHILE = REGIONES_CHILE;
  global.INITIAL_CATEGORIES = INITIAL_CATEGORIES;
  global.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
  global.INITIAL_USERS = INITIAL_USERS;
  global.INITIAL_BLOGS = INITIAL_BLOGS;
  global.INITIAL_COUPONS = INITIAL_COUPONS;
  global.getRelativeRoot = getRelativeRoot;
  global.resolverRutaImagen = resolverRutaImagen;
}


