# acceso Specification

## Purpose

Controla quién puede entrar a MancuernApp y acceder a sus datos: login con Google restringido a una lista blanca de emails, alta del usuario y cierre de sesión.

## Requirements

### Requirement: Login con Google
El sistema SHALL requerir iniciar sesión con una cuenta de Google antes de mostrar cualquier pantalla con datos; sin sesión, SHALL mostrar solo la pantalla de login.

#### Scenario: Apertura sin sesión
- **WHEN** el usuario abre la app sin haber iniciado sesión
- **THEN** ve la pantalla de login con la acción "Entrar con Google" en la mitad inferior

#### Scenario: Sesión persistente
- **WHEN** el usuario ya inició sesión y vuelve a abrir la app
- **THEN** entra directo a la pantalla inicial sin volver a loguearse

### Requirement: Lista blanca de emails
El sistema SHALL permitir el acceso solo a cuentas cuyo email esté en la lista blanca; cualquier otra cuenta SHALL quedar deslogueada y ver un mensaje de acceso no autorizado.

#### Scenario: Email permitido
- **WHEN** inicia sesión una cuenta cuyo email está en la lista blanca
- **THEN** entra a la pantalla inicial

#### Scenario: Email no permitido
- **WHEN** inicia sesión una cuenta cuyo email no está en la lista blanca
- **THEN** se cierra su sesión y ve "Esta cuenta no tiene acceso" en la pantalla de login

### Requirement: Datos protegidos en el servidor
La base de datos SHALL rechazar lecturas y escrituras de cualquier cuenta que no esté en la lista blanca, y cada usuario SHALL acceder solo a los documentos bajo `users/{uid}` con su propio uid, aunque se saltee la app.

#### Scenario: Acceso directo de una cuenta no autorizada
- **WHEN** una cuenta de Google fuera de la lista blanca intenta leer o escribir en la base usando la configuración pública del proyecto
- **THEN** la operación es rechazada por permisos

#### Scenario: Acceso a datos de otro usuario
- **WHEN** un usuario permitido intenta leer `users/{otroUid}`
- **THEN** la operación es rechazada por permisos

### Requirement: Alta del documento de usuario
Al primer ingreso permitido, el sistema SHALL crear `users/{uid}` con email, nombre de la cuenta de Google, rol `usuario` y ajustes vacíos; en ingresos siguientes SHALL conservar el documento existente.

#### Scenario: Primer ingreso
- **WHEN** un usuario permitido entra por primera vez
- **THEN** existe `users/{uid}` con `{ email, nombre, rol: "usuario", ajustes: {} }`

#### Scenario: Ingreso repetido
- **WHEN** un usuario permitido con documento existente vuelve a entrar
- **THEN** su documento no se sobrescribe

### Requirement: Cerrar sesión
El sistema SHALL ofrecer cerrar sesión con el botón "Salir" arriba en la pantalla inicial; al hacerlo SHALL volver a la pantalla de login.

#### Scenario: Cierre de sesión
- **WHEN** el usuario toca "Salir"
- **THEN** la sesión termina y ve la pantalla de login
