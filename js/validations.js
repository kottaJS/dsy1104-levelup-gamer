// Validaciones del sistema


class Validador {
  // Validar RUN chileno (modulo 11)
  static validarRUN(run) {
    if (!run || run.trim() === '') {
      return { valido: false, mensaje: 'El RUN es obligatorio.' };
    }

    run = run.trim().toUpperCase();

    if (run.includes('.') || run.includes('-')) {
      return { valido: false, mensaje: 'El RUN debe ingresarse sin puntos ni guion (ejemplo: 19011029K).' };
    }

    if (run.length < 7 || run.length > 9) {
      return { valido: false, mensaje: 'El RUN debe tener entre 7 y 9 caracteres.' };
    }

    const cuerpo = run.slice(0, -1);
    const dvIngresado = run.slice(-1);

    if (!/^\d+$/.test(cuerpo)) {
      return { valido: false, mensaje: 'El cuerpo del RUN debe contener únicamente números.' };
    }

    // Algoritmo matemático estándar Módulo 11
    let suma = 0;
    let factor = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const resto = 11 - (suma % 11);
    let dvCalculado = '';

    if (resto === 11) {
      dvCalculado = '0';
    } else if (resto === 10) {
      dvCalculado = 'K';
    } else {
      dvCalculado = resto.toString();
    }

    if (dvIngresado !== dvCalculado) {
      return { 
        valido: false, 
        mensaje: 'RUN inválido (el dígito verificador correcto para ese número es ' + dvCalculado + ').' 
      };
    }

    return { valido: true, mensaje: '' };
  }

  
  static validarCorreo(correo) {
    if (!correo || correo.trim() === '') {
      return { valido: false, mensaje: 'El correo electrónico es obligatorio.' };
    }

    correo = correo.trim().toLowerCase();

    if (correo.length > 100) {
      return { valido: false, mensaje: 'El correo no puede tener más de 100 caracteres.' };
    }

    const formatoBasico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoBasico.test(correo)) {
      return { valido: false, mensaje: 'Ingrese un formato de correo válido.' };
    }

    // Dominios permitidos según pauta
    const esDuoc = correo.endsWith('@duoc.cl');
    const esProfesor = correo.endsWith('@profesor.duoc.cl');
    const esGmail = correo.endsWith('@gmail.com');

    if (!esDuoc && !esProfesor && !esGmail) {
      return { 
        valido: false, 
        mensaje: 'Dominio no permitido. Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.' 
      };
    }

    return { valido: true, mensaje: '' };
  }

  
  static validarContrasena(pass) {
    if (!pass) {
      return { valido: false, mensaje: 'La contraseña es obligatoria.' };
    }
    if (pass.length < 4 || pass.length > 20) {
      return { valido: false, mensaje: 'La contraseña debe tener entre 4 y 20 caracteres.' };
    }
    return { valido: true, mensaje: '' };
  }

  
  static validarConfirmacionContrasena(pass, confirmPass) {
    if (!confirmPass) {
      return { valido: false, mensaje: 'Debe confirmar su contraseña.' };
    }
    if (pass !== confirmPass) {
      return { valido: false, mensaje: 'Las contraseñas no coinciden.' };
    }
    return { valido: true, mensaje: '' };
  }

  
  static validarMayorDeEdad(fechaNacimiento) {
    if (!fechaNacimiento) {
      return { valido: false, mensaje: 'La fecha de nacimiento es obligatoria.' };
    }

    const fechaNac = new Date(fechaNacimiento + 'T00:00:00');
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (isNaN(edad) || edad < 18) {
      return { 
        valido: false, 
        mensaje: 'Debes ser mayor de 18 años para registrarte (tienes ' + (isNaN(edad) ? 0 : edad) + ' años).' 
      };
    }

    return { valido: true, mensaje: '' };
  }

  
  static validarTextoRequerido(valor, min = 2, max = 100, nombreCampo = 'campo') {
    if (!valor || valor.trim().length < min) {
      return { valido: false, mensaje: `El ${nombreCampo} debe tener al menos ${min} caracteres.` };
    }
    if (valor.trim().length > max) {
      return { valido: false, mensaje: `El ${nombreCampo} no puede superar los ${max} caracteres.` };
    }
    return { valido: true, mensaje: '' };
  }

  
  static mostrarError(inputElement, mensaje) {
    if (!inputElement) return;
    inputElement.classList.add('is-invalid');
    inputElement.classList.remove('is-valid');

    const feedback = inputElement.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = mensaje;
      feedback.style.display = 'block';
    }
  }

  
  static limpiarError(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');

    const feedback = inputElement.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = '';
      feedback.style.display = 'none';
    }
  }

  
  static mostrarNotificacion(mensaje) {
    if (typeof document === 'undefined' || !document.createElement) return;
    const toast = document.createElement('div');
    toast.className = 'toast-notificacion';
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.remove();
    }, 3000);
  }
}

// Validaciones del sistema
function validarRUN(run) { return Validador.validarRUN(run); }
function validarCorreo(correo) { return Validador.validarCorreo(correo); }
function validarContrasena(pass) { return Validador.validarContrasena(pass); }
function validarConfirmacionContrasena(p1, p2) { return Validador.validarConfirmacionContrasena(p1, p2); }
function validarMayorDeEdad(fecha) { return Validador.validarMayorDeEdad(fecha); }
function validarTextoRequerido(val, min, max, campo) { return Validador.validarTextoRequerido(val, min, max, campo); }
function mostrarError(el, msg) { Validador.mostrarError(el, msg); }
function limpiarError(el) { Validador.limpiarError(el); }
function mostrarNotificacion(msg) { Validador.mostrarNotificacion(msg); }


function cargarRegionesYComunas(idSelectRegion, idSelectComuna, regionSeleccionada, comunaSeleccionada) {
  const selectRegion = document.getElementById(idSelectRegion);
  const selectComuna = document.getElementById(idSelectComuna);

  if (!selectRegion || !selectComuna) return;

  selectRegion.innerHTML = '<option value="">-- Seleccione una región --</option>';
  REGIONES_CHILE.forEach(function(r) {
    const opt = document.createElement('option');
    opt.value = r.nombre;
    opt.textContent = r.nombre;
    if (regionSeleccionada && r.nombre === regionSeleccionada) {
      opt.selected = true;
    }
    selectRegion.appendChild(opt);
  });

  function actualizarComunas(nombreRegion) {
    selectComuna.innerHTML = '<option value="">-- Seleccione una comuna --</option>';
    if (!nombreRegion) {
      selectComuna.disabled = true;
      return;
    }

    const encontrada = REGIONES_CHILE.find(function(r) {
      return r.nombre === nombreRegion;
    });

    if (encontrada) {
      selectComuna.disabled = false;
      encontrada.comunas.forEach(function(c) {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        if (comunaSeleccionada && c === comunaSeleccionada) {
          opt.selected = true;
        }
        selectComuna.appendChild(opt);
      });
    }
  }

  if (selectRegion.value) {
    actualizarComunas(selectRegion.value);
  }

  selectRegion.addEventListener('change', function(e) {
    actualizarComunas(e.target.value);
    limpiarError(selectRegion);
  });
}

if (typeof window !== 'undefined') {
  window.Validador = Validador;
  window.validarRUN = validarRUN;
  window.validarCorreo = validarCorreo;
  window.validarContrasena = validarContrasena;
  window.validarConfirmacionContrasena = validarConfirmacionContrasena;
  window.validarMayorDeEdad = validarMayorDeEdad;
  window.validarTextoRequerido = validarTextoRequerido;
  window.mostrarError = mostrarError;
  window.limpiarError = limpiarError;
  window.mostrarNotificacion = mostrarNotificacion;
  window.cargarRegionesYComunas = cargarRegionesYComunas;
}
if (typeof global !== 'undefined') {
  global.Validador = Validador;
  global.validarRUN = validarRUN;
  global.validarCorreo = validarCorreo;
  global.validarContrasena = validarContrasena;
  global.validarConfirmacionContrasena = validarConfirmacionContrasena;
  global.validarMayorDeEdad = validarMayorDeEdad;
  global.validarTextoRequerido = validarTextoRequerido;
  global.mostrarError = mostrarError;
  global.limpiarError = limpiarError;
  global.mostrarNotificacion = mostrarNotificacion;
  global.cargarRegionesYComunas = cargarRegionesYComunas;
}

