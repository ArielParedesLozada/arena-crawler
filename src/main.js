import Phaser from 'phaser'
import InputManager from './InputManager.js'
import Player from './Player.js'

const W = 800
const H = 600
const WALL = 32

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    // Triangulo verde apuntando arriba (dirección de disparo)
    const pg = this.make.graphics({ add: false })
    pg.fillStyle(0x00ff88)
    pg.fillTriangle(16, 0, 32, 32, 0, 32)
    pg.generateTexture('player', 32, 32)
    pg.destroy()

    // Bala: círculo amarillo pequeño
    const bg = this.make.graphics({ add: false })
    bg.fillStyle(0xffff00)
    bg.fillCircle(4, 4, 4)
    bg.generateTexture('bullet', 8, 8)
    bg.destroy()
  }

  create() {
    // Fondo
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e)

    // Bordes de sala (visual)
    const wallColor = 0x334455
    this.add.rectangle(W / 2, WALL / 2,       W, WALL, wallColor) // norte
    this.add.rectangle(W / 2, H - WALL / 2,   W, WALL, wallColor) // sur
    this.add.rectangle(WALL / 2, H / 2,       WALL, H, wallColor) // oeste
    this.add.rectangle(W - WALL / 2, H / 2,   WALL, H, wallColor) // este

    // Límites de física = interior de las paredes
    this.physics.world.setBounds(WALL, WALL, W - WALL * 2, H - WALL * 2)

    // Grupo de balas
    this.bullets = this.physics.add.group()

    // Jugador
    this.player = new Player(this, W / 2, H / 2, this.bullets)
    InputManager.initKeyboard(this)

    // Indicador de estado del mando (pulsar C para conectar)
    this._statusText = this.add.text(WALL + 8, WALL + 8,
      'Teclado: WASD + Espacio  |  C = conectar mando', {
        fontSize: '13px', color: '#556677'
      })

    this.input.keyboard.on('keydown-C', async () => {
      const ok = await InputManager.connectSerial()
      this._statusText.setText(ok ? 'Mando conectado' : 'Error al conectar mando')
    })
  }

  update(_time, delta) {
    InputManager.update()
    this.player.update(delta)

    // Destruir balas fuera del área de juego
    this.bullets.children.forEach(b => {
      if (!this.physics.world.bounds.contains(b.x, b.y)) b.destroy()
    })
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  parent: document.body,
})
