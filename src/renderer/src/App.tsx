import { useCallback, useEffect, useState } from 'react'

function App(): JSX.Element {
  type ConnectionItemType = {
    id: number
    name: string
    status: string
  }
  const initSate: ConnectionItemType[] = []
  window.main.onGetSensors((sensors) => {
    sensors.map((item, index) => {
      initSate.push({ id: index, name: item, status: 'Unknow' })
    })
  })
  const [isConnected, setConnected] = useState<boolean>(false)
  const [services, setServices] = useState<ConnectionItemType[]>(initSate)
  const [serviceName, setServiceName] = useState('')
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState<string>()
  const [timeTaken, setTimeTaken] = useState<number>()
  let start: Date = new Date()
  const updateService = useCallback((name: string, status: string): void => {
    console.log(name)
    setServices((services) =>
      services.map((service) => (service.name === name ? { ...service, status } : service))
    )
  }, [])

  const sendMessage = useCallback((servicename: string, request: string): void => {
    start = new Date()
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
      const receiveDate = new Date().getTime()
      const responseTimeMs = receiveDate - start
      setTimeTaken(responseTimeMs)
      addResponses(message)
    })
  }, [])

  return (
    <>
      <h2>Broker: {isConnected ? 'connected' : 'disconnected'}</h2>
      <h2>
        {' '}
        Service Discovery :
        {services.map((item) => {
          if (item.status == 'Ok') {
            return <li key={item.id}>{item.name}</li>
          }
          return null
        })}
      </h2>
      <h2> Message Sending :</h2>
      <div>
        <label>
          Available services:{' '}
          <select onChange={(e) => setServiceName(e.target.value)}>
            <option key={-1}>please select...</option>
            {services.map((item) => {
              if (item.status == 'Ok') {
                return <option key={item.id}>{item.name}</option>
              }
              return null
            })}
          </select>
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
        response :<span>{responses}</span>
      </div>
      <div>
        responseTime :<span>{timeTaken} ms</span>
      </div>
    </>
  )
}

export default App
