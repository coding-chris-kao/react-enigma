import { useCallback, useEffect, useRef, useState } from 'react'
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

function App() {
  const defaultLightBulbs = createLightBulbs()
  const [chars, setChars] = useState([] as string[])
  const lightBulbs = useRef(defaultLightBulbs)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (/^\w$/.test(e.key)) {
        const output = enigma.encrypt(e.key)
        setLightBulbStatus(lightBulbs.current, output, true)
        setChars([...chars, output])
        setLightBulbStatus(lightBulbs.current, output, false)
      }
    },
    [chars, lightBulbs, setChars]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="App">
      <header>
        <img src="Enigma-logo.svg" alt="Enigma" />
      </header>

      <div className="indicator">{chars}</div>

      <div className="row">{LightBulbRow(lightBulbs.current[0])}</div>
      <div className="row">{LightBulbRow(lightBulbs.current[1])}</div>
      <div className="row">{LightBulbRow(lightBulbs.current[2])}</div>
    </div>
  )
}

export default App
