# Spec Delta

## MODIFIED Requirements

### Requirement: Lista de sesiones
El historial SHALL agrupar las sesiones de la rutina activa por día, en el orden de los días, y dentro de cada día listarlas de la más nueva a la más vieja, cada una con fecha, semana N, volumen y, si tiene vez anterior, % e indicador. Debajo, bajo "Rutinas anteriores", SHALL mostrar un grupo plegado por rutina archivada, de la más nueva a la más vieja, con su nombre, fechas de inicio y fin y cantidad de sesiones; al desplegarlo SHALL listar sus sesiones con el día en cada fila. Sin sesiones SHALL mostrar un estado vacío.

#### Scenario: Orden
- **WHEN** Día 1 se hizo el 24/10, 27/10 y 31/10 y Día 2 el 25/10 y 28/10
- **THEN** primero aparece el grupo "Día 1" con 31/10 arriba y 24/10 abajo, y después el grupo "Día 2"

#### Scenario: Fila de una sesión
- **WHEN** la sesión del 28/10 es la segunda vez de Día 2, sumó 4.165 kg y subió 4 % vs la anterior
- **THEN** su fila, en el grupo "Día 2", muestra "28/10", "Semana 2", "4.165 kg", "+4 %" y "Óptimo"

#### Scenario: Rutina archivada
- **WHEN** "Rutina 1" se archivó el 20/10 con 12 sesiones
- **THEN** debajo de los grupos de la rutina activa aparece "Rutina 1" plegada con sus fechas y "12 sesiones", y al tocarla se ven sus 12 sesiones

#### Scenario: Historial vacío
- **WHEN** se borró la única sesión desde el historial
- **THEN** el historial muestra "Todavía no hay sesiones"

### Requirement: Abrir una sesión del historial
Tocar una sesión del historial SHALL abrirla en la pantalla de sesión con su fecha real y su día; las de la rutina activa se pueden editar o borrar con confirmación igual que la de hoy, y las de una rutina archivada SHALL verse en solo lectura, con el volumen y el % de cada ejercicio como el resumen.

#### Scenario: Corregir un kg viejo
- **WHEN** el usuario abre la sesión del 29/10 desde el historial y cambia 60 kg por 62,5 kg en Press banca
- **THEN** la sesión del 29/10 queda guardada con 62,5 kg y el historial muestra el volumen nuevo

#### Scenario: Borrar una vieja
- **WHEN** el usuario abre la sesión del 28/10, toca "Borrar" y confirma
- **THEN** vuelve al historial y esa sesión ya no está

#### Scenario: Sesión de una rutina archivada
- **WHEN** el usuario abre una sesión de "Rutina 1" (archivada)
- **THEN** ve el nombre del día, el volumen y sus ejercicios con valores y %, sin ✓, Ajustar, "+ Agregar ejercicio" ni "Borrar"
