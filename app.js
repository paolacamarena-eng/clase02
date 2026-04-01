const API_BASE = 'http://127.0.0.1:8000';
const protectedTabs = ['servicios', 'mascotas', 'reporte'];
const state = {
  usuario: null,
};

const navLinks = document.querySelectorAll('.sidebar-nav a[data-tab]');
const sections = document.querySelectorAll('main section');
const badgeEmail = document.querySelector('.user-badge strong');
const logoutButton = document.querySelector('.sidebar-footer button');
const saludoForm = document.querySelector('#saludo-form');
const registroForm = document.querySelector('#registro-form');
const loginForm = document.querySelector('#login-form');
const servicioForm = document.querySelector('#servicio-form');
const mascotaForm = document.querySelector('#mascota-form');
const busquedaMascotasForm = document.querySelector('#busqueda-mascotas-form');
const reporteForm = document.querySelector('#reporte-form');
const servicioSelect = document.querySelector('#mascota-servicio');
const serviciosLista = document.querySelector('#lista-servicios ul');
const mascotasSection = document.querySelector('#mascotas');
const reporteResultados = document.querySelector('#reporte-resultados');

function init() {
  navLinks.forEach((link) => {
    link.addEventListener('click', handleTabClick);
  });

  logoutButton.addEventListener('click', logout);
  saludoForm.addEventListener('submit', handleSaludoSubmit);
  registroForm.addEventListener('submit', handleRegistroSubmit);
  loginForm.addEventListener('submit', handleLoginSubmit);
  servicioForm.addEventListener('submit', handleServicioSubmit);
  mascotaForm.addEventListener('submit', handleMascotaSubmit);
  busquedaMascotasForm.addEventListener('submit', handleMascotaSearchSubmit);
  reporteForm.addEventListener('submit', handleReporteSubmit);

  logoutButton.style.display = 'none';
  lockProtectedTabs();
  setActiveNav('inicio');
  loadServicios();
  ensureMascotaCardsContainer();
}

function handleTabClick(event) {
  event.preventDefault();
  const tab = event.currentTarget.dataset.tab;
  switchTab(tab);
}

function switchTab(name) {
  const targetSection = document.getElementById(name);
  if (!targetSection) {
    return;
  }

  if (protectedTabs.includes(name) && !state.usuario) {
    return;
  }

  sections.forEach((section) => section.classList.remove('active'));
  targetSection.classList.add('active');
  setActiveNav(name);

  if (name === 'servicios') {
    loadServicios();
  }

  if (name === 'reporte' && state.usuario) {
    const correoInput = reporteForm.querySelector('#reporte-correo');
    correoInput.value = state.usuario;
    loadReporte(state.usuario);
  }
}

function setActiveNav(name) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.tab === name);
  });
}

function lockProtectedTabs() {
  navLinks.forEach((link) => {
    if (protectedTabs.includes(link.dataset.tab)) {
      link.classList.add('locked');
    }
  });
}

function unlockProtectedTabs() {
  navLinks.forEach((link) => {
    if (protectedTabs.includes(link.dataset.tab)) {
      link.classList.remove('locked');
    }
  });
}

function setLoggedInUser(correo) {
  state.usuario = correo;
  badgeEmail.textContent = correo;
  logoutButton.style.display = '';
  unlockProtectedTabs();
}

function logout() {
  state.usuario = null;
  badgeEmail.textContent = 'PetOwner';
  logoutButton.style.display = 'none';
  lockProtectedTabs();
  clearReportResults();
  clearMascotaCards();
  switchTab('acceso');
}

function showAlert(container, message, type = 'success') {
  const existing = container.querySelector('.alert-success, .alert-error');
  if (existing) {
    existing.remove();
  }

  const alert = document.createElement('div');
  alert.className = type === 'success' ? 'alert-success' : 'alert-error';
  alert.textContent = message;
  container.prepend(alert);

  setTimeout(() => {
    alert.remove();
  }, 4200);
}

function handleSaludoSubmit(event) {
  event.preventDefault();
  const nombre = saludoForm.querySelector('#saludo-nombre').value.trim();

  if (!nombre) {
    showAlert(saludoForm, 'Por favor ingresa tu nombre.', 'error');
    return;
  }

  fetch(`${API_BASE}/bienvenido/${encodeURIComponent(nombre)}`)
    .then(handleResponse)
    .then((data) => {
      showAlert(saludoForm, data.mensaje || `Bienvenido, ${nombre}!`, 'success');
      saludoForm.reset();
    })
    .catch((error) => {
      showAlert(saludoForm, error.message || 'No se pudo obtener la bienvenida.', 'error');
    });
}

function handleRegistroSubmit(event) {
  event.preventDefault();
  const correo = registroForm.querySelector('#registro-email').value.trim();
  const contrasena = registroForm.querySelector('#registro-password').value.trim();

  if (!correo || !contrasena) {
    showAlert(registroForm, 'Completa correo y contraseña.', 'error');
    return;
  }

  fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  })
    .then(handleResponse)
    .then((data) => {
      showAlert(registroForm, data.mensaje || 'Registro exitoso.', 'success');
      registroForm.reset();
    })
    .catch((error) => {
      showAlert(registroForm, error.message || 'No fue posible registrarse.', 'error');
    });
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const correo = loginForm.querySelector('#login-email').value.trim();
  const contrasena = loginForm.querySelector('#login-password').value.trim();

  if (!correo || !contrasena) {
    showAlert(loginForm, 'Completa correo y contraseña.', 'error');
    return;
  }

  fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  })
    .then(handleResponse)
    .then((data) => {
      setLoggedInUser(correo);
      showAlert(loginForm, data.mensaje || 'Inicio de sesión exitoso.', 'success');
      switchTab('servicios');
    })
    .catch((error) => {
      showAlert(loginForm, error.message || 'Credenciales incorrectas.', 'error');
    });
}

function handleServicioSubmit(event) {
  event.preventDefault();
  const nombre = servicioForm.querySelector('#servicio-nombre').value.trim();
  const precio = servicioForm.querySelector('#servicio-precio').value.trim();

  if (!nombre || !precio) {
    showAlert(servicioForm, 'Completa el nombre y precio del servicio.', 'error');
    return;
  }

  fetch(`${API_BASE}/agregar-servicio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precio: Number(precio) }),
  })
    .then(handleResponse)
    .then((data) => {
      showAlert(servicioForm, data.mensaje || 'Servicio agregado correctamente.', 'success');
      servicioForm.reset();
      loadServicios();
    })
    .catch((error) => {
      showAlert(servicioForm, error.message || 'No se pudo agregar el servicio.', 'error');
    });
}

function handleMascotaSubmit(event) {
  event.preventDefault();
  if (!state.usuario) {
    showAlert(mascotaForm, 'Debes iniciar sesión para registrar mascotas.', 'error');
    return;
  }

  const correo = mascotaForm.querySelector('#mascota-correo').value.trim();
  const nombre = mascotaForm.querySelector('#mascota-nombre').value.trim();
  const tipo_servicio = mascotaForm.querySelector('#mascota-servicio').value;
  const fecha = mascotaForm.querySelector('#mascota-fecha').value;

  if (!correo || !nombre || !tipo_servicio || !fecha) {
    showAlert(mascotaForm, 'Completa todos los campos de la mascota.', 'error');
    return;
  }

  fetch(`${API_BASE}/registrar-mascota`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, nombre, tipo_servicio, fecha }),
  })
    .then(handleResponse)
    .then((data) => {
      showAlert(mascotaForm, data.mensaje || 'Mascota registrada correctamente.', 'success');
      mascotaForm.reset();
      clearMascotaCards();
    })
    .catch((error) => {
      showAlert(mascotaForm, error.message || 'No se pudo registrar la mascota.', 'error');
    });
}

function handleMascotaSearchSubmit(event) {
  event.preventDefault();
  const correo = busquedaMascotasForm.querySelector('#busqueda-mascotas').value.trim();

  if (!correo) {
    showAlert(busquedaMascotasForm, 'Ingresa un correo para buscar mascotas.', 'error');
    return;
  }

  fetch(`${API_BASE}/mascotas/${encodeURIComponent(correo)}`)
    .then(handleResponse)
    .then((data) => {
      renderMascotaCards(data.mascotas || []);
    })
    .catch((error) => {
      showAlert(busquedaMascotasForm, error.message || 'No se pudo buscar las mascotas.', 'error');
    });
}

function handleReporteSubmit(event) {
  event.preventDefault();
  const correo = reporteForm.querySelector('#reporte-correo').value.trim();

  if (!correo) {
    showAlert(reporteForm, 'Ingresa un correo para generar el reporte.', 'error');
    return;
  }

  loadReporte(correo);
}

function loadServicios() {
  fetch(`${API_BASE}/servicios`)
    .then(handleResponse)
    .then((data) => {
      renderServicios(data.servicios || []);
    })
    .catch(() => {
      renderServicios([]);
    });
}

function loadReporte(correo) {
  fetch(`${API_BASE}/reporte/${encodeURIComponent(correo)}`)
    .then(handleResponse)
    .then((data) => {
      renderReporte(data);
    })
    .catch((error) => {
      showAlert(reporteForm, error.message || 'No se pudo generar el reporte.', 'error');
    });
}

function renderServicios(servicios) {
  serviciosLista.innerHTML = '';
  servicioSelect.innerHTML = '<option value="">Seleccione un servicio</option>';

  if (!servicios.length) {
    serviciosLista.innerHTML = '<li>No hay servicios registrados.</li>';
    return;
  }

  servicios.forEach((servicio) => {
    const item = document.createElement('li');
    item.textContent = `${servicio.nombre} - $${servicio.precio}`;
    serviciosLista.appendChild(item);

    const option = document.createElement('option');
    option.value = servicio.nombre;
    option.textContent = servicio.nombre;
    servicioSelect.appendChild(option);
  });
}

function ensureMascotaCardsContainer() {
  if (!document.querySelector('#mascota-cards')) {
    const container = document.createElement('div');
    container.id = 'mascota-cards';
    container.style.display = 'grid';
    container.style.gap = '1rem';
    container.style.marginTop = '1rem';
    mascotasSection.appendChild(container);
  }
}

function renderMascotaCards(mascotas) {
  const container = document.querySelector('#mascota-cards');
  container.innerHTML = '';

  if (!mascotas.length) {
    container.innerHTML = '<div class="card"><p>No se encontraron mascotas para ese correo.</p></div>';
    return;
  }

  mascotas.forEach((mascota) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${mascota.nombre}</h3>
      <p><strong>Correo:</strong> ${mascota.correo || ''}</p>
      <p><strong>Servicio:</strong> ${mascota.tipo_servicio || mascota.servicio || 'N/A'}</p>
      <p><strong>Fecha:</strong> ${mascota.fecha || 'N/A'}</p>
    `;
    container.appendChild(card);
  });
}

function clearMascotaCards() {
  const container = document.querySelector('#mascota-cards');
  if (container) {
    container.innerHTML = '';
  }
}

function renderReporte(data) {
  reporteResultados.innerHTML = '';

  const statGrid = document.createElement('div');
  statGrid.style.display = 'grid';
  statGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
  statGrid.style.gap = '1rem';
  statGrid.style.marginBottom = '1rem';

  const stats = [
    { label: 'Cantidad de servicios', value: data.cantidad_servicios ?? 0 },
    { label: 'Total gastado', value: `$${data.total_gastado ?? 0}` },
    { label: 'Correo', value: data.correo || 'N/A' },
  ];

  stats.forEach((stat) => {
    const box = document.createElement('div');
    box.className = 'card';
    box.innerHTML = `
      <strong>${stat.label}</strong>
      <p style="margin: 0.75rem 0 0; font-size: 1.25rem;">${stat.value}</p>
    `;
    statGrid.appendChild(box);
  });

  reporteResultados.appendChild(statGrid);

  const servicesTagContainer = document.createElement('div');
  servicesTagContainer.style.display = 'flex';
  servicesTagContainer.style.flexWrap = 'wrap';
  servicesTagContainer.style.gap = '0.5rem';

  const servicios = data.servicios || [];
  if (!servicios.length) {
    servicesTagContainer.innerHTML = '<p>No se encontraron servicios en el reporte.</p>';
  } else {
    servicios.forEach((servicio) => {
      const tag = document.createElement('span');
      tag.textContent = servicio;
      tag.style.padding = '0.55rem 0.9rem';
      tag.style.borderRadius = '999px';
      tag.style.background = 'rgba(14, 165, 160, 0.12)';
      tag.style.color = '#0f766e';
      tag.style.fontSize = '0.92rem';
      servicesTagContainer.appendChild(tag);
    });
  }

  reporteResultados.appendChild(servicesTagContainer);
}

function clearReportResults() {
  reporteResultados.innerHTML = `
    <h3>Resultados</h3>
    <p>Aquí se mostrarán los resultados de la búsqueda.</p>
  `;
}

function handleResponse(response) {
  return response.text().then((text) => {
    if (!response.ok) {
      const data = text ? JSON.parse(text) : {};
      const errorMessage = data.mensaje || data.detail || text || 'Error en la solicitud';
      throw new Error(errorMessage);
    }
    return text ? JSON.parse(text) : {};
  });
}

init();
