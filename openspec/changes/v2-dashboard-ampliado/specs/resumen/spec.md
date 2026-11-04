# Spec Delta

## Purpose

Dar una vista de conjunto del entrenamiento en un período: cuánto volumen y cuántas sesiones hubo por semana, la racha de constancia, las mejores marcas y qué ejercicios progresan.

## ADDED Requirements

### Requirement: Acceso al resumen
El inicio SHALL tener un enlace "Resumen" que abre la pantalla de resumen, con o sin rutina activa; volver desde el resumen SHALL llevar al inicio.

#### Scenario: Desde el inicio
- **WHEN** el usuario toca "Resumen" en el inicio
- **THEN** se abre la pantalla de resumen con el período por defecto

#### Scenario: Sin rutina activa
- **WHEN** el usuario no tiene rutina activa pero tiene sesiones de rutinas archivadas
- **THEN** el inicio muestra igual el enlace "Resumen"

### Requirement: Selector de período
El resumen SHALL ofrecer los períodos "Rutina activa" (desde el inicio de la rutina activa hasta hoy), "3 meses" (los últimos 91 días hasta hoy) y "Todo"; por defecto SHALL estar elegido "Rutina activa", o "3 meses" si no hay rutina activa, y sin rutina activa esa opción no SHALL mostrarse. Cambiar el período SHALL recalcular todos los bloques salvo la racha.

#### Scenario: Default
- **WHEN** la rutina activa empezó el 06/10 y el usuario abre el resumen el 04/11
- **THEN** el período elegido es "Rutina activa" y los bloques cuentan solo las sesiones del 06/10 al 04/11

#### Scenario: Cambiar a Todo
- **WHEN** el usuario elige "Todo"
- **THEN** los bloques incluyen las sesiones de las rutinas archivadas

#### Scenario: Sin rutina activa
- **WHEN** no hay rutina activa
- **THEN** el selector muestra solo "3 meses" y "Todo", con "3 meses" elegido

### Requirement: Semanas
Las semanas del resumen SHALL ir de lunes a domingo, según la fecha local de cada sesión, y SHALL nombrarse por la fecha de su lunes.

#### Scenario: Domingo
- **WHEN** una sesión es del domingo 02/11 y otra del lunes 03/11
- **THEN** la primera cuenta en la semana del 27/10 y la segunda en la semana del 03/11

### Requirement: Volumen por semana
El resumen SHALL mostrar un gráfico de barras con el volumen total (solo ejercicios de tipo peso) de cada semana del período, de la más vieja a la más nueva, incluyendo en 0 las semanas sin sesiones entre la primera y la última; cada barra SHALL poder leerse también como texto (semana y kg).

#### Scenario: Semana sin ir
- **WHEN** el período tiene sesiones en las semanas del 13/10 y del 27/10 pero no en la del 20/10
- **THEN** el gráfico muestra tres barras y la del 20/10 en 0 kg

#### Scenario: Solo ejercicios sin peso
- **WHEN** en una semana solo se hicieron ejercicios de cardio
- **THEN** esa semana cuenta su sesión pero su volumen es 0 kg

### Requirement: Sesiones por semana
El resumen SHALL mostrar cuántas sesiones hubo en cada semana del período (de cualquier tipo de ejercicio), con las mismas semanas que el volumen, y el promedio de sesiones por semana del período.

#### Scenario: Tres sesiones
- **WHEN** en la semana del 27/10 se cargaron sesiones el lunes, miércoles y viernes
- **THEN** la semana del 27/10 muestra 3 sesiones

### Requirement: Racha
El resumen SHALL mostrar la racha actual: cuántas semanas seguidas, terminando en la actual, tienen al menos una sesión, contando todas las sesiones sin importar el período; si la semana actual todavía no tiene sesiones, la racha SHALL contar desde la semana anterior sin cortarse.

#### Scenario: Semana en curso sin ir
- **WHEN** hoy es lunes 03/11 sin sesión y las 4 semanas anteriores tienen al menos una sesión
- **THEN** la racha es de 4 semanas

#### Scenario: Racha cortada
- **WHEN** la semana anterior a la actual no tuvo sesiones y la actual tampoco
- **THEN** la racha es 0 y se muestra sin destacar

### Requirement: Mejores marcas
El resumen SHALL listar, por cada ejercicio hecho en el período, su mejor marca con la fecha en que se logró: peso, el mayor kg de un bloque (con sus reps) y el mayor volumen de una vez; reps, más reps en una serie; tiempo, más segundos en una serie; cardio, más minutos. Calentamiento no SHALL listarse. Si la marca se repite, SHALL tomarse la primera fecha.

#### Scenario: Peso
- **WHEN** Press banca se hizo con 3×10 · 60 kg el 20/10 y 2×6 · 70 kg el 27/10, y su mayor volumen fue el 20/10 con 1.800 kg
- **THEN** su marca muestra "70 kg × 6" del 27/10 y "1.800 kg" del 20/10

#### Scenario: Tiempo
- **WHEN** Plancha se hizo con 3×40 s y después con 3×45 s
- **THEN** su marca muestra "45 s" con la fecha de la segunda vez

### Requirement: Progreso por ejercicio
El resumen SHALL listar cada ejercicio de tipo peso hecho al menos dos veces en el período con el % del volumen de la última vez vs la primera vez del período y su indicador (palabra y forma además del color); tocar uno SHALL abrir su evolución y volver SHALL llevar al resumen. Los hechos una sola vez o con volumen 0 la primera vez no SHALL mostrar %.

#### Scenario: Subió
- **WHEN** Sentadilla sumó 2.000 kg la primera vez del período y 2.300 kg la última
- **THEN** su fila muestra "+15 %" y el indicador "Alto"

#### Scenario: Una sola vez
- **WHEN** Remo se hizo una sola vez en el período
- **THEN** no aparece en el progreso

### Requirement: Período sin sesiones
Si el período elegido no tiene sesiones, el resumen SHALL mostrar un estado vacío en lugar de los bloques, sin dejar de mostrar el selector ni la racha.

#### Scenario: Rutina recién empezada
- **WHEN** la rutina activa empezó hoy y todavía no tiene sesiones
- **THEN** el resumen muestra "No hay sesiones en este período" y el selector sigue disponible
