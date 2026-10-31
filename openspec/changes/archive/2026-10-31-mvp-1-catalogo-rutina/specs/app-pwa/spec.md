# Spec Delta

## MODIFIED Requirements

### Requirement: Pantalla inicial vacía
Con sesión válida y sin rutina activa, la app SHALL mostrar una pantalla inicial con el nombre de la app, un estado vacío "Todavía no hay rutina", el botón "Salir" arriba y en la barra inferior las acciones "Ejercicios" (secundaria) y "Crear rutina" (primaria), usando solo tokens y componentes del Design System.

#### Scenario: Primer ingreso sin rutina
- **WHEN** un usuario permitido entra y no tiene rutinas
- **THEN** ve el nombre de la app, el texto "Todavía no hay rutina", "Salir" arriba, y "Ejercicios" y "Crear rutina" en la mitad inferior
