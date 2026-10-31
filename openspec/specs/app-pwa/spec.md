# app-pwa Specification

## Purpose

Hace de MancuernApp una app instalable en el celu que abre aunque no haya señal, con nombre e ícono definidos en un único lugar y una pantalla inicial sobre la que crecen los MVP siguientes.

## Requirements

### Requirement: App instalable
La app SHALL publicarse como PWA instalable con nombre "MancuernApp", ícono de `design/icon/` (incluida la versión maskable), modo standalone y colores de fondo y tema tomados de los tokens oscuros.

#### Scenario: Instalar en Android
- **WHEN** el usuario elige "Instalar app" desde Chrome en Android
- **THEN** queda instalada como "MancuernApp" con la mancuernita celeste y abre sin barra del navegador

### Requirement: Nombre centralizado
El nombre de la app, sus textos de marca y las rutas de los íconos SHALL definirse una sola vez en `config/app.ts`; el manifest, el título del documento y las pantallas SHALL tomarlos de ahí.

#### Scenario: Renombrar la app
- **WHEN** se cambia el nombre en `config/app.ts` y se vuelve a compilar
- **THEN** el título de la pestaña, el manifest y la pantalla de login muestran el nombre nuevo sin editar otros archivos

### Requirement: Apertura offline
Después de la primera visita con conexión, la app SHALL abrir sin conexión mostrando su interfaz con la fuente y los íconos propios, sin la página de error del navegador.

#### Scenario: Abrir en el gym sin señal
- **WHEN** el usuario ya abrió la app una vez con conexión y la abre en modo avión
- **THEN** la app carga su interfaz con Saira y el ícono, sin pantalla de error del navegador

#### Scenario: Versión nueva publicada
- **WHEN** se publica una versión nueva y el usuario abre la app con conexión
- **THEN** la versión nueva queda activa como mucho en la siguiente apertura

### Requirement: Pantalla inicial vacía
Con sesión válida y sin rutina activa, la app SHALL mostrar una pantalla inicial con el nombre de la app, un estado vacío "Todavía no hay rutina", el botón "Salir" arriba y en la barra inferior las acciones "Ejercicios" (secundaria) y "Crear rutina" (primaria), usando solo tokens y componentes del Design System.

#### Scenario: Primer ingreso sin rutina
- **WHEN** un usuario permitido entra y no tiene rutinas
- **THEN** ve el nombre de la app, el texto "Todavía no hay rutina", "Salir" arriba, y "Ejercicios" y "Crear rutina" en la mitad inferior
