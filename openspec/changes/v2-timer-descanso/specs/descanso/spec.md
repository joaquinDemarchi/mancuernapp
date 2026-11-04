# Spec Delta

## Purpose

Timer de descanso dentro de la sesión: arranca solo al marcar hecho un ejercicio que tiene descanso, para medir la pausa sin salir de la app.

## ADDED Requirements

### Requirement: Arranque al marcar hecho
Al marcar como hecho un ejercicio que tiene descanso (con el ✓ o con "Guardar" en Ajustar), la sesión SHALL arrancar un timer con ese descanso. Destildar un ejercicio, editar uno que ya estaba hecho o marcar uno sin descanso no SHALL arrancarlo. Si ya había un timer corriendo, el nuevo lo SHALL reemplazar.

#### Scenario: Ejercicio con descanso
- **WHEN** Press banca tiene descanso de 90 s y el usuario toca su ✓
- **THEN** aparece el timer con 1:30 y empieza a bajar

#### Scenario: Ejercicio sin descanso
- **WHEN** Plancha no tiene descanso y el usuario toca su ✓
- **THEN** no aparece ningún timer

#### Scenario: Destildar
- **WHEN** el usuario destilda Press banca mientras corre su timer
- **THEN** el timer sigue corriendo (destildar no lo arranca ni lo corta)

#### Scenario: Reemplazo
- **WHEN** corre el timer de Press banca y el usuario marca Remo, con descanso de 60 s
- **THEN** el timer pasa a 1:00 para Remo

### Requirement: Timer en pantalla
Mientras corre, el timer SHALL mostrar el tiempo que falta (M:SS) y a qué ejercicio corresponde, SHALL permitir sumar o restar 15 s y "Saltar" (lo cierra). Mientras está visible, la sesión SHALL seguir usable (marcar, Ajustar, Terminar).

#### Scenario: Ajustar
- **WHEN** faltan 0:40 y el usuario toca "+15 s"
- **THEN** el timer muestra 0:55 y sigue bajando

#### Scenario: Saltar
- **WHEN** el usuario toca "Saltar"
- **THEN** el timer desaparece y no vibra

### Requirement: Fin del descanso
Al llegar a 0, el celu SHALL vibrar (si lo soporta) y el timer SHALL avisar que terminó el descanso hasta que el usuario lo cierre o marque otro ejercicio. El tiempo SHALL contarse con el reloj real: si la pantalla se apagó o la app quedó en segundo plano, al volver muestra lo que falta o que ya terminó.

#### Scenario: Termina
- **WHEN** el timer de Remo llega a 0:00 con la sesión a la vista
- **THEN** el celu vibra y el timer dice que terminó el descanso

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
