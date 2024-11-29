import { activateLicense } from './server-api'

export async function validateLicenseKey(key: string) {
  try {
    const result = await activateLicense(key, 'browser')
    if (!result.activated) {
      throw new Error('License activation failed')
    }
    return result
  } catch (err) {
    console.error('License validation error:', err)
    throw err
  }
}