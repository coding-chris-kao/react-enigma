import './light-bulb.scss'

interface Props {
  bulb: LightBulbStatus
}

export interface LightBulbStatus {
  letter: string
  lightOn: boolean
}

function LightBulb(props: Props) {
  const { bulb } = props

  let className = 'light-bulb'
  if (bulb.lightOn) className += ' on'

  return <div className={className}>{bulb.letter}</div>
}

export default LightBulb
