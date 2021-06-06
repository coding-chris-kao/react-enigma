import { useCallback, useEffect, useRef, useState } from 'react'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import './App.scss'
import LightBulb, { LightBulbStatus } from './components/LightBulb'
import { Enigma } from './enigma/enigma'
import { config } from './enigma/enigma.config'

const enigma = new Enigma()
enigma.setConfig(config)

function createLightBulbs(): LightBulbStatus[][] {
  const LIGHT_BULBS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ]
  return LIGHT_BULBS.map((row) =>
    row.map((letter) => ({ letter, lightOn: false } as LightBulbStatus))
  )
}

function LightBulbRow(bulbs: LightBulbStatus[]) {
  const results = []

  for (let bulb of bulbs) {
    results.push(<LightBulb key={bulb.letter} bulb={bulb} />)
  }

  return results
}

function setLightBulbStatus(
  lightBulbs: LightBulbStatus[][],
  letter: string,
  lightOn: boolean
) {
  for (let row of lightBulbs) {
    for (let bulb of row) {
      if (bulb.letter === letter) {
        Object.assign(bulb, { lightOn })
        return lightBulbs
      }
    }
  }
  return lightBulbs
}

const encrypt$ = new Subject<KeyboardEvent>()

function App() {
  const defaultLightBulbs = createLightBulbs()
  const [chars, setChars] = useState([] as string[])
  const lightBulbs = useRef(defaultLightBulbs)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    encrypt$.next(e)
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false)

    const encryptSubscription = encrypt$
      .pipe(debounceTime(10))
      .subscribe((e: KeyboardEvent) => {
        if (/^\w$/.test(e.key)) {
          const output = enigma.encrypt(e.key)
          setLightBulbStatus(lightBulbs.current, output, true)
          setChars([...chars, output])
          setLightBulbStatus(lightBulbs.current, output, false)
        } else if (e.code === 'Space') {
          setChars([...chars, ' '])
        } else if (e.code === 'Backspace') {
          if (chars.length === 0) return
          if (chars[chars.length - 1] !== ' ') {
            enigma.subtractOneTick()
          }
          const clone = [...chars]
          clone.splice(clone.length - 1, 1)
          setChars(clone)
        }
      })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      encryptSubscription.unsubscribe()
    }
  }, [chars, lightBulbs, setChars, handleKeyDown])

  return (
    <div className="App">
      <header>
        <img src="Enigma-logo.svg" alt="Enigma" />
      </header>

      <div className="input-wrapper">
        <input
          type="text"
          className="enigma-input"
          value={chars.join('')}
          onChange={(e) => e.preventDefault()}
        />
      </div>

      <div className="row">{LightBulbRow(lightBulbs.current[0])}</div>
      <div className="row">{LightBulbRow(lightBulbs.current[1])}</div>
      <div className="row">{LightBulbRow(lightBulbs.current[2])}</div>
    </div>
  )
}

export default App
