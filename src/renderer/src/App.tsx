import { useCallback, useEffect, useState } from 'react'

function App(): JSX.Element {
  type ConnectionItemType = {
    id: number
    name: string
    status: string
  }
  const initSate: ConnectionItemType[] = [
    {
      id: 1,
      status: 'Unknown',
      name: 'map'
    },
    {
      id: 2,
      status: 'Unknown',
      name: 'radar'
    }
  ]
  const [isConnected, setConnected] = useState<boolean>(false)
  const [services, setServices] = useState<ConnectionItemType[]>(initSate)

  const updateService = useCallback((name: string, status: string): void => {
    setServices((services) =>
      services.map((service) => (service.name === name ? { ...service, status } : service))
    )
  }, [])
  useEffect(() => {
    window.main.onConnectionChange((connected) => {
      setConnected(connected)
    })
  }, [])

  useEffect(() => {
    window.main.onSensorStatusChanged((name, status) => {
      console.log(status)
      updateService(name, status)
    })
  }, [])

  return (
    <>
      <h2>Broker is connected : {isConnected ? <li>true</li> : <li>false</li>}</h2>
      <h2>
        {' '}
        Service Discovery :
        {services.map((item) => {
          if (item.status == 'Ok') {
            return (
              <li key={item.id}>
                {item.name} {item.status}
              </li>
            )
          }
          return null
        })}
      </h2>
    </>
  )
}

export default App
