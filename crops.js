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
        detalle: '2–3 semillas por golpe, cada ~1 m sobre el surco o camellón. Riega bien: el suelo debe quedar húmedo.' },
      { id: 'fondo',      day: 0,  cat: 'fertilizacion',  titulo: 'Abonado de fondo',
        detalle: 'Aplica al pie de siembra. El fósforo va todo al inicio.',
        dose: [{ producto: 'fórmula 15-30-8', gPlanta: 122 }, { producto: 'sulfato de potasio', gPlanta: 9.5 }] },
      { id: 'raleo',      day: 5,  cat: 'manejo',         titulo: 'Raleo de plantas',
        detalle: 'Deja 1 sola planta vigorosa por golpe. Elimina las débiles.' },
      { id: 'deshierbe1', day: 7,  cat: 'manejo',         titulo: 'Deshierbe temprano',
        detalle: 'Las primeras semanas son críticas. Mantén limpio hasta que la guía cubra el suelo.' },
      { id: 'diabrotica', day: 10, cat: 'plaga',          titulo: 'Vigila Diabrotica (chinillas)',
        detalle: 'Umbral de acción: ≥2 adultos por planta en las 3 primeras semanas.' },
      { id: 'poda',       day: 25, cat: 'manejo',         titulo: 'Poda de guía',
        detalle: 'Despunta la guía principal a ~1.20 m para estimular ramas laterales y flores hembra.' },
      { id: 'urea1',      day: 35, cat: 'fertilizacion',  titulo: '1er abonado de urea',
        detalle: 'Reparte al pie con el suelo húmedo.',
        dose: [{ producto: 'urea', gPlanta: 20 }] },
      { id: 'floracion',  day: 40, cat: 'polinizacion',   titulo: 'Floración — polinizadores',
        detalle: 'Pon 2–3 colmenas/ha si no hay abejas silvestres. NO fumigues insecticida por la mañana: matarías a las abejas.' },
      { id: 'urea2',      day: 45, cat: 'fertilizacion',  titulo: '2do abonado de urea (flor femenina)',
        detalle: 'Momento de flor femenina. No te excedas de nitrógeno: mucho N = mucha hoja y poca fruta.',
        dose: [{ producto: 'urea', gPlanta: 20 }] },
      { id: 'diaphania',  day: 45, cat: 'plaga',          titulo: 'Vigila Diaphania (gusano del melón)',
        detalle: 'Umbral: ≥1 larva por cada 5 guías, o ≥10 larvas en 50 hojas. Usa Bacillus thuringiensis (Bt) si lo supera.' },
      { id: 'riegocuaje', day: 50, cat: 'riego',          titulo: 'Riego parejo en el cuaje',
        detalle: 'El llenado del fruto necesita agua constante. El estrés hídrico aquí aborta flores y frutos.' },
      { id: 'raleofruto', day: 60, cat: 'manejo',         titulo: 'Raleo de frutos (opcional)',
        detalle: 'Deja 2–4 frutos por planta para mejor tamaño. Voltéalos sobre paja o plástico para que no se pudra la cara del suelo.' },
      { id: 'secar',      day: 75, cat: 'riego',          titulo: 'Reduce el riego (maduración)',
        detalle: 'Empieza a secar el cultivo. Menos agua ahora = mejor calidad y mejor guarda.' },
      { id: 'potasio',    day: 75, cat: 'fertilizacion',  titulo: 'Potasio de llenado',
        detalle: 'El 30% restante del potasio, para el llenado del fruto.',
        dose: [{ producto: 'sulfato de potasio', gPlanta: 4 }] },
      { id: 'cosecha',    day: 80, cat: 'cosecha',        titulo: 'Ventana de cosecha (abre)',
        detalle: 'Señales: cáscara dura (resiste la uña) + mancha amarilla en la cara del suelo. Corta con 3–5 cm de pedúnculo, en día seco. Sin pedúnculo se pudre.' },
      { id: 'curado',     day: 82, cat: 'poscosecha',     titulo: 'Curado',
        detalle: '8–10 días a ~27–29 °C, ventilado, volteando los frutos. Endurece la cáscara y cicatriza heridas para poder guardar.' },
      { id: 'almacen',    day: 92, cat: 'poscosecha',     titulo: 'Almacenar',
        detalle: 'Guarda a 10–15 °C y 50–75% de humedad, ventilado, sin amontonar. Lejos de frutas con etileno (manzana, banano). Dura 2–6 meses.' },
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
