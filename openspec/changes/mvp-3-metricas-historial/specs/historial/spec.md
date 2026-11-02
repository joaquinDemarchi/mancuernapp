# Spec Delta

## Purpose

Tener a mano todas las sesiones cargadas, de la más nueva a la más vieja, para repasarlas y corregir o borrar una vieja sin depender del Excel.

## ADDED Requirements

### Requirement: Acceso al historial
El inicio SHALL ofrecer un botón secundario "Historial", visible aunque no haya sesiones.

#### Scenario: Sin sesiones
- **WHEN** el usuario todavía no cargó ninguna sesión y abre "Historial"
- **THEN** ve un estado vacío que explica que acá van a aparecer sus sesiones

### Requirement: Lista de sesiones
El historial SHALL listar todas las sesiones del usuario, de cualquier rutina, de la más nueva a la más vieja, cada una con fecha, nombre del día, semana N, volumen y, si tiene vez anterior, % e indicador.

#### Scenario: Orden
- **WHEN** hay sesiones del 28/10 (Día 1), 29/10 (Día 2) y 31/10 (Día 3)
- **THEN** la primera fila es 31/10 · Día 3 y la última 28/10 · Día 1

#### Scenario: Fila de una sesión
- **WHEN** la sesión del 29/10 es la segunda vez de Día 2, sumó 4.390 kg y subió 4 % vs la anterior
- **THEN** su fila muestra "29/10", "Día 2", "semana 2", "4.390 kg", "+4 %" y "Óptimo"

### Requirement: Abrir una sesión del historial
Tocar una sesión del historial SHALL abrirla en la pantalla de sesión con su fecha real, donde se puede editar o borrar con confirmación igual que la de hoy.

#### Scenario: Corregir un kg viejo
- **WHEN** el usuario abre la sesión del 29/10 desde el historial y cambia 60 kg por 62,5 kg en Press banca
- **THEN** la sesión del 29/10 queda guardada con 62,5 kg y el historial muestra el volumen nuevo

#### Scenario: Borrar una vieja
- **WHEN** el usuario abre la sesión del 28/10, toca "Borrar" y confirma
- **THEN** vuelve al historial y esa sesión ya no está
