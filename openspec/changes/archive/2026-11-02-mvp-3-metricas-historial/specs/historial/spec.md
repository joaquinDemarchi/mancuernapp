# Spec Delta

## Purpose

Tener a mano todas las sesiones cargadas, de la más nueva a la más vieja, para repasarlas y corregir o borrar una vieja sin depender del Excel.

## ADDED Requirements

### Requirement: Acceso al historial
Con al menos una sesión anterior a hoy, el inicio SHALL mostrar bajo la tarjeta "Hoy" una fila con la última de ellas (fecha, día, volumen y, si tiene vez anterior, % e indicador) que abre el historial; sin sesiones la fila no SHALL mostrarse.

#### Scenario: Última sesión
- **WHEN** la última sesión fue Día 1 el 31/10, con 3.400 kg y +6 % vs la anterior
- **THEN** el inicio muestra la fila "31/10", "Última: Día 1", "3.400 kg" y "+6 % Óptimo", y al tocarla se abre el historial

#### Scenario: Sin sesiones
- **WHEN** el usuario todavía no cargó ninguna sesión
- **THEN** el inicio no muestra la fila de la última sesión

### Requirement: Lista de sesiones
El historial SHALL agrupar las sesiones del usuario por día de la rutina, en el orden de los días, y dentro de cada día listarlas de la más nueva a la más vieja, cada una con fecha, semana N, volumen y, si tiene vez anterior, % e indicador. Sin sesiones SHALL mostrar un estado vacío.

#### Scenario: Orden
- **WHEN** Día 1 se hizo el 24/10, 27/10 y 31/10 y Día 2 el 25/10 y 28/10
- **THEN** primero aparece el grupo "Día 1" con 31/10 arriba y 24/10 abajo, y después el grupo "Día 2"

#### Scenario: Fila de una sesión
- **WHEN** la sesión del 28/10 es la segunda vez de Día 2, sumó 4.165 kg y subió 4 % vs la anterior
- **THEN** su fila, en el grupo "Día 2", muestra "28/10", "Semana 2", "4.165 kg", "+4 %" y "Óptimo"

#### Scenario: Historial vacío
- **WHEN** se borró la única sesión desde el historial
- **THEN** el historial muestra "Todavía no hay sesiones"

### Requirement: Abrir una sesión del historial
Tocar una sesión del historial SHALL abrirla en la pantalla de sesión con su fecha real, donde se puede editar o borrar con confirmación igual que la de hoy.

#### Scenario: Corregir un kg viejo
- **WHEN** el usuario abre la sesión del 29/10 desde el historial y cambia 60 kg por 62,5 kg en Press banca
- **THEN** la sesión del 29/10 queda guardada con 62,5 kg y el historial muestra el volumen nuevo

#### Scenario: Borrar una vieja
- **WHEN** el usuario abre la sesión del 28/10, toca "Borrar" y confirma
- **THEN** vuelve al historial y esa sesión ya no está
