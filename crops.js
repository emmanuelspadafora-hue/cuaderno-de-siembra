// crops.js — Base de conocimiento del cultivo (el "cerebro" de la app).
// Cada cultivo tiene un calendario de tareas con día relativo a la siembra.
// Las dosis (gramos por planta) están escaladas desde las dosis por hectárea
// de la Guía de Manejo Integrado del Zapallo (IDIAP, Panamá) — ver docs/curso-zapallo.md.
// Para agregar otro cultivo: copia el objeto y edítalo. La app lo toma solo.

const CROPS = [
  {
    id: 'zapallo',
    nombre: 'Zapallo (de guarda)',
    emoji: '🎃',
    cicloCosecha: 80,   // días hasta que abre la ventana de cosecha
    cicloTotal: 92,     // días hasta poder almacenar
    nota: 'Dosis escaladas de la guía IDIAP (~1.700 plantas/ha). Ajusta con un análisis de suelo.',
    // day = días después de la siembra. dose = [{producto, gPlanta}] (gramos por planta).
    tareas: [
      { id: 'siembra',    day: 0,  cat: 'siembra',       titulo: 'Sembrar',
        detalle: 'Coloca 2 o 3 semillas juntas cada ~1 metro, sobre el lomo de tierra. Riega hasta que la tierra quede bien húmeda.' },
      { id: 'fondo',      day: 0,  cat: 'fertilizacion',  titulo: 'Primer abono (al sembrar)',
        detalle: 'Este primer abono lleva todo el fósforo, que ayuda a la planta a hacer raíces fuertes desde el arranque. Ponlo al pie de la semilla.',
        dose: [{ producto: 'fórmula 15-30-8', gPlanta: 122 }, { producto: 'sulfato de potasio', gPlanta: 9.5 }] },
      { id: 'raleo',      day: 5,  cat: 'manejo',         titulo: 'Dejar una sola planta (raleo)',
        detalle: 'Cuando nazcan, deja solo la plantita más fuerte de cada grupo y quita las demás. Así no compiten por agua y comida.' },
      { id: 'deshierbe1', day: 7,  cat: 'manejo',         titulo: 'Sacar las malezas',
        detalle: 'Arranca las malezas ahora: las primeras semanas son las que más importan, hasta que la planta cubra el suelo con sus hojas.' },
      { id: 'diabrotica', day: 10, cat: 'plaga',          titulo: 'Revisar escarabajitos (Diabrotica)',
        detalle: 'Un escarabajito amarillo con rayas (la "chinilla") se come las plantitas. Revisa: si ves 2 o más por planta en estas 3 primeras semanas, conviene controlarlo.' },
      { id: 'poda',       day: 25, cat: 'manejo',         titulo: 'Cortar la punta de la rama (poda)',
        detalle: 'Corta la punta de la rama principal cuando llegue a ~1.20 m. Suena raro, pero hace que salgan más ramas y más flores hembra (las que dan fruto).' },
      { id: 'urea1',      day: 35, cat: 'fertilizacion',  titulo: 'Segundo abono (urea)',
        detalle: 'Ahora toca nitrógeno (con urea), que empuja el crecimiento de hojas y ramas. Espárcelo alrededor de la planta, con la tierra húmeda.',
        dose: [{ producto: 'urea', gPlanta: 20 }] },
      { id: 'floracion',  day: 40, cat: 'polinizacion',   titulo: 'Empiezan las flores — cuida las abejas',
        detalle: 'Aparecen las flores. Necesitas abejas para que haya fruta: llevan el polen de una flor a otra. Si hay pocas, pon colmenas cerca. Muy importante: NO apliques insecticida por la mañana, que es cuando trabajan las abejas.' },
      { id: 'urea2',      day: 45, cat: 'fertilizacion',  titulo: 'Tercer abono (urea, en floración)',
        detalle: 'Otro poco de nitrógeno, ahora que salen las flores que dan fruto. No te pases: demasiado nitrógeno da mucha hoja y poca fruta.',
        dose: [{ producto: 'urea', gPlanta: 20 }] },
      { id: 'diaphania',  day: 45, cat: 'plaga',          titulo: 'Revisar el gusano de las hojas (Diaphania)',
        detalle: 'Un gusano verde con rayas se come las hojas y agujerea el fruto. Revisa; si hay muchos, usa Bacillus thuringiensis (Bt), un control biológico que no daña a las abejas.' },
      { id: 'riegocuaje', day: 50, cat: 'riego',          titulo: 'Regar parejo (se llenan los frutos)',
        detalle: 'Riega seguido y sin faltas: en esta etapa la planta está llenando los frutos, y si le falta agua, los bota.' },
      { id: 'raleofruto', day: 60, cat: 'manejo',         titulo: 'Frutos por planta + cama seca',
        detalle: 'Si buscas MÁXIMO RENDIMIENTO (más kilos), NO quites frutos: deja que la planta cargue todo lo que pueda llenar. Solo si buscas frutos GRANDES individuales, deja 2 a 4 por planta. En ambos casos, pon paja o plástico debajo del fruto para que no se pudra la parte que toca el suelo.' },
      { id: 'secar',      day: 75, cat: 'riego',          titulo: 'Regar menos (ya está madurando)',
        detalle: 'Empieza a regar menos. El zapallo ya madura, y menos agua ahora significa fruta de mejor calidad que se guarda por más tiempo.' },
      { id: 'potasio',    day: 75, cat: 'fertilizacion',  titulo: 'Último abono (potasio)',
        detalle: 'El potasio ayuda a que el fruto termine de llenarse y aguante meses guardado sin dañarse. Aplica lo que faltaba.',
        dose: [{ producto: 'sulfato de potasio', gPlanta: 4 }] },
      { id: 'cosecha',    day: 80, cat: 'cosecha',        titulo: 'Ya se puede cosechar',
        detalle: 'Está listo cuando: la cáscara está tan dura que no la marcas con la uña, y la parte que toca el suelo se puso amarilla. Córtalo dejándole un pedacito de tallo (el "rabito", de 3 a 5 cm): sin él se pudre. Hazlo en un día seco.' },
      { id: 'curado',     day: 82, cat: 'poscosecha',     titulo: 'Curado (secar los zapallos al calor)',
        detalle: 'Curar es dejar los zapallos cosechados al calor y aire seco unos 8 a 10 días (idealmente 27–29 °C) antes de guardarlos. Esto endurece la cáscara y cierra las heridas, para que aguanten meses sin pudrirse. Voltéalos de vez en cuando.' },
      { id: 'almacen',    day: 92, cat: 'poscosecha',     titulo: 'Guardar los zapallos',
        detalle: 'Guárdalos en un lugar fresco (10–15 °C), aireado y no muy húmedo, sin amontonarlos. Lejos de manzanas y bananos (sueltan un gas, el etileno, que los pudre antes). Así duran de 2 a 6 meses.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// ESPACIO PARA MÁS RUBROS (sandía, melón, tomate, etc.)
// Copia esta plantilla dentro del array CROPS de arriba y complétala. La app la
// toma sola: aparece en el selector de "Nueva siembra" y genera su calendario.
//
//   {
//     id: 'sandia',
//     nombre: 'Sandía',
//     emoji: '🍉',
//     cicloCosecha: 80,
//     cicloTotal: 85,
//     nota: 'Pendiente de cargar dosis y calendario propios.',
//     tareas: [
//       { id: 'siembra', day: 0, cat: 'siembra',      titulo: 'Sembrar',        detalle: '…' },
//       { id: 'fondo',   day: 0, cat: 'fertilizacion',titulo: 'Abonado de fondo',detalle: '…',
//         dose: [{ producto: 'fórmula X', gPlanta: 0 }] },
//       // … agrega el resto de las tareas con su día relativo a la siembra …
//     ],
//   },
//
// Reglas: 'day' = días después de la siembra · 'cat' debe existir en CATS (abajo)
// · 'dose' es opcional y va en gramos por planta.
// ---------------------------------------------------------------------------

// Metadatos visuales de cada categoría de tarea.
const CATS = {
  siembra:      { label: 'Siembra',      icon: '🌱', color: '#2e7d32' },
  fertilizacion:{ label: 'Fertilización',icon: '🧪', color: '#b45309' },
  riego:        { label: 'Riego',        icon: '💧', color: '#0288d1' },
  manejo:       { label: 'Manejo',       icon: '🌿', color: '#059669' },
  plaga:        { label: 'Plaga',        icon: '🐛', color: '#dc2626' },
  polinizacion: { label: 'Polinización', icon: '🐝', color: '#d97706' },
  cosecha:      { label: 'Cosecha',      icon: '🎃', color: '#ea580c' },
  poscosecha:   { label: 'Poscosecha',   icon: '📦', color: '#7c3aed' },
};
