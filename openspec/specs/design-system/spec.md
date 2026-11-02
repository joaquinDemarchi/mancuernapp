# design-system Specification

## Purpose

Define la identidad visual de MancuernApp y los tokens y componentes base que toda pantalla debe usar, para que el uso en el gym sea rápido, legible y con una mano.

## Requirements

### Requirement: Fuente única de tokens
Los colores, tipografía, espaciado y radios SHALL definirse una sola vez en `design/tokens.css` como variables CSS; ninguna pantalla SHALL usar valores visuales hardcodeados que existan como token.

#### Scenario: Cambio de color de acento
- **WHEN** se modifica el token de color de acento en `design/tokens.css`
- **THEN** todas las pantallas reflejan el nuevo color sin editar otros archivos

### Requirement: Tema oscuro por defecto con opción clara
El sistema SHALL mostrar el tema oscuro por defecto y SHALL ofrecer un tema claro; ambos temas SHALL definir todos los tokens de color.

#### Scenario: Primera apertura
- **WHEN** el usuario abre la app sin haber elegido tema
- **THEN** se muestra el tema oscuro

#### Scenario: Cambio a tema claro
- **WHEN** el usuario elige el tema claro en Ajustes
- **THEN** todos los colores pasan a los valores del tema claro

### Requirement: Contraste legible en el gym
El texto y los íconos de acción SHALL cumplir contraste WCAG AA (4,5:1 texto normal; 3:1 texto grande y componentes) en ambos temas.

#### Scenario: Valores precargados en gris
- **WHEN** se muestran los valores de la última vez en gris en la tarjeta de ejercicio
- **THEN** su contraste contra el fondo es al menos 4,5:1

### Requirement: Uso con una mano
Los controles interactivos SHALL tener un área táctil mínima de 48×48 px, y las acciones principales de cada pantalla SHALL ubicarse en la mitad inferior.

#### Scenario: Ajustar kg con el pulgar
- **WHEN** el usuario toca `−` o `+` en el stepper de kg
- **THEN** el área táctil del botón mide al menos 48×48 px

### Requirement: Componentes base documentados
El Design System SHALL documentar al menos: botón primario/secundario, stepper `−/+` con valor editable, chip de RPE (6–10), tarjeta de ejercicio (pendiente / hecho igual / ajustado), indicador de sobrecarga (Bajo/Óptimo/Alto) y barra de acción inferior.

#### Scenario: IA implementando una pantalla
- **WHEN** una IA construye una pantalla nueva
- **THEN** encuentra en el Design System el componente y sus estados sin tener que inventarlos

### Requirement: Indicador de sobrecarga no dependiente solo del color
El indicador Bajo/Óptimo/Alto SHALL distinguirse además por texto o forma, no solo por color.

#### Scenario: Pantalla con brillo o baja percepción de color
- **WHEN** se muestra el indicador en el resumen de sesión
- **THEN** el estado se entiende por su etiqueta aunque no se distinga el color

### Requirement: Nombre e ícono centralizados
El nombre "MancuernApp" y el ícono (mancuernita negra `--ground` en diagonal sobre naranja `--accent`, los mismos colores de la interfaz) SHALL existir como assets únicos en `design/icon/` (SVG fuente + PNG 192, 512 y maskable) para que el manifest y `config/app.ts` los referencien.

#### Scenario: Instalar la PWA
- **WHEN** el manifest referencia los íconos de `design/icon/`
- **THEN** el ícono instalado se ve correcto en Android, incluida la versión maskable

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
