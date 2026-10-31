# Spec Delta

## ADDED Requirements

### Requirement: Datos offline
Después de la primera carga con conexión, la app SHALL mostrar la rutina, el catálogo y las sesiones sin conexión, SHALL guardar los cambios hechos sin conexión y SHALL sincronizarlos solos al volver la señal, sin que la interfaz quede esperando.

#### Scenario: Cargar en modo avión
- **WHEN** el usuario abre la app en modo avión, carga dos ejercicios y termina la sesión
- **THEN** la app responde igual que con señal y, al volver la conexión, la sesión aparece en Firestore

#### Scenario: Crear un extra sin señal
- **WHEN** sin conexión el usuario crea al vuelo un ejercicio extra
- **THEN** queda agregado a la sesión al instante y en el catálogo al sincronizar
