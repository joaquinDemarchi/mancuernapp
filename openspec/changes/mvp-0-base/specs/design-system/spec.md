# Spec Delta

## ADDED Requirements

### Requirement: Tipografía Saira autoalojada
La app SHALL servir Saira desde su propio dominio como un único archivo variable (latín, ancho 75–100, peso 400–700), sin pedir fuentes a terceros, y la SHALL tener disponible sin conexión después de la primera visita.

#### Scenario: Números condensados
- **WHEN** se muestra un número con `--font-display` y `--stretch-condensed`
- **THEN** se ve Saira al 75 % de ancho con cifras tabulares

#### Scenario: Sin conexión
- **WHEN** la app abre offline después de una visita con conexión
- **THEN** el texto se ve en Saira, no en la fuente de respaldo

#### Scenario: Sin terceros
- **WHEN** se carga la app
- **THEN** ninguna petición de fuente sale a un dominio distinto del de la app
