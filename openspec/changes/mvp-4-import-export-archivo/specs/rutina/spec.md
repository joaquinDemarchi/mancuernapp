# Spec Delta

## ADDED Requirements

### Requirement: Terminar rutina
En Editar rutina, un botón sutil "Terminar rutina" SHALL pedir confirmación y pasar la rutina activa a archivada con fecha de fin de hoy; sus sesiones se conservan.

#### Scenario: Cambio de rutina
- **WHEN** el usuario toca "Terminar rutina" en "Rutina 1" y confirma
- **THEN** "Rutina 1" queda archivada con fin hoy y el inicio ofrece "Nueva rutina"

### Requirement: Nueva rutina copiando la anterior
Sin rutina activa y con al menos una archivada, "Nueva rutina" SHALL crear una rutina activa con nombre "Rutina N+1" (N = cantidad de rutinas), inicio hoy y los mismos días, ejercicios y objetivos de la última archivada, y SHALL abrir su editor.

#### Scenario: Copiar
- **WHEN** "Rutina 1" (archivada) tenía Día 1 a Día 4 y el usuario toca "Nueva rutina"
- **THEN** ve el editor de "Rutina 2" con Día 1 a Día 4 y los mismos ejercicios, sin sesiones

### Requirement: Volver a una rutina archivada
Desde el historial, una rutina archivada SHALL poder reactivarse con "Volver a esta rutina" y confirmación; si hay una activa, esa pasa a archivada con fin hoy.

#### Scenario: Me equivoqué al terminar
- **WHEN** el usuario terminó "Rutina 2" por error y toca "Volver a esta rutina" en su grupo del historial
- **THEN** "Rutina 2" vuelve a estar activa y su tarjeta Hoy sigue la rotación de antes

## MODIFIED Requirements

### Requirement: Crear la rutina
Sin ninguna rutina (ni activa ni archivada), "Crear rutina" SHALL crear una rutina activa con nombre "Rutina 1", fecha de inicio de hoy y un día vacío "Día 1", y SHALL abrir su editor.

#### Scenario: Primera rutina
- **WHEN** el usuario sin rutina toca "Crear rutina"
- **THEN** ve el editor con el nombre "Rutina 1", la fecha de hoy y la pestaña "Día 1" vacía
