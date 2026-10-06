'use strict';

let todosLosProductos = [];
let categoriaActual = 'Todos';

async function cargarProductos() {
    const respuesta = await fetch('json/productos.json');
    const productos = await respuesta.json();
    return productos;
}

function pintarCatalogo(productos) {
    const catalogo = document.querySelector('#catalogo');
    catalogo.innerHTML = '';

    if (productos.length === 0) {
        catalogo.innerHTML = '<p class="text-body-secondary">No hay productos con ese filtro.</p>';
        return;
    }

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

function pintarFiltros(productos) {
    const contenedor = document.querySelector('#filtros');
    const categorias = ['Todos', ...new Set(productos.map(p => p.categoria))];

    contenedor.innerHTML = '';

    for (const categoria of categorias) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = categoria;
        boton.className = 'btn btn-sm btn-outline-dark';
        boton.dataset.categoria = categoria;
        contenedor.appendChild(boton);
    }

    marcarActivo();
}

function marcarActivo() {
    for (const boton of document.querySelectorAll('#filtros button')) {
        boton.classList.toggle('active', boton.dataset.categoria === categoriaActual);
    }
}

function aplicarFiltros() {
    const texto = document.querySelector('#buscador').value.trim().toLowerCase();

    const filtrados = todosLosProductos.filter(p =>
        (categoriaActual === 'Todos' || p.categoria === categoriaActual) &&
        (p.nombre + ' ' + p.descripcion).toLowerCase().includes(texto)
    );

    pintarCatalogo(filtrados);
}

async function iniciar() {
    try {
        todosLosProductos = await cargarProductos();
        pintarFiltros(todosLosProductos);
        aplicarFiltros();
    } catch (error) {
        console.error('No se pudo cargar el catálogo:', error);
        document.querySelector('#catalogo').innerHTML =
            '<p class="text-danger">No se pudo cargar el catálogo.</p>';
    }

    document.querySelector('#filtros').addEventListener('click', (e) => {
        const boton = e.target.closest('button');
        if (!boton) return;
        categoriaActual = boton.dataset.categoria;
        marcarActivo();
        aplicarFiltros();
    });

    document.querySelector('#buscador').addEventListener('input', aplicarFiltros);
}

window.addEventListener('DOMContentLoaded', iniciar);