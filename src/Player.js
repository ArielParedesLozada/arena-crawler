import InputManager from './InputManager.js'

const SPEED = 200
const DEAD_ZONE = 0.15
const BULLET_SPEED = 400
const SHOOT_COOLDOWN = 250

export default class Player {
  constructor(scene, x, y, bullets) {
    this.scene = scene
    this.bullets = bullets
    this._cooldown = 0
    this.hp = 100

    this.sprite = scene.physics.add.sprite(x, y, 'player')
    this.sprite.setCollideWorldBounds(true)
    this.sprite.setOrigin(0.5, 0.5)
  }

  get x() { return this.sprite.x }
  get y() { return this.sprite.y }

  update(delta) {
    const { dx, dy, shoot } = InputManager
    this._cooldown -= delta

    const mag = Math.sqrt(dx * dx + dy * dy)
    if (mag > DEAD_ZONE) {
      const scale = Math.min(mag, 1)
      this.sprite.setVelocity((dx / mag) * SPEED * scale, (dy / mag) * SPEED * scale)
      this.sprite.setRotation(Math.atan2(dy, dx) + Math.PI / 2)
    } else {
      this.sprite.setVelocity(0, 0)
    }

    if (shoot && this._cooldown <= 0) {
      this._cooldown = SHOOT_COOLDOWN
      this._spawnBullet()
    }
  }

  _spawnBullet() {
    const angle = this.sprite.rotation - Math.PI / 2
    const b = this.bullets.create(this.x, this.y, 'bullet')
    b.setVelocity(Math.cos(angle) * BULLET_SPEED, Math.sin(angle) * BULLET_SPEED)
  }
}
