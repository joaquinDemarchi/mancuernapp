# MancuernApp — Decisiones de diseño (input para OpenSpec)

> Documento fuente para arrancar el proyecto desde cero con `openspec init` en una sesión de Code (PC2).
> Resultado de una sesión de grilling (28/10/2026). Todo lo de acá está **decidido** salvo lo marcado como v2.
> Uso: leer este doc → generar `openspec/project.md` → crear un change por etapa (ver §9).

---

## 1. Contexto y objetivo

- Reemplazar un Excel de seguimiento de rutina de gimnasio (`RutinaGym-Mayo.xlsx`) por una app.
- **Motivo principal: que cargar datos en el gym sea rápido y sin fricción.**
- Uso **real** (no proyecto de práctica). Usuario único por ahora (Lio); datos preparados para multiusuario/roles a futuro.
- La rutina cambia cada ~4–7 semanas → el **historial debe preservarse** y ser comparable entre rutinas.
- Se trabaja con OpenSpec para que distintas IAs accedan al proyecto con bajo costo de contexto.

## 2. Diagnóstico del Excel original (qué NO repetir)

Estructura: hojas Día 1–4, cada una con bloques "Semana 1…7" apilados; 2 filas de calentamiento por semana; columnas `Ser1/Rep1/Kg1 + Ser2/Rep2/Kg2`, `Esf %`, `Carga` (Σ series×reps×kg), `Detalle`, `Crecimiento carga` (% vs semana anterior); indicador de sobrecarga (Bajo <0%, Óptimo 0–10%, Alto >10%); Dashboard, Gráficos, Móvil y hojas "Mes 1" de historial (vacías).

Problemas detectados:
- Estructura atada a filas → fórmulas corridas (Dashboard apunta a celdas equivocadas), `#REF!` en Gráficos/Móvil.
- Carga S1 solo evalúa bloque 2 → ejercicios con un solo bloque dan vacío.
- Filas sin fórmula (Pantorrillas S2), fecha accidental en un campo numérico (`Dia 2!B6`).
- Ejercicios no-peso (bici, plancha, banda, peso corporal) cargados como números sin sentido (1×1×1).
- `Esf %` con escalas mezcladas (8, 40, 75).
- "Mes" no coincide con la duración real (6–7 semanas); fechas sueltas en títulos.
- Historial inexistente en la práctica.

Rutina vigente en el Excel (para cargar a mano como primera plantilla; Lio la completa):
- **Día 1**: Despegue barra Hexa, Estocada, Camilla Isquio, Pantorrillas, Bici 10 min.
- **Día 2**: calentamiento: Halo con disco + posteriores c/banda, Plancha lateral y ventral · ejercicios: Vuelo posterior Y, Press militar hammer (resto a completar).
- **Día 3**: calentamiento: Antirotación + bicho muerto, Posteriores T (resto a completar).
- **Día 4**: calentamiento: Rotación cadera + depresión c/palo, Abd. bolita (resto a completar).

Los datos históricos del Excel **no se migran**: Lio los carga a mano.

## 3. Stack

- **SvelteKit** + **Firebase** (Auth + Firestore con persistencia offline) + **Vercel**.
- **PWA** instalable (manifest + service worker). El gym tiene wifi, pero debe funcionar offline y sincronizar.
- Login: **Google** con **lista blanca de emails** (hoy solo Lio).
- Nombre e ícono definidos en **un único lugar** (`config/app.ts` + manifest). Costo estimado de renombrar después: ~3–5k tokens; si cambia el dominio de Vercel hay que reinstalar la PWA (los datos no se pierden).

## 4. Modelo de dominio

```
users/{uid}                      { email, nombre, rol: "usuario" | "profe" (futuro), ajustes }
users/{uid}/ejercicios/{id}      catálogo personal: { nombre, tipo, saltoKg, saltoReps, saltoSeg, notas }
users/{uid}/rutinas/{id}         { nombre, inicio, fin?, estado: "activa" | "archivada" }
   └─ dias[]                     { id, nombre: "Día 1", items[]: { ejercicioId, objetivo? } }
       └─ objetivo               { series?, reps?, segundos?, minutos? }  (como un bloque, sin kg)
users/{uid}/sesiones/{id}        { rutinaId, diaId, fecha (auto), registros[] }
   └─ registros[]                { ejercicioId, bloques[], rpe?, hecho, nota? }
       └─ bloques[]              { series, reps?, kg?, segundos?, minutos? }  (desarmable en series individuales)
```

Reglas:
- Datos separados por usuario desde el día 1 (`users/{uid}/…`) y campo `rol` → multiusuario/profe sin migración.
- **Catálogo de ejercicios**: un ejercicio existe una vez; las rutinas lo referencian → evolución comparable entre rutinas/meses. Al crear/importar, sugerir emparejamiento ("¿es el mismo que 'Camilla Isquio'?").
- **Tipos de ejercicio**: `peso` (series×reps×kg), `reps` (banda / peso corporal), `tiempo` (series×segundos), `cardio` (minutos), `calentamiento` (solo check). Solo `peso` entra en volumen e indicador.
- **Rutina = bloque con inicio/fin**, una sola **activa** a la vez. Al cerrarla pasa a **archivada** (solo lectura). "Desarchivar" escondido en Ajustes.
- **Sesión** con fecha automática; la "semana N" se calcula (N-ésima vez que se hace ese día en la rutina). Se permite agregar un ejercicio extra a una sesión.
- Sesiones de la rutina activa: se pueden **editar y borrar** (con confirmación).
- **Orden** de días e items = posición en el array (no se guarda `orden`). Cada día lleva `id` (`crypto.randomUUID()`) porque `sesiones.diaId` lo referencia y el nombre del día se puede cambiar (MVP 1).

## 5. Flujo de carga (pantalla crítica)

1. Abrir la app → "**Hoy: Día X**" (siguiente en la rotación según la última sesión; cambiable con un toque).
2. Lista de ejercicios del día, **precargada con los valores de la última vez** que se hizo ese día (en gris).
3. Por ejercicio: **✓ = igual que la última vez** (1 toque) o **Ajustar**: `−/+` para reps (±1), kg (salto por ejercicio), segundos; tocar el número abre teclado numérico.
4. **Carga híbrida**: por bloques (series×reps×kg), "+ bloque", y opción de desarmar un bloque en series individuales.
5. **RPE 1–10 opcional** por ejercicio (chips 6-7-8-9-10).
6. **Guardado instantáneo** en cada toque (sin botón guardar); funciona offline.
7. "Terminar sesión" → resumen: volumen total, % vs vez anterior, indicador 🟢🟡🔴.

Objetivo: día sin cambios ≈ 6 toques; con cambios ≈ 15.

Saltos: **configurables por ejercicio**; default **2,5 kg**; mínimo y default para mancuernas **1 kg**. Reps ±1. Tiempo ±5 s.

## 6. Métricas (MVP)

- Volumen por ejercicio y por sesión (solo tipo `peso`): Σ series×reps×kg.
- % de crecimiento vs la vez anterior del mismo ejercicio/día.
- Indicador de sobrecarga: Bajo < 0%, Óptimo 0–10%, Alto > 10%. **Umbrales fijos en una constante** (configurables en v2).
- 1 gráfico de evolución por ejercicio (cruzando rutinas gracias al catálogo).
- Historial de sesiones y rutinas archivadas.

## 7. Import / Export

- **Import (MVP 4)**: plantilla propia **Excel/CSV** con columnas fijas (Rutina, Día, Ejercicio, Tipo, Series, Reps, Kg, Segundos, Minutos, Fecha opcional). Sirve para rutinas nuevas **y** para importar semanas/datos históricos. Paso obligatorio de **revisión antes de guardar** + emparejamiento con catálogo.
- **Export (MVP 4)**: "Exportar todo" a Excel/CSV con el mismo formato (backup fuera de Firebase y análisis en Excel/R).
- v2: import con IA (foto/PDF/WhatsApp → rutina para revisar), vía Claude API.

## 8. UI/UX

- Tema **oscuro por defecto**, opción claro.
- **Uso con una mano**: acciones principales en la mitad inferior, botones táctiles ≥ 48 px.
- Sin referencias visuales previas → en el MVP UX se proponen 2–3 direcciones para elegir.
- Nombre: **MancuernApp**. Ícono: **mancuernita celeste en diagonal sobre fondo blanco**.

Herramientas de diseño (verificar disponibilidad en la sesión de PC2):
| Herramienta | Uso | Cuándo |
|---|---|---|
| **taste skill** (si está instalado; si no, `frontend-design`) | Criterio visual al construir UI | Durante cada MVP |
| Artifact **Design System** | Tokens (colores, tipografía, espaciado, radios), componentes base; referencia para cualquier IA | MVP UX (una vez) |
| Artifact **Design** (canvas) | Mockups de las pantallas de cada MVP, 2–3 variantes cuando haya decisión | Antes de cada MVP |
| `prototype` | Prototipo descartable del flujo de carga para probar en el celu | Antes del MVP 2 |
| `design-handoff` | Mockup elegido → especificación en `design.md` del change | Cada MVP |
| `design-critique` + `accessibility-review` | Revisión de lo construido (contraste en gym, touch targets) | Al cerrar cada MVP |
| `ux-copy` | Textos de botones, estados vacíos, errores, confirmaciones | Al cerrar cada MVP |

Si en la sesión de Code no hay herramienta de Artifacts: los mockups/Design System se hacen en el Project de claude.ai y se pasan al repo como archivos (tokens CSS + capturas/especificación).

Ciclo de diseño por MVP: **mockup → Lio elige → handoff a design.md → código → critique + accesibilidad + copy**.

## 9. Plan de entregas (cada una = 1 change de OpenSpec)

| # | Change | Entregable probable en el celu | ~Tokens |
|---|---|---|---|
| UX | `mvp-ux-design-system` | Design System + 2–3 direcciones visuales + ícono/nombre | 25–30k |
| 0 | `mvp-0-base` | PWA en Vercel, login Google (lista blanca), pantalla vacía, nombre centralizado | ~15k |
| 1 | `mvp-1-catalogo-rutina` | Catálogo de ejercicios (tipo, saltos) + crear rutina a mano (días/ejercicios) | ~20k |
| — | `prototipo-flujo-carga` | Prototipo descartable del flujo de carga | ~10k |
| 2 | `mvp-2-carga-sesion` | Flujo de carga completo (§5), offline | ~25k |
| 3 | `mvp-3-metricas-historial` | Historial, volumen, %, indicador, gráfico por ejercicio | ~20k |
| 4 | `mvp-4-import-export-archivo` | Archivar/nueva rutina, import plantilla, export | ~20k |
| — | ciclos de diseño de cada MVP | | 40–60k |

Total estimado: **~180–220k tokens**. Desde el MVP 2 la app se usa de verdad en el gym.

**v2 (fuera del MVP)**: sugerir progresión (+kg tras 2 🟢), timer de descanso, import con IA, varias rutinas activas, roles profe/alumno + invitaciones, umbrales configurables, 1RM estimado / récords, dashboard ampliado.

## 10. Proceso de trabajo (para no quedarse sin uso a mitad de una tarea)

1. Cada change dividido en **tareas de ~10–20k tokens** en `tasks.md`.
2. **1 tarea = 1 commit local** + marcar `[x]`. Si se corta, se pierde como mucho una tarea.
3. Al cerrar cada tarea: **notas de traspaso** en el change (dónde quedó, qué falta, gotchas).
4. Arranque de sesión barato: leer solo `openspec/project.md` + change activo + notas de traspaso (~5–10k).
5. Antes de cada tarea, Claude estima su costo; si queda poco uso, elegir una más chica.
6. **Diseño y código en sesiones separadas**; sesión nueva entre tareas grandes.
7. Permisos: leer/editar/instalar/correr comandos sin preguntar; **pedir OK antes de borrar, `git push` o deploy**.
8. Código, comentarios y commits en español (salvo que agregue esfuerzo o confunda).
9. Antes de escribir código, preguntar todo lo no definido, con costo estimado en tokens de cada decisión.
10. Explicar y guiar a nivel medio (uso real, no cursada).

## 11. Pendiente para la próxima sesión (PC2)

- Lio crea el repo vacío en GitHub y lo pasa.
- `openspec init` → `project.md` desde este doc → change `mvp-ux-design-system`.
- Verificar si taste skill y los tipos de Artifact Design / Design System están disponibles en esa sesión.