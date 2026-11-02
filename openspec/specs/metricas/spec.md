# metricas Specification

## Purpose

Mostrar si Joa está progresando con lo que carga: volumen, crecimiento vs la vez anterior, indicador de sobrecarga y la evolución de cada ejercicio a lo largo de las rutinas.

## Requirements

### Requirement: Volumen por ejercicio
El volumen de un ejercicio de tipo peso en una sesión SHALL ser Σ series × reps × kg de sus bloques; los ejercicios de otros tipos no SHALL tener volumen.

#### Scenario: Bloques distintos
- **WHEN** Press banca se hizo con 3×10 · 60 kg y 1×8 · 70 kg
- **THEN** su volumen es 2.360 kg

#### Scenario: Ejercicio sin peso
- **WHEN** Plancha (tipo tiempo) se hizo con 3×40 s
- **THEN** no muestra volumen ni %

### Requirement: Crecimiento vs la vez anterior
El % de un ejercicio SHALL compararse con su volumen en la sesión anterior del mismo día de la rutina en que se hizo, y el % de la sesión con el volumen total de la sesión anterior de ese día. Sin vez anterior, o con volumen anterior 0, no SHALL mostrarse %.

#### Scenario: Subió
- **WHEN** la vez anterior de Día 1 Press banca sumó 2.000 kg y hoy suma 2.100 kg
- **THEN** el ejercicio muestra "+5 %"

#### Scenario: Primera vez
- **WHEN** es la primera sesión de Día 2
- **THEN** el resumen muestra el volumen sin % ni indicador

### Requirement: Indicador de sobrecarga
Cada % SHALL clasificarse como Bajo (< 0 %), Óptimo (0 % a 10 %, inclusive) o Alto (> 10 %), con umbrales fijos en un único lugar del código, y SHALL mostrarse con su palabra y forma además del color.

#### Scenario: Límite de óptimo
- **WHEN** el % es exactamente 10 %
- **THEN** el indicador dice "Óptimo"

#### Scenario: Bajó
- **WHEN** el % es −3 %
- **THEN** el indicador dice "Bajo"

### Requirement: Evolución por ejercicio
La pantalla de evolución de un ejercicio SHALL listar cada sesión en que se hizo, de cualquier rutina y día, con fecha y valores; para ejercicios de peso SHALL además mostrar un gráfico del volumen de cada vez, en orden de fecha.

#### Scenario: Cruzando rutinas
- **WHEN** Sentadilla se hizo 3 veces en Rutina 1 y 2 veces en Rutina 2
- **THEN** su evolución muestra 5 puntos en el gráfico y 5 filas

#### Scenario: Una sola vez
- **WHEN** el ejercicio se hizo una sola vez
- **THEN** se ve esa fila y el gráfico no se dibuja como línea sino como un único punto

### Requirement: Acceso a la evolución
La evolución SHALL abrirse desde la ficha del ejercicio en el catálogo y desde la hoja Ajustar de ese ejercicio.

#### Scenario: Desde Ajustar
- **WHEN** el usuario abre Ajustar de Press banca y toca "Ver evolución"
- **THEN** ve la evolución de Press banca y al volver sigue en la sesión
