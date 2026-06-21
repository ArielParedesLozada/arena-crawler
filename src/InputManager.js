import Phaser from 'phaser'

class InputManager {
  constructor() {
    this.dx = 0
    this.dy = 0
    this.shoot = false
    this.btn1 = false

    this._shootPending = false
    this._btn1Pending = false
    this._useSerial = false
    this._keys = null
  }

  initKeyboard(scene) {
    this._keys = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      shoot: Phaser.Input.Keyboard.KeyCodes.SPACE,
    })
  }

  async connectSerial() {
    if (!('serial' in navigator)) {
      console.warn('WebSerial no disponible — usar Chrome/Edge')
      return false
    }
    try {
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate: 9600 })
      this._useSerial = true
      this._readLoop(port)
      console.log('Mando conectado')
      return true
    } catch (err) {
      console.warn('Error al conectar serial:', err)
      return false
    }
  }

  async _readLoop(port) {
    const decoder = new TextDecoderStream()
    port.readable.pipeTo(decoder.writable)
    const reader = decoder.readable.getReader()
    let buf = ''
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += value
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) this._parse(line.trim())
      }
    } finally {
      reader.releaseLock()
    }
  }

  _parse(line) {
    if (line.startsWith('JOY:')) {
      const [rawX, rawY] = line.slice(4).split(',').map(Number)
      // analogRead devuelve 0–1023, centro ≈ 512
      this.dx = Math.max(-1, Math.min(1, (rawX - 512) / 512))
      this.dy = Math.max(-1, Math.min(1, (rawY - 512) / 512))
    } else if (line.startsWith('BTN:')) {
      const n = parseInt(line.slice(4))
      if (n === 0) this._shootPending = true
      if (n === 1) this._btn1Pending = true
    }
  }

  update() {
    if (this._useSerial) {
      this.shoot = this._shootPending
      this.btn1  = this._btn1Pending
      this._shootPending = false
      this._btn1Pending  = false
    } else if (this._keys) {
      let dx = 0, dy = 0
      if (this._keys.left.isDown)  dx -= 1
      if (this._keys.right.isDown) dx += 1
      if (this._keys.up.isDown)    dy -= 1
      if (this._keys.down.isDown)  dy += 1
      // Normalizar diagonal
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707 }
      this.dx = dx
      this.dy = dy
      this.shoot = Phaser.Input.Keyboard.JustDown(this._keys.shoot)
      this.btn1  = false
    }
  }
}

export default new InputManager()
