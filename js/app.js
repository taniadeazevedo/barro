'use strict';

async function cargarProductos() {
  const respuesta = await fetch('json/productos.json');
  const productos = await respuesta.json();
  return productos;
}

function pintarCatalogo(productos) {
  const catalogo = document.querySelector('#catalogo');
  catalogo.innerHTML = '';

  for (const producto of productos) {
    const col = document.createElement('div');
    col.className = 'col';

const precio = producto.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

    col.innerHTML = `
      <article class="card h-100 border-0 shadow-sm">
        <div class="ratio ratio-4x3 bg-secondary-subtle rounded-top"></div>
        <div class="card-body">
          <p class="text-uppercase small text-body-secondary mb-1">${producto.categoria}</p>
          <h3 class="h5">${producto.nombre}</h3>
          <p class="mb-0">${producto.descripcion}</p>
        </div>
        <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
          <strong>${precio}</strong>
          <button class="btn btn-arcilla btn-sm">Añadir</button>
        </div>
      </article>`;

    catalogo.appendChild(col);
  }
}

async function iniciar() {
  try {
    const productos = await cargarProductos();
    pintarCatalogo(productos);
  } catch (error) {
    console.error('No se pudo cargar el catálogo:', error);
    document.querySelector('#catalogo').innerHTML =
      '<p class="text-danger">No se pudo cargar el catálogo.</p>';
  }
}

window.addEventListener('DOMContentLoaded', iniciar);