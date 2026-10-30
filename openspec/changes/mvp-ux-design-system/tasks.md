# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Diseño en sesión separada del código. Total estimado: ~33k tokens.

## 1. Direcciones visuales (~12k)

- [x] 1.1 Con la skill taste, crear un artifact **Design** con 2–3 direcciones visuales, cada una mostrando "Hoy: Día X" (lista), tarjeta de ejercicio en modo Ajustar (stepper kg/reps, bloques, chips RPE) y resumen de sesión con indicador Bajo/Óptimo/Alto, en tema oscuro (~10k)
- [x] 1.2 Presentar las opciones a Lio, registrar la elección y ajustes pedidos en `traspaso.md`; commit (~2k)

## 2. Design System (~11k)

- [ ] 2.1 Crear el artifact **Design System** desde la dirección elegida: tokens de color oscuro/claro (con contraste AA verificado), tipografía con números tabulares, escala de espaciado, radios y elevación (~6k)
- [ ] 2.2 Documentar componentes base con estados: botón primario/secundario, stepper `−/+` editable, chip RPE 6–10, tarjeta de ejercicio (pendiente / hecho igual / ajustado), indicador de sobrecarga con etiqueta, barra de acción inferior; touch targets ≥ 48 px; commit (~5k)

## 3. Ícono (~5k)

- [ ] 3.1 Dibujar `design/icon/icon.svg` (mancuernita celeste en diagonal, fondo blanco) y exportar `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (zona segura 80%); mostrar a Lio y commit (~5k)

## 4. Handoff al repo (~5k)

- [ ] 4.1 Escribir `design/tokens.css` (`:root` oscuro, `[data-theme="light"]` claro) con los tokens del Design System (~2k)
- [ ] 4.2 Escribir `design/README.md`: links a los artifacts, resumen de componentes y reglas de uso (una mano, ≥ 48 px, indicador no solo por color); verificar contraste de pares clave; commit (~3k)
