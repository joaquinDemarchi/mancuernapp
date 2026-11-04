# Spec Delta

## MODIFIED Requirements

### Requirement: Datos de un ejercicio
Un ejercicio SHALL tener nombre (obligatorio, sin espacios sobrantes), tipo (peso, reps, tiempo, cardio o calentamiento), saltos de kg, reps y segundos, notas opcionales y un descanso opcional; solo se SHALL pedir los saltos que usa su tipo. El descanso SHALL poder quedar vacío (sin timer) o ir de 15 s a 5 min en pasos de 15 s, para cualquier tipo.

#### Scenario: Saltos según el tipo
- **WHEN** el tipo elegido es "Peso"
- **THEN** el formulario muestra salto de kg y salto de reps, y no salto de segundos

#### Scenario: Tipo sin saltos
- **WHEN** el tipo elegido es "Cardio" o "Calentamiento"
- **THEN** el formulario no muestra saltos

#### Scenario: Nombre vacío
- **WHEN** el nombre está vacío o solo tiene espacios
- **THEN** "Guardar" queda deshabilitado

#### Scenario: Sin descanso
- **WHEN** el usuario crea un ejercicio sin tocar el descanso
- **THEN** se guarda sin descanso y la ficha muestra "Sin descanso" marcado

#### Scenario: Con descanso
- **WHEN** el usuario pone 1:30 de descanso en Press banca y guarda
- **THEN** la ficha muestra 1:30 y, cuando Press banca es el próximo ejercicio de la sesión, el timer de descanso abre con 1:30
