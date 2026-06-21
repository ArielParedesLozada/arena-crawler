# Arena Crawler — Cronograma de 10 días
**Género:** Dungeon shooter 2D cenital · **Motor:** Phaser.js v3 · **Control:** Mando físico .ino (joystick analógico + botones) · **Equipo:** 2 personas

---

## Condiciones del proyecto

| Variable | Valor |
|----------|-------|
| Días disponibles | 10 días laborables |
| Horas por día | 8 h |
| Horas totales | 80 h |
| Fabricación del mando | −8 h (día 1 completo, Dev B) |
| Horas efectivas de código | 72 h |
| Estimación del juego | 50–58 h |
| Margen de seguridad | ~14–22 h |

---

## Roles del equipo

| Persona | Perfil | Responsabilidades |
|---------|--------|-------------------|
| **Dev A** | Experiencia en servidores / lógica | IA de enemigos, sistema de salas, power-ups, lógica de juego, HUD |
| **Dev B** | Experiencia general de programación | Phaser.js, sprites, movimiento, integración .ino / WebSerial, efectos visuales |

---

## Día 1 — Fabricación del mando + setup del proyecto

> **Jornada dividida:** Dev B fabrica el mando físico (8 h). Dev A prepara el entorno de desarrollo.

### Dev A — Setup (8 h)
- Crear repositorio GitHub con estructura de carpetas: `/src`, `/assets`, `/arduino`
- Instalar y configurar Phaser.js v3 con servidor local (Vite o live-server)
- Leer documentación de Phaser: escenas, Game Objects, grupos, físicas arcade
- Preparar escena vacía con loop funcional y fondo de color
- Definir en JSON la estructura de datos del juego:
  - Configuración de enemigos (tipo, velocidad, HP, daño)
  - Configuración de power-ups (tipo, duración, efecto)
  - Configuración de salas (dimensiones, puertas, spawn points)

### Dev B — Fabricación del mando (8 h)
- Imprimir o ensamblar carcasa del mando
- Soldar y conectar joystick analógico (ejes X e Y) al Arduino
- Conectar botones: disparo, power-up, pausa (mínimo 3 botones)
- Cargar sketch `.ino` base adaptado al juego:
  - Leer ejes del joystick con `analogRead()`
  - Enviar por serial: `JOY:x,y` cada 16 ms (~60 fps)
  - Enviar por serial: `BTN:0`, `BTN:1`, `BTN:2` al presionar
- Verificar salida serial con monitor del IDE de Arduino

**Entregable del día:** Mando físico funcional que emite datos por USB. Proyecto Phaser inicializado.

---

## Día 2 — Integración del mando + jugador en pantalla

### Dev A (8 h)
- Implementar módulo `InputManager`:
  - Abrir puerto serial con **WebSerial API** (Chrome)
  - Parsear mensajes `JOY:x,y` → valores flotantes normalizados (−1.0 a 1.0)
  - Parsear mensajes `BTN:n` → eventos de botón con flag de pulsación
  - Fallback de teclado: WASD para mover, Espacio para disparar (para desarrollo sin mando)
- Exponer `InputManager.dx`, `InputManager.dy`, `InputManager.shoot` al resto del juego

### Dev B (8 h)
- Crear sprite del jugador (círculo o rectángulo temporal de 32×32 px)
- Implementar movimiento del jugador:
  - Leer `InputManager.dx` y `InputManager.dy`
  - Aplicar velocidad proporcional a la magnitud del joystick (zona muerta: |v| < 0.15)
  - Limitar posición a los bordes de la sala
- Implementar rotación del sprite hacia la dirección de movimiento
- Crear clase `Bullet`: proyectil que viaja en la dirección del jugador al soltar `BTN:0`
  - Velocidad: 400 px/s · Cooldown: 250 ms · Se destruye al salir de pantalla

**Entregable del día:** Jugador moviéndose con el mando físico y disparando balas.

---

## Día 3 — Primera sala + enemigos básicos

### Dev A (8 h)
- Implementar clase `Enemy` tipo 1 — **Corredor**:
  - HP: 30 · Velocidad: 80 px/s · Daño al contacto: 10
  - Comportamiento: moverse en línea recta hacia el jugador cada frame
  - Al recibir bala: restar HP, flash de color rojo, destruir si HP ≤ 0
- Implementar `WaveManager`:
  - Oleada = lista de enemigos a spawnear con delay entre cada uno
  - Al eliminar todos los enemigos de la oleada → emitir evento `WAVE_CLEAR`
  - Sala bloqueada mientras hay enemigos vivos (puertas cerradas)

### Dev B (8 h)
- Construir sala base en Phaser:
  - Suelo texturizado con TileSprite (textura temporal de color)
  - Paredes colisionables en los 4 bordes con física arcade
  - 4 puertas (norte, sur, este, oeste): sprites que cambian de estado (cerrada / abierta)
- Conectar física arcade:
  - Colisión bala–enemigo → destruir bala, dañar enemigo
  - Colisión enemigo–jugador → dañar jugador, knockback leve
  - Colisión jugador–pared → bloqueo de movimiento
- Añadir barra de HP del jugador como elemento HTML overlay (no canvas)

**Entregable del día:** Sala con enemigos que persiguen al jugador, se pueden matar y dañan al contacto.

---

## Día 4 — Sistema de salas encadenadas + mapa

### Dev A (8 h)
- Diseñar 6 salas en JSON (pre-diseñadas, no procedurales):
  - Sala 1: 3 enemigos corredores — tutorial implícito
  - Sala 2: 5 corredores + obstáculos (cajas)
  - Sala 3: power-up garantizado + 4 enemigos
  - Sala 4: 8 enemigos con spawn escalonado
  - Sala 5: 6 enemigos + obstáculos densos
  - Sala 6 (jefe): 1 enemigo jefe con HP alto y patrón de movimiento distinto
- Implementar `RoomManager`:
  - Al evento `WAVE_CLEAR` → abrir puerta de salida
  - Al cruzar puerta → transición (fade out/in) → cargar sala siguiente
  - El jugador mantiene HP, inventario y puntuación entre salas

### Dev B (8 h)
- Implementar transición entre salas: fade a negro (300 ms) → cargar nueva sala → fade desde negro
- Reposicionar al jugador en la entrada de la nueva sala
- Mini-mapa en HUD: cuadrícula simple que muestra salas visitadas y sala actual
- Añadir obstáculos (cajas) a las salas que lo requieran: colisionan con jugador, balas y enemigos

**Entregable del día:** Secuencia de 6 salas encadenadas con transición suave entre ellas.

---

## Día 5 — Enemigo tipo 2 + sistema de power-ups

### Dev A (8 h)
- Implementar clase `Enemy` tipo 2 — **Francotirador**:
  - HP: 20 · Velocidad: 30 px/s · Daño: 15 por proyectil
  - Comportamiento: mantenerse a distancia (> 200 px del jugador), disparar cada 2 s
  - Proyectil del enemigo: misma clase `Bullet` con `owner: enemy`
- Implementar los 4 power-ups con sus efectos:
  - **Turbo** (`BTN:1` para activar): +80% velocidad de movimiento por 5 s
  - **Disparo rápido** (automático al recoger): cooldown de bala reducido de 250 ms a 80 ms por 8 s
  - **Escudo** (automático al recoger): absorbe el siguiente impacto recibido, icono en HUD
  - **Bomba** (`BTN:1` para activar): explosión de área de 150 px de radio, 40 de daño instantáneo a todos los enemigos en rango

### Dev B (8 h)
- Sprite de power-up: caja brillante animada (tween de escala 0.9↔1.1 en loop)
- Spawn de power-up en posición aleatoria de la sala cuando `RoomManager` lo indica
- Colisión jugador–power-up → recoger, reproducir sonido, mostrar efecto en HUD
- Indicadores de HUD para power-ups activos: icono + barra de duración que se vacía
- Efecto visual de bomba: círculo de onda que se expande y desvanece

**Entregable del día:** 2 tipos de enemigo funcionando + los 4 power-ups recogibles y activos.

---

## Día 6 — Jefe final + puntuación

### Dev A (8 h)
- Implementar clase `Boss` — **Guardián**:
  - HP: 300 · Barra de HP propia visible en la parte superior del HUD
  - Fase 1 (HP > 150): patrullaje en círculo + disparo en 4 direcciones cada 1.5 s
  - Fase 2 (HP ≤ 150): velocidad ×1.5 + disparo en 8 direcciones cada 1 s
  - Al morir: explosión de partículas + evento `BOSS_DEAD` → pantalla de victoria
- Sistema de puntuación:
  - Enemigo corredor eliminado: +10 pts
  - Francotirador eliminado: +20 pts
  - Sala completada: +50 pts
  - Jefe eliminado: +200 pts
  - Penalización por daño recibido: −5 pts por golpe

### Dev B (8 h)
- Barra de HP del jefe: barra roja grande en la parte superior, con nombre "GUARDIÁN"
- Efecto de entrada del jefe: cámara tiembla 500 ms, texto "¡JEFE!" aparece centrado
- Sistema de puntuación visible en HUD (esquina superior derecha)
- Pantalla de victoria: puntuación final, tiempo de carrera, botón "Jugar de nuevo"
- Pantalla de game over (jugador muere): puntuación alcanzada, sala en la que murió, botón "Reintentar"

**Entregable del día:** Juego completo de inicio a fin: 5 salas → jefe → victoria o muerte → reinicio.

---

## Día 7 — Arte, sprites y sonido

> Día dedicado a reemplazar todos los placeholders visuales y añadir audio.

### Dev A (4 h lógica + 4 h apoyo arte)
- Ajustar hitboxes a los nuevos sprites (pueden cambiar dimensiones)
- Equilibrar valores de HP, daño y velocidad con los sprites reales en pantalla
- Revisar que los efectos de power-up se perciban claramente con el nuevo arte
- Implementar sistema de audio con **Howler.js**:
  - Música de fondo en loop (archivo libre de derechos)
  - Sonido de disparo, impacto, recogida de power-up, muerte de enemigo, muerte del jugador

### Dev B (8 h)
- Crear sprites en **Piskel** o **Aseprite** (pixel art, 32×32 px):
  - Jugador: sprite base + variante de movimiento (2 frames)
  - Enemigo corredor: sprite amenazante, color rojo
  - Enemigo francotirador: sprite diferenciado, color naranja
  - Jefe: sprite grande (64×64), aspecto intimidante
  - Balas del jugador y del enemigo (colores distintos)
  - Power-ups: 4 iconos diferenciados
  - Fondo de sala: tileset de piedra/dungeon (8 tiles distintos)
  - Paredes y puertas con marco visual claro

**Entregable del día:** Juego visualmente terminado con sprites reales y audio completo.

---

## Día 8 — Efectos, pulido y feedback de juego

> Día dedicado a que el juego se sienta bien, no solo que funcione.

### Dev A (8 h)
- **Screen shake** al recibir daño: `cameras.main.shake(150, 0.01)`
- **Hit stop**: congelar el juego 80 ms al golpear al jefe (sensación de impacto)
- Spawn de enemigos con animación de entrada (aparecen desde el suelo, escala 0→1 en 200 ms)
- Muerte de enemigo con partículas de color y rebote del sprite antes de desaparecer
- Dificultad progresiva: cada sala tiene +15% de HP en enemigos respecto a la anterior

### Dev B (8 h)
- Efectos de partículas en Phaser para disparos, impactos y explosión de bomba
- Trail de partículas detrás del jugador cuando Turbo está activo
- Flash de color blanco en el jugador al recibir daño (invulnerabilidad 800 ms)
- Animación de la barra de HP del jugador: se vacía suavemente con tween
- Tipografía del HUD: fuente pixel (importar desde Google Fonts — Press Start 2P)
- Efecto de texto flotante al recoger puntos: "+10" sube y desaparece

**Entregable del día:** Juego que se siente responsive, con feedback visual y sonoro en cada acción.

---

## Día 9 — Pruebas con el mando físico + corrección de bugs

> **Regla del día:** solo se corrigen bugs. No se añaden features nuevas.

### Dev A + Dev B (8 h juntos)

**Sesión de prueba 1 (2 h) — mando físico en mano:**
- Jugar las 6 salas completas con el mando real
- Anotar en lista todos los bugs encontrados (no corregir durante la sesión)
- Evaluar: ¿la zona muerta del joystick está bien calibrada?
- Evaluar: ¿los botones del .ino responden sin lag perceptible?
- Evaluar: ¿el juego es divertido? ¿alguna sala es frustrante o demasiado fácil?

**Corrección de bugs (4 h) — prioridad:**
1. Bugs de colisión o física que rompen el juego
2. Lag o desconexión del mando serial
3. Bugs de transición entre salas
4. Desbalance extremo de dificultad

**Ajuste fino (2 h):**
- Calibrar zona muerta del joystick si es necesario (cambiar umbral en `.ino` y en `InputManager`)
- Ajustar velocidad del jugador, cadencia de disparo y velocidad de enemigos si el juego se siente mal
- Verificar que el jefe es difícil pero derrotable en el primer intento con algo de habilidad

**Entregable del día:** Juego sin bugs críticos, mando calibrado, dificultad equilibrada.

---

## Día 10 — QA final, documentación y entrega

### Dev A (8 h)
- **README.md** completo en el repositorio:
  - Descripción del juego y capturas de pantalla
  - Requisitos: Chrome (para WebSerial), Arduino IDE
  - Cómo conectar y preparar el mando .ino (paso a paso)
  - Cómo ejecutar el juego localmente
  - Controles (mando y teclado)
  - Créditos de assets (música, fuente)
- Etiqueta de versión en GitHub: `v1.0-entrega`
- Verificar que el juego corre sin errores en Chrome en un PC limpio (sin caché, sin extensiones)

### Dev B (8 h)
- Grabar **video de demostración** (2–3 min):
  - Mostrar el mando físico antes de conectarlo
  - Jugar desde el menú hasta el jefe
  - Mostrar los 4 power-ups en uso
  - Terminar con la pantalla de victoria o game over
- Empaquetar proyecto: zip con `/src`, `/assets`, `/arduino`, `README.md`
- Subir a GitHub Pages para acceso directo por URL (sin instalación)
- Preparar presentación verbal de 5 min: decisiones de diseño, stack, mando, dificultades

**Entregable final:** Repositorio GitHub + GitHub Pages + video demo + zip de entrega + README.

---

## Stack tecnológico completo

| Capa | Tecnología | Uso |
|------|-----------|-----|
| Motor de juego | Phaser.js v3 | Escenas, sprites, física arcade, partículas, cámara |
| Control | Arduino (.ino) + WebSerial API | Joystick analógico + botones → navegador |
| Audio | Howler.js | Música de fondo, efectos de sonido |
| Arte | Piskel / Aseprite | Sprites pixel art 32×32 |
| Fuente | Press Start 2P (Google Fonts) | Tipografía HUD pixel art |
| Servidor local | Vite | Hot reload durante desarrollo |
| Despliegue | GitHub Pages | URL pública sin servidor |

---

## Definición de "listo para entregar"

- [ ] Mando físico .ino conectado y reconocido por WebSerial en Chrome
- [ ] Jugador se mueve con joystick analógico en 360°
- [ ] Jugador dispara con botón, balas destruyen enemigos
- [ ] 2 tipos de enemigo con comportamiento diferenciado
- [ ] 4 power-ups funcionales (Turbo, Disparo rápido, Escudo, Bomba)
- [ ] 6 salas encadenadas con transición suave
- [ ] Jefe final con 2 fases
- [ ] Sistema de puntuación visible
- [ ] Pantalla de victoria y game over con opción de reinicio
- [ ] Audio: música de fondo + efectos de sonido
- [ ] Sprites reales (no placeholders)
- [ ] Fallback de teclado funcional
- [ ] README con instrucciones claras
- [ ] Video de demostración grabado

---

## Tabla de riesgos

| Riesgo | Prob. | Día crítico | Mitigación |
|--------|-------|-------------|------------|
| WebSerial no conecta en el PC de presentación | Media | Día 2 | Fallback de teclado siempre activo |
| Sprites consumen más tiempo del esperado | Alta | Día 7 | Simplificar a formas geométricas de color si el tiempo aprieta |
| Jefe demasiado difícil o demasiado fácil | Media | Día 9 | HP y velocidad en JSON — 1 línea para ajustar |
| Bug de colisión Phaser en sala nueva | Media | Días 3–4 | Usar `arcade.overlap` en lugar de `collider` para balas |
| GitHub Pages no sirve bien los assets | Baja | Día 10 | Tener zip como respaldo independiente |

