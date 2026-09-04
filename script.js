/* ==========================================================================
   SCRIPT.JS — Lógica interactiva del sitio Instituto La Salle
   Todas las variables, funciones y parámetros están nombrados en español
   para que el código sea fácil de leer y mantener.

   Este archivo se divide en 5 bloques:
   1. Login: cambio de rol (estudiante / docente / admin)
   2. Panel lateral: cambiar entre vistas (notas, matrículas, docentes...)
   3. Notas: tabla editable con cálculo automático de promedio
   4. Matrículas: tabla filtrable por grado y buscador por nombre
   5. Directorio de docentes: tabla filtrable por área
   ========================================================================== */


/* ==========================================================================
   1. LOGIN: cambio de rol
   Cuando el usuario hace clic en una pestaña (Estudiante/Docente/Admin),
   cambiamos el texto del campo de identificación y el placeholder,
   para que el formulario "se adapte" al rol elegido.
   ========================================================================== */

// Todas las pestañas de rol (botones con clase .tab)
const pestañas = document.querySelectorAll('.tab');

// Elementos del formulario que cambian según el rol seleccionado
const etiquetaId = document.getElementById('etiquetaId'); // <label> del campo (ej: "Código de estudiante")
const campoId = document.getElementById('campoId');       // <input> donde el usuario escribe su código
const nombreRol = document.getElementById('nombreRol');   // texto que muestra el rol actual en el formulario

// Configuración de texto para cada rol: qué mostrar en la etiqueta y en el placeholder
const configuracionRoles = {
  estudiante: {etiqueta:'Código de estudiante', marcador:'Ej: LS-2026-0348'},
  docente: {etiqueta:'Código de docente', marcador:'Ej: DOC-0057'},
  admin: {etiqueta:'Usuario administrativo', marcador:'Ej: admin.secretaria'}
};

// Por cada pestaña, agregamos un "escuchador" de clic
pestañas.forEach(pestaña=>{
  pestaña.addEventListener('click', ()=>{
    // Quitamos la clase "active" de todas las pestañas...
    pestañas.forEach(p=>p.classList.remove('active'));
    // ...y se la ponemos solo a la que se acaba de clickear (efecto visual de seleccionada)
    pestaña.classList.add('active');

    // Leemos el rol guardado en el atributo data-role="..." del botón clickeado
    const rol = pestaña.dataset.role;

    // Actualizamos el formulario con la configuración de ese rol
    etiquetaId.textContent = configuracionRoles[rol].etiqueta;
    campoId.placeholder = configuracionRoles[rol].marcador;
    nombreRol.textContent = rol;
  });
});

// Cuando se envía el formulario de login (botón "Ingresar")...
document.getElementById('formularioIngreso').addEventListener('submit', (evento)=>{
  evento.preventDefault(); // evitamos que la página se recargue (comportamiento por defecto de un <form>)
  // Como es una demo sin backend real, simplemente desplazamos la pantalla
  // suavemente hasta la sección del panel (#panel), simulando "haber iniciado sesión"
  document.getElementById('panel').scrollIntoView({behavior:'smooth'});
});


/* ==========================================================================
   2. PANEL LATERAL (barra lateral)
   El panel tiene varias "vistas" (notas, matrículas, docentes, etc.)
   pero solo se muestra una a la vez. Los botones del menú lateral
   controlan cuál vista está visible.
   ========================================================================== */

const botonesLaterales = document.querySelectorAll('.side-btn'); // botones del menú lateral
const vistasPanel = document.querySelectorAll('.panel-view');    // bloques de contenido (uno por vista)

botonesLaterales.forEach(boton=>{
  boton.addEventListener('click', ()=>{
    // Marcamos visualmente solo el botón que se clickeó como "activo"
    botonesLaterales.forEach(b=>b.classList.remove('active'));
    boton.classList.add('active');

    // data-view indica qué vista debe mostrarse (ej: "notas", "matriculas"...)
    const vista = boton.dataset.view;

    // Recorremos todas las vistas: solo se le agrega la clase "active"
    // (que las hace visibles vía CSS) a la que coincide con el botón elegido
    vistasPanel.forEach(v=>v.classList.toggle('active', v.dataset.panel===vista));
  });
});


/* ==========================================================================
   3. NOTAS: tabla editable con cálculo automático de promedio
   Los datos de las asignaturas viven en un array en memoria (no hay backend).
   Cada vez que el usuario edita una nota, se recalcula el promedio
   de esa asignatura y el promedio general del boletín.
   ========================================================================== */

// "Base de datos" temporal de asignaturas con sus notas por corte (c1, c2, c3)
const asignaturas = [
  {nombre:'Matemáticas', c1:4.2, c2:3.8, c3:4.0},
  {nombre:'Lengua Castellana', c1:4.5, c2:4.6, c3:4.3},
  {nombre:'Ciencias Naturales', c1:3.9, c2:3.5, c3:4.1},
  {nombre:'Ciencias Sociales', c1:4.0, c2:4.2, c3:3.9},
  {nombre:'Inglés', c1:3.6, c2:3.2, c3:3.8},
  {nombre:'Tecnología e Informática', c1:4.7, c2:4.8, c3:4.9},
  {nombre:'Educación Física', c1:4.5, c2:4.5, c3:4.6},
  {nombre:'Ética y Valores', c1:4.8, c2:4.9, c3:4.7},
];

// <tbody> de la tabla de notas, donde se insertan las filas dinámicamente
const cuerpoTablaNotas = document.querySelector('#tablaNotas tbody');

// Devuelve una "etiqueta" (pill) de color según el valor de la nota definitiva
function obtenerEtiquetaEstado(nota){
  if(nota>=4.0) return '<span class="pill pill-verde">Superior</span>';   // nota alta -> verde
  if(nota>=3.0) return '<span class="pill pill-dorado">Aceptable</span>'; // nota media -> dorado
  return '<span class="pill pill-rojo">Bajo</span>';                     // nota baja -> rojo
}

// Dibuja (o vuelve a dibujar) todas las filas de la tabla de notas
function renderizarNotas(){
  cuerpoTablaNotas.innerHTML = ''; // limpiamos la tabla antes de reconstruirla

  asignaturas.forEach((asignatura, indice)=>{
    // Nota definitiva = promedio simple de los 3 cortes
    const notaDefinitiva = ((asignatura.c1 + asignatura.c2 + asignatura.c3) / 3);

    // Creamos una fila <tr> con: nombre, 3 inputs editables, nota definitiva y pill de estado
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${asignatura.nombre}</td>
      <td><input class="grade-input mono" type="number" min="1" max="5" step="0.1" value="${asignatura.c1.toFixed(1)}" data-indice="${indice}" data-corte="c1"></td>
      <td><input class="grade-input mono" type="number" min="1" max="5" step="0.1" value="${asignatura.c2.toFixed(1)}" data-indice="${indice}" data-corte="c2"></td>
      <td><input class="grade-input mono" type="number" min="1" max="5" step="0.1" value="${asignatura.c3.toFixed(1)}" data-indice="${indice}" data-corte="c3"></td>
      <td class="mono" style="font-weight:700;">${notaDefinitiva.toFixed(1)}</td>
      <td>${obtenerEtiquetaEstado(notaDefinitiva)}</td>`;
    // data-indice guarda la posición del arreglo y data-corte cuál de los 3 cortes es,
    // así luego sabemos qué valor actualizar cuando el usuario edite el input.

    cuerpoTablaNotas.appendChild(fila);
  });

  actualizarPromedioGeneral(); // tras redibujar, recalculamos el promedio general del boletín
}

// Calcula y muestra el promedio general (de todas las asignaturas) y su estado textual
function actualizarPromedioGeneral(){
  // Promedio definitivo de cada asignatura
  const definitivas = asignaturas.map(asignatura => (asignatura.c1+asignatura.c2+asignatura.c3)/3);
  // Promedio general = promedio de todos los promedios definitivos
  const promedio = definitivas.reduce((suma,valor)=>suma+valor,0) / definitivas.length;

  document.getElementById('promedioGeneral').textContent = promedio.toFixed(2);

  const estadoPromedio = document.getElementById('estadoPromedio');
  if(promedio>=4.0){ estadoPromedio.textContent='Superior'; estadoPromedio.style.color='var(--verde-sierra-2)'; }
  else if(promedio>=3.0){ estadoPromedio.textContent='Aprobado'; estadoPromedio.style.color='#946e00'; }
  else { estadoPromedio.textContent='En riesgo'; estadoPromedio.style.color='var(--rojo-alerta)'; }
}

// Escuchamos el evento "input" en TODA la tabla (delegación de eventos),
// en vez de poner un listener en cada input individual.
cuerpoTablaNotas.addEventListener('input', (evento)=>{
  // Si el elemento editado no es un input de nota, ignoramos el evento
  if(!evento.target.classList.contains('grade-input')) return;

  // Recuperamos a qué asignatura (indice) y a qué corte (c1/c2/c3) pertenece el input editado
  const indice = evento.target.dataset.indice, corte = evento.target.dataset.corte;

  // Convertimos el valor escrito a número; si no es válido, usamos 0
  let valor = parseFloat(evento.target.value);
  if(isNaN(valor)) valor = 0;

  // Limitamos la nota entre 1.0 y 5.0 (escala colombiana típica)
  valor = Math.min(5, Math.max(1, valor));

  // Guardamos el nuevo valor en el array de datos
  asignaturas[indice][corte] = valor;

  // Volvemos a dibujar toda la tabla con los datos actualizados
  renderizarNotas();
});

renderizarNotas(); // primer dibujo de la tabla al cargar la página


/* ==========================================================================
   4. MATRÍCULAS: tabla filtrable por grado y por texto de búsqueda
   ========================================================================== */

// Lista simulada de estudiantes matriculados
const matriculas = [
  {nombre:'Ana Rodríguez', grado:'5°', jornada:'Mañana', estado:'Confirmada'},
  {nombre:'Luis Martínez', grado:'9°', jornada:'Mañana', estado:'Confirmada'},
  {nombre:'Sofía Pérez', grado:'Transición', jornada:'Tarde', estado:'Pendiente'},
  {nombre:'Carlos Díaz', grado:'11°', jornada:'Mañana', estado:'Confirmada'},
  {nombre:'Valentina Torres', grado:'3°', jornada:'Tarde', estado:'Pendiente'},
  {nombre:'Andrés Gómez', grado:'7°', jornada:'Mañana', estado:'Confirmada'},
];

const cuerpoTablaMatriculas = document.querySelector('#tablaMatriculas tbody');

// Redibuja la tabla de matrículas aplicando los filtros activos
function renderizarMatriculas(){
  const grado = document.getElementById('filtroGrado').value;                    // grado seleccionado en el <select> (vacío = todos)
  const textoBusqueda = document.getElementById('buscarEstudiante').value.toLowerCase(); // texto escrito en el buscador

  cuerpoTablaMatriculas.innerHTML = '';

  matriculas
    // Se queda solo con los estudiantes que cumplen AMBOS filtros:
    // - coinciden con el grado elegido (o no hay grado elegido)
    // - su nombre contiene el texto buscado
    .filter(estudiante => (!grado || estudiante.grado===grado) && estudiante.nombre.toLowerCase().includes(textoBusqueda))
    .forEach(estudiante=>{
      // Color de la etiqueta de estado: verde si está confirmada, dorado si está pendiente
      const claseEtiqueta = estudiante.estado==='Confirmada' ? 'pill-verde' : 'pill-dorado';
      cuerpoTablaMatriculas.innerHTML += `<tr><td>${estudiante.nombre}</td><td>${estudiante.grado}</td><td>${estudiante.jornada}</td><td><span class="pill ${claseEtiqueta}">${estudiante.estado}</span></td></tr>`;
    });

  // Si el filtro no arrojó resultados, mostramos un mensaje en vez de dejar la tabla vacía
  if(!cuerpoTablaMatriculas.innerHTML) cuerpoTablaMatriculas.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--tinta-suave);padding:24px;">No se encontraron estudiantes con ese filtro.</td></tr>';
}

// Cada vez que cambia el <select> de grado, o el usuario escribe en el buscador, se refiltra
document.getElementById('filtroGrado').addEventListener('change', renderizarMatriculas);
document.getElementById('buscarEstudiante').addEventListener('input', renderizarMatriculas);

renderizarMatriculas(); // primer dibujo al cargar la página


/* ==========================================================================
   5. DIRECTORIO DE DOCENTES: tabla filtrable por área
   ========================================================================== */

// Lista simulada de docentes
const docentes = [
  {nombre:'Prof. Marta Ibáñez', area:'Matemáticas', cursos:'8°, 9°, 10°'},
  {nombre:'Prof. Jorge Salcedo', area:'Ciencias', cursos:'6°, 7°'},
  {nombre:'Prof. Diana Cantillo', area:'Humanidades', cursos:'9°, 11°'},
  {nombre:'Prof. Rafael Noriega', area:'Tecnología', cursos:'Primaria y Secundaria'},
  {nombre:'Prof. Lucía Barros', area:'Ética y valores', cursos:'Todos los grados'},
];

const cuerpoTablaDocentes = document.querySelector('#tablaDocentes tbody');

// Redibuja la tabla de docentes según el área seleccionada
function renderizarDocentes(){
  const area = document.getElementById('filtroArea').value; // área elegida en el <select> (vacío = todas)

  cuerpoTablaDocentes.innerHTML = '';

  docentes
    .filter(docente => !area || docente.area===area) // solo docentes del área elegida (o todos si no hay filtro)
    .forEach(docente=>{
      cuerpoTablaDocentes.innerHTML += `<tr><td>${docente.nombre}</td><td>${docente.area}</td><td>${docente.cursos}</td></tr>`;
    });
}

document.getElementById('filtroArea').addEventListener('change', renderizarDocentes);

renderizarDocentes(); // primer dibujo al cargar la página
