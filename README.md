# 🌱 Cuaderno de Siembra

App web (PWA) personal para **registrar siembras** y recibir **qué hacer cada día**:
cuándo fertilizar y cuánto, cuándo regar menos, cuándo cosechar y cómo curar/guardar.

El "cerebro" es el calendario del cultivo cargado en `crops.js`, derivado del curso
en `docs/curso-zapallo.md` (basado en la Guía IDIAP + prácticas modernas).

## Cómo funciona
1. Registras una siembra: cultivo, fecha, cuántas plantas.
2. La app calcula el calendario completo desde la fecha de siembra.
3. Al abrir ves **Pendientes** (tareas vencidas + de hoy) con la **dosis ya escalada** a tus plantas.
4. Marcas cada tarea como hecha. Todo se guarda en el propio teléfono (localStorage).

Sin login, sin backend, sin costo. Funciona offline una vez cargada.

## Stack
- HTML/CSS/JS puro, sin frameworks. Archivos estáticos.
- PWA (instalable en la pantalla de inicio del celular): `manifest.webmanifest` + `sw.js`.
- Datos en `localStorage` (este dispositivo). Más adelante se puede migrar a la nube.

## Archivos
| Archivo | Rol |
|---------|-----|
| `index.html` | Estructura y formulario de nueva siembra |
| `app.js` | Lógica: registro, cálculo de tareas, estado, render |
| `crops.js` | **Base de conocimiento**: cultivos + calendario de tareas + dosis |
| `style.css` | Tema claro, legible al sol, mobile-first |
| `sw.js` / `manifest.webmanifest` | PWA (offline + instalable) |
| `docs/curso-zapallo.md` | Curso de estudio (fuente del calendario) |

## Probar localmente
```bash
cd ~/proyectos/cuaderno-de-siembra
python3 -m http.server 8080
# abrir http://localhost:8080
```
(El service worker necesita servirse por http, no con `file://`.)

## Desplegar (para abrirlo desde el celular)
- Netlify: arrastra la carpeta a app.netlify.com, o conecta el repo → auto-deploy.
- Al cambiar un `.js`/`.css`, sube el `?v=N` en `index.html` y `sw.js` (cache-bust).

## Agregar un cultivo nuevo (sandía, etc.)
Edita `crops.js` y agrega un objeto al array `CROPS` con su `id`, `nombre`, `emoji`
y su lista de `tareas` (día relativo a la siembra + dosis por planta). La app lo
muestra automáticamente en el selector de "Nueva siembra". Ver la plantilla comentada
al final de `crops.js`.

## Roadmap
- [x] Módulo de siembra (registro) + seguimiento (calendario y pendientes)
- [x] Dosis escaladas por número de plantas
- [ ] Sandía y otros rubros (estructura ya lista)
- [ ] Notificaciones push al teléfono (hoy: lista al abrir)
- [ ] Registrar fecha real de cosecha para recalcular curado/almacenamiento
- [ ] Ajuste de dosis por análisis de suelo
- [ ] Sincronización en la nube (opcional, Supabase) para varios dispositivos
- [ ] Iconos PNG dedicados para instalación en iOS
