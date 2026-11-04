# Spec Delta

## MODIFIED Requirements

### Requirement: Acceso a la evolución
La evolución SHALL abrirse desde la ficha del ejercicio en el catálogo, desde la hoja Ajustar de ese ejercicio y desde su fila en el progreso por ejercicio del resumen; volver SHALL llevar a la pantalla desde la que se abrió.

#### Scenario: Desde Ajustar
- **WHEN** el usuario abre Ajustar de Press banca y toca "Ver evolución"
- **THEN** ve la evolución de Press banca y al volver sigue en la sesión

#### Scenario: Desde el resumen
- **WHEN** el usuario toca Sentadilla en el progreso por ejercicio del resumen
- **THEN** ve la evolución de Sentadilla y al volver sigue en el resumen con el mismo período elegido
