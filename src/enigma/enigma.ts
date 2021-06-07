import { Logger } from '../utils/logger'
import { reflectorSpecs, rotorSpecs } from './enigma.specification'

const DEBUG_MODE = false
const START_CODE = 65
const END_CODE = 90

export interface EnigmnaConfig {
  rotorlOrders: string[]
  rotorPositions: number[]
  reflectorType: string
  plugs: string[]
}

export class Wirable {
  public wiringMap: Map<string, string>

  constructor(wiring: string) {
    this.wiringMap = new Map<string, string>()

    let index = START_CODE
    for (let letter of wiring) {
      this.wiringMap.set(String.fromCharCode(index++), letter)
    }
  }

  public wireFrom(input: string): string {
    return this.wiringMap.has(input) ? this.wiringMap.get(input)! : input
  }
}

export class PlugBoard extends Map {
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
  public wirable: Wirable

  constructor(public name: string, public offset: number) {
    let spec = rotorSpecs.find((spec) => spec.name === name)
    if (!spec) {
      throw new Error(`Rotor constructor: The spec ${name} can not be found`)
    }
    this.wirable = new Wirable(spec.wiring)
  }

  public forwardTransfer(input: string): string {
    if (input.length !== 1)
      throw new Error('Rotor.transfer: Input length must be 1')

    let charCode = input.charCodeAt(0)
    if (charCode < START_CODE && charCode > END_CODE) return input

    const outcomePosition = (charCode - START_CODE + this.offset) % 26
    const letter = String.fromCharCode(START_CODE + outcomePosition)
    return this.wirable.wireFrom(letter)
  }

  public backwardTransfer(input: string): string {
    if (input.length !== 1)
      throw new Error('Rotor.transfer: Input length must be 1')

    let charCode = input.charCodeAt(0)
    if (charCode < START_CODE && charCode > END_CODE) return input

    const outcomePosition = (charCode - START_CODE + this.offset) % 26
    const backwardPosition = (26 - outcomePosition) % 26
    const letter = String.fromCharCode(START_CODE + backwardPosition)
    return this.wirable.wireFrom(letter)
  }
}

export class Reflector {
  public wirable: Wirable

  constructor(public name: string) {
    let spec = reflectorSpecs.find((spec) => spec.name === name)
    if (!spec) {
      throw new Error(`Rotor constructor: The spec ${name} can not be found`)
    }
    this.wirable = new Wirable(spec.wiring)
  }

  public transfer(input: string) {
    if (input.length !== 1)
      throw new Error('Reflector.transfer: Input length must be 1')

    let charCode = input.charCodeAt(0)
    if (charCode < START_CODE && charCode > END_CODE) return input

    return this.wirable.wireFrom(input)
  }
}

export class Enigma {
  private rotors: Rotor[] = []
  private reflector!: Reflector
  private plugBoard: PlugBoard = new PlugBoard()
  private logger: Logger = new Logger(DEBUG_MODE)

  constructor(config: EnigmnaConfig) {
    this.setConfig(config)
    this.logger.debug('Enigma was built.')
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

    // Set Reflector
    this.reflector = new Reflector(config.reflectorType)

    // Set plug board
    this.plugBoard.setPlugs(config.plugs)
  }

  public encrypt(input: string) {
    let curValue = input.toUpperCase()
    this.logger.debug(`Input: ${curValue}`)

    // Encrypt forward
    curValue = this.plugBoard.transfer(curValue)
    this.logger.debug(`PlugBoard: ${curValue}`)

    for (let i = 0; i < this.rotors.length; i++) {
      curValue = this.rotors[i].forwardTransfer(curValue)
      this.logger.debug(`Rotor ${i}: ${curValue}`)
    }

    // Encrypt with reflector
    curValue = this.reflector.transfer(curValue)
    this.logger.debug(`Reflector: ${curValue}`)

    // Encrypt backward
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      curValue = this.rotors[i].backwardTransfer(curValue)
      this.logger.debug(`Rotor ${i}: ${curValue}`)
    }

    curValue = this.plugBoard.transfer(curValue)
    this.logger.debug(`PlugBoard: ${curValue}`)

    // Add one tick
    this.addOneTick()
    this.logger.debug(
      'Offset: ',
      this.rotors.map((r) => r.offset)
    )

    return curValue
  }

  public addOneTick() {
    let carry = false
    this.rotors[0].offset = this.mutateOffset(this.rotors[0].offset, 1)
    if (this.rotors[0].offset === 0) carry = true

    for (let i = 0; i < this.rotors.length; i++) {
      if (i === 0) continue
      if (!carry) break
      this.rotors[i].offset = this.mutateOffset(this.rotors[i].offset, 1)
      carry = false
      if (this.rotors[i].offset === 0) carry = true
    }
  }

  public subtractOneTick() {
    let carry = false
    this.rotors[0].offset = this.mutateOffset(this.rotors[0].offset, -1)
    if (this.rotors[0].offset === 25) carry = true

    for (let i = 0; i < this.rotors.length; i++) {
      if (i === 0) continue
      if (!carry) break
      this.rotors[i].offset = this.mutateOffset(this.rotors[i].offset, -1)
      carry = false
      if (this.rotors[i].offset === 25) carry = true
    }
  }

  /**
   * To make sure the offset must in the boundary [0, 26)
   * @param offset The offset before mutated
   * @param value The value to mutate offset
   * @returns New offset which is greater than 0 and less than 26
   */
  private mutateOffset(offset: number, value: number) {
    let temp = (offset + value) % 26
    if (temp < 0) {
      temp = 26 + temp
    }
    return temp
  }
}
