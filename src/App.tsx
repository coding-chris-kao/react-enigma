import { useCallback, useEffect, useState } from 'react'
import './App.scss'
import { Enigma } from './enigma/enigma'
import { config } from './enigma/enigma.config'

const enigma = new Enigma()
enigma.setConfig(config)

function App() {
  const [chars, setChars] = useState([] as string[])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (/^\w$/.test(e.key)) {
        const output = enigma.encrypt(e.key)

        setChars([...chars, output])
      }
    },
    [chars, setChars]
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
    </div>
  )
}

export default App
