# Spec Delta

## MODIFIED Requirements

### Requirement: Nombre e ícono centralizados
El nombre "MancuernApp" y el ícono (mancuernita negra `--ground` en diagonal sobre naranja `--accent`, los mismos colores de la interfaz) SHALL existir como assets únicos en `design/icon/` (SVG fuente + PNG 192, 512 y maskable) para que el manifest y `config/app.ts` los referencien.

#### Scenario: Instalar la PWA
- **WHEN** el manifest referencia los íconos de `design/icon/`
- **THEN** el ícono instalado se ve correcto en Android, incluida la versión maskable
