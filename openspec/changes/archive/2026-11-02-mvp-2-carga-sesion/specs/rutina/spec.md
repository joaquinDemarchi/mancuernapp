# Spec Delta

## MODIFIED Requirements

### Requirement: Rutina en el inicio
Con rutina activa, el inicio SHALL mostrar su nombre como título con la fecha de inicio debajo, la tarjeta "Hoy" (spec `sesion`) y un botón sutil "Ver rutina" que despliega la lista de días (solo lectura) con la cantidad de ejercicios, sus nombres y la fecha de la última vez que se hizo, junto con las acciones secundarias "Ejercicios" y "Editar rutina".

#### Scenario: Inicio con rutina
- **WHEN** el usuario tiene "Rutina 1" con 3 días
- **THEN** ve "Rutina 1", "desde" y la fecha, la tarjeta "Hoy" y "Ver rutina"; al tocarlo ve "Día 1", "Día 2", "Día 3" con su cantidad de ejercicios

#### Scenario: Día ya hecho
- **WHEN** Día 1 se hizo por última vez el 29/10 y el usuario tocó "Ver rutina"
- **THEN** su fila dice "4 ejercicios · hecho el 29/10"
