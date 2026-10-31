# catalogo-ejercicios Specification

## Purpose

Catálogo personal de ejercicios: cada ejercicio existe una sola vez, con su tipo, saltos y notas, para que las rutinas lo referencien y su evolución sea comparable entre rutinas.

## Requirements

### Requirement: Lista del catálogo
El sistema SHALL mostrar en "Ejercicios" todos los ejercicios del usuario ordenados alfabéticamente, cada uno con su tipo y sus saltos, con un buscador que filtra por nombre sin distinguir mayúsculas ni acentos.

#### Scenario: Buscar sin acento
- **WHEN** el catálogo tiene "Elongación" y el usuario escribe "elongacion"
- **THEN** la lista muestra "Elongación"

#### Scenario: Catálogo vacío
- **WHEN** el usuario no tiene ejercicios
- **THEN** ve un estado vacío y la acción "Nuevo ejercicio" en la barra inferior

### Requirement: Datos de un ejercicio
Un ejercicio SHALL tener nombre (obligatorio, sin espacios sobrantes), tipo (peso, reps, tiempo, cardio o calentamiento), saltos de kg, reps y segundos, y notas opcionales; solo se SHALL pedir los saltos que usa su tipo.

#### Scenario: Saltos según el tipo
- **WHEN** el tipo elegido es "Peso"
- **THEN** el formulario muestra salto de kg y salto de reps, y no salto de segundos

#### Scenario: Tipo sin saltos
- **WHEN** el tipo elegido es "Cardio" o "Calentamiento"
- **THEN** el formulario no muestra saltos

#### Scenario: Nombre vacío
- **WHEN** el nombre está vacío o solo tiene espacios
- **THEN** "Guardar" queda deshabilitado

### Requirement: Saltos por defecto
Un ejercicio nuevo SHALL arrancar con salto de 2,5 kg, ±1 rep y ±5 s; el salto de kg SHALL poder bajarse hasta 0,5 kg en pasos de 0,5.

#### Scenario: Ejercicio de mancuernas
- **WHEN** el usuario crea "Remo con mancuerna" y baja el salto de kg tres veces
- **THEN** el salto queda en 1 kg y se guarda así

#### Scenario: Mínimo
- **WHEN** el salto de kg está en 0,5
- **THEN** el botón `−` queda deshabilitado

### Requirement: Alta y edición
El usuario SHALL poder crear un ejercicio desde "Ejercicios" y editar uno existente tocándolo; los cambios SHALL guardarse al tocar "Guardar" y verse en toda rutina que lo use.

#### Scenario: Renombrar
- **WHEN** el usuario cambia el nombre de "Press banco" a "Press banca" y guarda
- **THEN** el catálogo y los días de la rutina que lo usan muestran "Press banca"

### Requirement: Nombre único
El sistema SHALL impedir dos ejercicios con el mismo nombre (sin distinguir mayúsculas ni acentos).

#### Scenario: Duplicado exacto
- **WHEN** el usuario intenta guardar "press banca" y ya existe "Press banca"
- **THEN** no se guarda y ve "Ya existe «Press banca»"

### Requirement: Sugerencia de parecidos al crear
Al crear un ejercicio con un nombre parecido a uno existente, el sistema SHALL mostrar el existente para elegirlo en lugar de crear uno nuevo.

#### Scenario: Nombre parecido
- **WHEN** el catálogo tiene "Press inclinado con mancuerna" y el usuario busca "press inclinado" para crearlo
- **THEN** ve "Press inclinado con mancuerna" como opción y, junto a "Crear «Press inclinado»", la pregunta de si no es el mismo

### Requirement: Datos del catálogo por usuario
Los ejercicios SHALL guardarse en `users/{uid}/ejercicios` y solo su dueño SHALL poder leerlos o escribirlos.

#### Scenario: Otro usuario
- **WHEN** una cuenta intenta leer los ejercicios de otro uid
- **THEN** Firestore rechaza la lectura
