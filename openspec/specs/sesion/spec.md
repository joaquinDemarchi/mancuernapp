# sesion Specification

## Purpose

TBD - created by archiving change mvp-2-carga-sesion. Update Purpose after archive.

## Requirements

### Requirement: Día sugerido
Con rutina activa, el inicio SHALL mostrar "Hoy: Día X" con el día siguiente (por orden en la rutina) al de la última sesión, volviendo al primero después del último; sin sesiones, el primer día. Antes de empezar, un botón "Cambiar" SHALL desplegar los chips de días para elegir otro con un toque.

#### Scenario: Rotación
- **WHEN** la rutina tiene Día 1, Día 2 y Día 3 y la última sesión fue de Día 3
- **THEN** el inicio muestra "Hoy: Día 1"

#### Scenario: Cambiar el día
- **WHEN** el sugerido es Día 2 y el usuario toca "Cambiar" y el chip "Día 3"
- **THEN** la tarjeta muestra "Hoy: Día 3" y "Empezar Día 3"

### Requirement: Precarga con la última vez
La sesión SHALL listar los ejercicios del día en orden, cada uno con los valores de la última vez que se hizo ese día; si nunca se hizo, SHALL mostrar "Primera vez" y partir del objetivo de la rutina.

#### Scenario: Última vez
- **WHEN** la última sesión de Día 2 tuvo Press banca 4×10 con 40 kg
- **THEN** la fila de Press banca muestra "Última: 4×10 · 40 kg"

#### Scenario: Primera vez
- **WHEN** Hip thrust nunca se cargó en Día 2 y tiene objetivo 4×10
- **THEN** la fila muestra "Primera vez · objetivo 4×10"

### Requirement: Igual que la última vez
El ✓ de un ejercicio con última vez SHALL guardarlo como hecho con esos mismos valores en un toque; tocarlo de nuevo SHALL quitarlo y volver a mostrar la última vez. En un ejercicio sin última vez, el ✓ SHALL abrir Ajustar.

#### Scenario: Día sin cambios
- **WHEN** el usuario toca "Empezar", el ✓ de cada uno de los 5 ejercicios y "Terminar sesión"
- **THEN** la sesión queda guardada con los 5 ejercicios iguales a la última vez en 7 toques

#### Scenario: Destildar
- **WHEN** el usuario toca el ✓ de un ejercicio ya hecho
- **THEN** deja de estar hecho y la fila vuelve a "Última: …"

### Requirement: Ajustar
Tocar el nombre de un ejercicio (salvo calentamiento) SHALL abrir la hoja Ajustar con sus bloques y steppers según el tipo (peso: series, reps y kg; reps: series y reps; tiempo: series y segundos; cardio: minutos), con los saltos del ejercicio; cada cambio SHALL marcarlo como hecho.

#### Scenario: Subir kg
- **WHEN** Press banca tiene salto de 2,5 kg y el usuario toca `+` en Kg con 40
- **THEN** el bloque queda en 42,5 kg, el ejercicio queda hecho y la fila muestra el valor nuevo resaltado

#### Scenario: Calentamiento
- **WHEN** el usuario toca el nombre de un ejercicio de calentamiento
- **THEN** se marca o desmarca como hecho sin abrir Ajustar

### Requirement: Bloques y desarmar
En Ajustar, el usuario SHALL poder quitar un bloque (salvo el único) y desarmar un bloque de 2 o más series en bloques de 1 serie con los mismos valores; el editor de un bloque SHALL abrirse al tocarlo. Agregar un bloque queda oculto por ahora.

#### Scenario: Desarmar
- **WHEN** Press banca tiene un bloque 3×10 · 40 kg y el usuario lo toca y toca "Desarmar"
- **THEN** quedan tres filas "Serie 1", "Serie 2", "Serie 3" de 1×10 · 40 kg

#### Scenario: Última serie distinta
- **WHEN** después de desarmar el usuario elige "Serie 3" y baja las reps a 8
- **THEN** la fila de la sesión muestra "1×10 · 40 kg + 1×10 · 40 kg + 1×8 · 40 kg"

### Requirement: RPE y nota opcionales
Ajustar SHALL ofrecer, detrás de un botón "RPE y nota", RPE con chips 6 a 10 (tocar el elegido lo borra) y una nota de texto, ambos opcionales y guardados con el ejercicio.

#### Scenario: RPE
- **WHEN** el usuario elige RPE 8 en Sentadilla
- **THEN** la fila muestra "· RPE 8" al final de los valores

### Requirement: Ejercicio extra
La sesión SHALL permitir agregar un ejercicio que no está en el día, buscándolo o creándolo en el catálogo; SHALL quedar solo en esa sesión, al final de la lista, sin cambiar la rutina.

#### Scenario: Agregar extra
- **WHEN** el usuario toca "Agregar ejercicio" y elige "Remo con mancuerna", que no está en Día 2
- **THEN** aparece último en la sesión como "Extra" y Día 2 en la rutina no cambia

### Requirement: Guardado instantáneo
Cada toque que cambia la sesión SHALL guardarse sin botón "Guardar"; la sesión SHALL crearse con el primer ejercicio cargado, no al tocar "Empezar".

#### Scenario: Cerrar a mitad
- **WHEN** el usuario carga 3 ejercicios y cierra la app
- **THEN** al abrirla de nuevo el mismo día la tarjeta dice "Seguir Día 2" y los 3 siguen hechos

#### Scenario: Entrar y salir sin cargar
- **WHEN** el usuario toca "Empezar" y vuelve sin tocar nada
- **THEN** no queda ninguna sesión guardada

### Requirement: Terminar con volumen
"Terminar sesión" SHALL marcar la sesión como terminada y mostrar el volumen total (Σ series × reps × kg de los ejercicios de peso hechos).

#### Scenario: Volumen
- **WHEN** los ejercicios de peso hechos son 4×10 · 40 kg y 3×10 · 60 kg
- **THEN** el resumen muestra "3.400 kg"

### Requirement: Sesión de hoy editable y borrable
La sesión de hoy SHALL poder retomarse y editarse desde el inicio aunque esté terminada, y borrarse con confirmación; las sesiones de días anteriores solo SHALL abrirse desde "Cargar un día anterior".

#### Scenario: Borrar
- **WHEN** el usuario toca "Borrar" en la sesión de hoy y confirma "Sí, borrar sesión"
- **THEN** la sesión se borra, vuelve al inicio y la tarjeta ofrece otra vez el día sugerido

### Requirement: Cargar un día anterior
El inicio SHALL ofrecer "Cargar un día anterior" para elegir una fecha pasada (desde el inicio de la rutina hasta ayer) y un día de la rutina, y cargar esa sesión con su fecha real; si esa fecha ya tiene sesión, SHALL abrirla para editarla.

#### Scenario: Me olvidé de ayer
- **WHEN** hoy no hay sesiones, la última fue Día 2 el 29/10 y el usuario carga Día 1 con fecha "Ayer" (30/10)
- **THEN** la sesión queda con fecha 30/10 y la tarjeta Hoy sugiere Día 2

### Requirement: Semana N
La sesión SHALL mostrar "semana N", donde N es la cantidad de veces que se hizo ese día en la rutina contando la actual; no se SHALL guardar.

#### Scenario: Tercera vez
- **WHEN** Día 2 ya se hizo dos veces en la rutina
- **THEN** la sesión nueva de Día 2 muestra "semana 3"

### Requirement: Datos de sesiones por usuario
Las sesiones SHALL guardarse en `users/{uid}/sesiones` con `rutinaId`, `diaId` y fecha local, y solo su dueño SHALL poder leerlas o escribirlas.

#### Scenario: Otro usuario
- **WHEN** una cuenta intenta leer las sesiones de otro uid
- **THEN** Firestore rechaza la lectura
