'use strict';

let todosLosProductos = [];
let categoriaActual = 'Todos';

const CLAVE_CARRITO = 'barro-carrito';
let carrito = [];          // [{ id: 1, cantidad: 2 }, ...]
let productoAbierto = null;

async function cargarProductos() {
    const respuesta = await fetch('json/productos.json');
    const productos = await respuesta.json();
    return productos;
}

function formatearPrecio(valor) {
    return valor.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

/* ---------- CARRITO ---------- */

function leerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) ?? [];
    } catch {
        return [];
    }
}

function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function actualizarContador() {
    const unidades = carrito.reduce((total, linea) => total + linea.cantidad, 0);
    document.querySelector('#contadorCarrito').textContent = unidades;
}

function anadirAlCarrito(id) {
    const linea = carrito.find(l => l.id === id);

    if (linea) {
        linea.cantidad++;
    } else {
        carrito.push({ id: id, cantidad: 1 });
    }

    guardarCarrito();
    actualizarContador();
}

/* ---------- CATÁLOGO ---------- */

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

        const precio = formatearPrecio(producto.precio);

        col.innerHTML = `
      <article class="card h-100 border-0 shadow-sm tarjeta" data-id="${producto.id}">
        <div class="ratio ratio-4x3 bg-secondary-subtle rounded-top"></div>
        <div class="card-body">
          <p class="text-uppercase small text-body-secondary mb-1">${producto.categoria}</p>
          <h3 class="h5">${producto.nombre}</h3>
          <p class="mb-0">${producto.descripcion}</p>
        </div>
        <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
          <strong>${precio}</strong>
          <button class="btn btn-arcilla btn-sm btn-anadir">Añadir</button>
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

/* ---------- FICHA DE PRODUCTO ---------- */

function abrirFicha(id) {
    const producto = todosLosProductos.find(p => p.id === id);
    if (!producto) return;

    productoAbierto = producto.id;

    document.querySelector('#modalCategoria').textContent = producto.categoria;
    document.querySelector('#modalTitulo').textContent = producto.nombre;
    document.querySelector('#modalDescripcion').textContent = producto.descripcion;
    document.querySelector('#modalPrecio').textContent = formatearPrecio(producto.precio);

    bootstrap.Modal.getOrCreateInstance(document.querySelector('#modalProducto')).show();
}

/* ---------- ARRANQUE ---------- */

async function iniciar() {
    carrito = leerCarrito();
    actualizarContador();

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

    document.querySelector('#catalogo').addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta');
        if (!tarjeta) return;

        const id = Number(tarjeta.dataset.id);

        if (e.target.closest('.btn-anadir')) {
            anadirAlCarrito(id);
            return;
        }

        abrirFicha(id);
    });

    document.querySelector('#modalAnadir').addEventListener('click', () => {
        anadirAlCarrito(productoAbierto);
        bootstrap.Modal.getInstance(document.querySelector('#modalProducto')).hide();
    });
}

window.addEventListener('DOMContentLoaded', iniciar);