# Spec Delta

## MODIFIED Requirements

### Requirement: Rutina en el inicio
Con rutina activa, el inicio SHALL mostrar su nombre, la fecha de inicio, la tarjeta "Hoy" (spec `sesion`) y la lista de días con la cantidad de ejercicios de cada uno y la fecha de la última vez que se hizo, y las acciones "Ejercicios" y "Editar rutina" (secundarias) en la barra inferior.

#### Scenario: Inicio con rutina
- **WHEN** el usuario tiene "Rutina 1" con 3 días
- **THEN** ve "Rutina 1", "desde" y la fecha, la tarjeta "Hoy" y "Día 1", "Día 2", "Día 3" con su cantidad de ejercicios

#### Scenario: Día ya hecho
- **WHEN** Día 1 se hizo por última vez el 29/10
- **THEN** su fila dice "4 ejercicios · hecho el 29/10"
