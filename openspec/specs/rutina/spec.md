# rutina Specification

## Purpose

La rutina activa del usuario: sus días y, en cada día, los ejercicios del catálogo en orden y con un objetivo opcional; es lo que el flujo de carga recorre en el gym.

## Requirements

### Requirement: Crear la rutina
Sin rutina activa, "Crear rutina" SHALL crear una rutina activa con nombre "Rutina 1", fecha de inicio de hoy y un día vacío "Día 1", y SHALL abrir su editor.

#### Scenario: Primera rutina
- **WHEN** el usuario sin rutina toca "Crear rutina"
- **THEN** ve el editor con el nombre "Rutina 1", la fecha de hoy y la pestaña "Día 1" vacía

### Requirement: Una sola rutina activa
El sistema SHALL tener como máximo una rutina con estado "activa" por usuario; con una activa no se SHALL ofrecer crear otra.

#### Scenario: Ya hay rutina
- **WHEN** el usuario tiene una rutina activa
- **THEN** el inicio ofrece "Editar rutina" y no "Crear rutina"

### Requirement: Guardado instantáneo
Cada cambio en el editor de rutina (nombre, días, ejercicios, orden, objetivo) SHALL guardarse sin botón "Guardar".

#### Scenario: Volver sin guardar
- **WHEN** el usuario agrega un ejercicio a "Día 1" y toca volver
- **THEN** al reabrir el editor el ejercicio sigue en "Día 1"

### Requirement: Días en pestañas
El editor SHALL mostrar los días como pestañas con la del día elegido marcada y la lista de ejercicios de ese día debajo; SHALL permitir agregar un día (se llama "Día N"), renombrarlo y borrarlo.

#### Scenario: Agregar día
- **WHEN** la rutina tiene 2 días y el usuario toca `+` en las pestañas
- **THEN** aparece "Día 3" elegido y vacío

#### Scenario: Borrar día con ejercicios
- **WHEN** el usuario borra un día que tiene ejercicios
- **THEN** se pide confirmación antes de borrarlo

#### Scenario: Borrar el único día
- **WHEN** la rutina tiene un solo día
- **THEN** la opción de borrarlo no está disponible

### Requirement: Agregar ejercicio al día
"Agregar ejercicio" SHALL abrir una hoja con buscador sobre el catálogo; tocar un ejercicio SHALL agregarlo al final del día; si no existe, la hoja SHALL permitir crearlo con nombre y tipo y agregarlo en el mismo paso.

#### Scenario: Elegir del catálogo
- **WHEN** el usuario busca "sent" y toca "Sentadilla"
- **THEN** "Sentadilla" queda último en el día elegido

#### Scenario: Crear al vuelo
- **WHEN** el usuario busca "Hip thrust", que no existe, toca "Crear «Hip thrust»", elige "Peso" y toca "Crear y agregar"
- **THEN** "Hip thrust" existe en el catálogo con los saltos por defecto y está último en el día

#### Scenario: Ya está en el día
- **WHEN** el ejercicio buscado ya está en ese día
- **THEN** la hoja lo indica y no lo agrega dos veces

### Requirement: Reordenar arrastrando
Los ejercicios de un día y las pestañas de días SHALL poder reordenarse arrastrando desde su manija; con teclado, la manija SHALL mover el elemento con las flechas (en las pestañas, con Alt + flecha, porque la flecha sola SHALL cambiar de día).

#### Scenario: Arrastrar ejercicio
- **WHEN** el usuario arrastra "Plancha" desde la manija hasta arriba de "Press banca"
- **THEN** el orden queda guardado con "Plancha" antes de "Press banca"

#### Scenario: Scroll sin arrastrar
- **WHEN** el usuario desliza el dedo sobre un ejercicio fuera de la manija
- **THEN** la lista hace scroll y el orden no cambia

### Requirement: Objetivo por ejercicio
Tocar un ejercicio del día SHALL abrir una hoja con su objetivo opcional según el tipo (peso y reps: series × reps; tiempo: series × segundos; cardio: minutos; calentamiento: sin objetivo) y la acción "Quitar del día".

#### Scenario: Fijar objetivo
- **WHEN** el usuario pone 4 series y 10 reps a "Press banca" y toca "Listo"
- **THEN** la fila muestra "4×10"

#### Scenario: Quitar del día
- **WHEN** el usuario toca "Quitar del día"
- **THEN** el ejercicio sale de ese día y sigue en el catálogo

### Requirement: Rutina en el inicio
Con rutina activa, el inicio SHALL mostrar su nombre, la fecha de inicio y la lista de días con la cantidad de ejercicios de cada uno, y las acciones "Ejercicios" y "Editar rutina" en la barra inferior.

#### Scenario: Inicio con rutina
- **WHEN** el usuario tiene "Rutina 1" con 3 días
- **THEN** ve "Rutina 1", "desde" y la fecha, y "Día 1", "Día 2", "Día 3" con su cantidad de ejercicios

### Requirement: Datos de la rutina por usuario
Las rutinas SHALL guardarse en `users/{uid}/rutinas` y solo su dueño SHALL poder leerlas o escribirlas.

#### Scenario: Otro usuario
- **WHEN** una cuenta intenta leer las rutinas de otro uid
- **THEN** Firestore rechaza la lectura
