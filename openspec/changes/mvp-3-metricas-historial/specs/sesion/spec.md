# Spec Delta

## MODIFIED Requirements

### Requirement: Terminar con volumen
"Terminar sesión" SHALL marcar la sesión como terminada y mostrar el volumen total (Σ series × reps × kg de los ejercicios de peso hechos) y, si ese día tiene una sesión anterior, el % vs esa vez y el indicador de sobrecarga (spec `metricas`), junto con el % e indicador de cada ejercicio de peso que tenga vez anterior.

#### Scenario: Volumen
- **WHEN** los ejercicios de peso hechos son 4×10 · 40 kg y 3×10 · 60 kg
- **THEN** el resumen muestra "3.400 kg"

#### Scenario: Con vez anterior
- **WHEN** la sesión anterior de Día 1 sumó 3.200 kg y la de hoy 3.400 kg
- **THEN** el resumen muestra "3.400 kg", "+6 %" y "Óptimo"

### Requirement: Sesión de hoy editable y borrable
La sesión de hoy SHALL poder retomarse y editarse desde el inicio aunque esté terminada, y borrarse con confirmación; las sesiones de días anteriores SHALL abrirse desde "Cargar un día anterior" o desde el historial, y editarse y borrarse igual.

#### Scenario: Borrar
- **WHEN** el usuario toca "Borrar" en la sesión de hoy y confirma "Sí, borrar sesión"
- **THEN** la sesión se borra, vuelve al inicio y la tarjeta ofrece otra vez el día sugerido
