import { join } from 'path'
import { AppSettings } from '../shared/types'
import { readFileSync } from 'fs'

function loadAppSettingsFile(): AppSettings {
  const appSettings: AppSettings = readJsonFile('../../resources/appsettings.json')
  return appSettings
}

export default loadAppSettingsFile()

function readJsonFile<T>(relativePath: string): T {
  const pathToFile = join(__dirname, relativePath).replace('app.asar', 'app.asar.unpacked')

  try {
    const fileContent = readFileSync(pathToFile, { encoding: 'utf-8' })
    const result: T = JSON.parse(fileContent)

    return result
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
