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
  const [serviceName, setServiceName] = useState('')
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState<string>()

  const updateService = useCallback((name: string, status: string): void => {
    setServices((services) =>
      services.map((service) => (service.name === name ? { ...service, status } : service))
    )
  }, [])

  const sendMessage = useCallback((servicename: string, request: string): void => {
    console.log(`servicename ${servicename}`)
    window.main.sendMessage(servicename, request)
  }, [])

  const addResponses = useCallback((response: string): void => {
    setResponses(response)
  }, [])
  useEffect(() => {
    window.main.onConnectionChange((connected) => {
      setConnected(connected)
    })
  }, [])

  useEffect(() => {
    window.main.onSensorStatusChanged((name, status) => {
      updateService(name, status)
    })
  }, [])
  useEffect(() => {
    window.main.onMessageArrived((message) => {
      addResponses(message)
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
      <h2> Message Sending :</h2>
      <div>
        <label>
          service:{' '}
          <input
            name="myInput"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          message:{' '}
          <input name="myMessage" value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
      </div>
      <button onClick={() => sendMessage(serviceName, message)}> Send Message</button>
      <div>
        responses :<span>{responses}</span>
      </div>
    </>
  )
}

export default App
