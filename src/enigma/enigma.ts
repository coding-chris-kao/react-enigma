const START_CODE = 65
const END_CODE = 90

export interface EnigmnaConfig {
  rotorlOrders: string[]
  rotorPositions: number[]
  plugs: string[]
}

export interface Transferable {
  transfer(input: string): string
}

export class PlugBoard extends Map implements Transferable {
  public transfer(input: string) {
    if (!this.has(input)) return input
    return this.get(input)
  }

  public setPlugs(plugs: string[]) {
    for (let plug of plugs) {
      const [p1, p2] = plug.split('')
      this.set(p1, p2)
      this.set(p2, p1)
    }
  }
}

export class Rotor {
  constructor(public no: string, public offset: number) {}

  public forwardTransfer(input: string): string {
    if (input.length !== 1)
      throw new Error('Rotor.transfer: Input length must be 1')

    let charCode = input.charCodeAt(0)
    if (charCode < START_CODE && charCode > END_CODE) return input

    return String.fromCharCode(
      START_CODE + ((charCode - START_CODE + this.offset) % 26)
    )
  }

  public backwardTransfer(input: string): string {
    if (input.length !== 1)
      throw new Error('Rotor.transfer: Input length must be 1')

    let charCode = input.charCodeAt(0)
    if (charCode < START_CODE && charCode > END_CODE) return input

    return String.fromCharCode(
      START_CODE + ((26 - ((charCode - START_CODE + this.offset) % 26)) % 26)
    )
  }
}

export class Reflector implements Transferable {
  constructor(private offset = 13) {}

  public transfer(input: string) {
    if (input.length !== 1)
      throw new Error('Reflector.transfer: Input length must be 1')

    let charCode = input.charCodeAt(0)
    if (charCode < START_CODE && charCode > END_CODE) return input

    return String.fromCharCode(
      START_CODE + ((charCode - START_CODE + this.offset) % 26)
    )
  }
}

export class Enigma {
  private rotors: Rotor[] = []
  private reflector: Reflector = new Reflector()
  private plugBoard: PlugBoard = new PlugBoard()

  constructor() {
    console.log('Enigma was built.')
  }

  public resetConfig() {
    this.rotors = []
    this.plugBoard.clear()
  }

  public setConfig(config: EnigmnaConfig) {
    this.resetConfig()

    // Set rotors
    for (let i = 0; i < config.rotorlOrders.length; i++) {
      this.rotors.push(
        new Rotor(config.rotorlOrders[i], config.rotorPositions[i])
      )
    }

    // Set plug board
    this.plugBoard.setPlugs(config.plugs)
  }

  public encrypt(input: string) {
    let curValue = input.toUpperCase()

    // Encrypt forward
    curValue = this.plugBoard.transfer(curValue)

    for (let i = 0; i < this.rotors.length; i++) {
      curValue = this.rotors[i].forwardTransfer(curValue)
    }

    // Encrypt with reflector
    curValue = this.reflector.transfer(curValue)

    // Encrypt backward
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      curValue = this.rotors[i].backwardTransfer(curValue)
    }

    curValue = this.plugBoard.transfer(curValue)

    // Add one tick
    this.addOneTick()

    return curValue
  }

  public addOneTick() {
    this.rotors[0].offset++
    for (let i = 0; i < this.rotors.length; i++) {
      if (i === 0) continue
      if (this.rotors[i - 1].offset === 0) {
        this.rotors[i].offset++
      }
    }
  }

  public subtractOneTick() {
    let temp = this.rotors[0].offset - 1
    this.rotors[0].offset = (26 + temp) % 26
    for (let i = 0; i < this.rotors.length; i++) {
      if (i === 0) continue
      if (this.rotors[i - 1].offset === 25) {
        let temp = this.rotors[i].offset - 1
        this.rotors[i].offset = (26 + temp) % 26
      }
    }
  }
}
