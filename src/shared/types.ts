export type AppSettings = {
  brokerClientConfig: ServiceConfig
  sensors: string[]
}

export type ServiceConfig = {
  address: string
  port: number
}
