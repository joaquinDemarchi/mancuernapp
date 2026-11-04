# descanso Specification

## Purpose
Timer de descanso dentro de la sesión: lo abre un botón cuando el usuario quiere (entre series o entre ejercicios), para medir la pausa sin salir de la app.

## Requirements

### Requirement: Abrir con el botón
La sesión SHALL mostrar un botón de descanso con la duración con la que abre el timer; tocarlo SHALL arrancar el timer. La duración SHALL ser el descanso del primer ejercicio sin hacer de la sesión; si no tiene, la última duración usada en la sesión; si no hubo ninguna, 1:30. Marcar, destildar o ajustar ejercicios no SHALL arrancar, cortar ni cambiar el timer.

#### Scenario: Descanso del próximo ejercicio
- **WHEN** Press banca es el primer ejercicio sin hacer, tiene descanso de 90 s y el usuario toca el botón de descanso
- **THEN** aparece el timer con 1:30 y empieza a bajar

#### Scenario: Entre series
- **WHEN** el usuario terminó una serie de Press banca, todavía sin marcarlo hecho, y toca el botón de descanso
- **THEN** el timer arranca con el descanso de Press banca

#### Scenario: Próximo sin descanso
- **WHEN** Plancha es el primer ejercicio sin hacer, no tiene descanso y el último timer de la sesión fue de 1:00
- **THEN** el botón de descanso muestra 1:00

#### Scenario: Marcar no lo toca
- **WHEN** corre el timer y el usuario marca Remo con el ✓
- **THEN** el timer sigue corriendo igual

### Requirement: Timer en pantalla
Mientras corre, el timer SHALL mostrar el tiempo que falta (M:SS) y, si la duración salió del catálogo, de qué ejercicio; SHALL permitir sumar o restar 15 s y "Saltar" (lo cierra y vuelve el botón). Mientras está visible, la sesión SHALL seguir usable (marcar, Ajustar, Terminar).

#### Scenario: Ajustar
- **WHEN** faltan 0:40 y el usuario toca "+15 s"
- **THEN** el timer muestra 0:55 y sigue bajando

#### Scenario: Saltar
- **WHEN** el usuario toca "Saltar"
- **THEN** el timer desaparece y no vibra

### Requirement: Fin del descanso
Al llegar a 0, el celu SHALL vibrar (si lo soporta) y el timer SHALL avisar que terminó el descanso hasta que el usuario lo cierre o toque "Otra vez", que lo SHALL arrancar de nuevo con la misma duración. El tiempo SHALL contarse con el reloj real: si la pantalla se apagó o la app quedó en segundo plano, al volver muestra lo que falta o que ya terminó.

#### Scenario: Termina
- **WHEN** el timer de Remo llega a 0:00 con la sesión a la vista
- **THEN** el celu vibra y el timer dice que terminó el descanso

#### Scenario: Otra vez
- **WHEN** terminó un descanso de 1:30 y el usuario toca "Otra vez"
- **THEN** el timer arranca de nuevo con 1:30

#### Scenario: Volver a la app
- **WHEN** el usuario sale de la app a los 0:20 de un descanso de 1:30 y vuelve 30 s después
- **THEN** el timer muestra 0:40

### Requirement: Pantalla prendida
Mientras el timer corre, la pantalla SHALL quedar prendida (si el navegador lo soporta) y SHALL volver a su comportamiento normal cuando el timer termina, se salta o se sale de la sesión. Sin soporte, el timer SHALL andar igual.

#### Scenario: Descanso largo
- **WHEN** corre un descanso de 3:00 sin tocar el celu
- **THEN** la pantalla no se apaga hasta que termina

### Requirement: Solo en la sesión
El timer SHALL vivir en la pantalla de sesión: salir de ella lo SHALL cortar. SHALL funcionar sin señal.

#### Scenario: Salir de la sesión
- **WHEN** corre un timer y el usuario vuelve al inicio
- **THEN** el timer se corta y al volver a la sesión no está
