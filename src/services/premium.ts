import { validateLicenseKey } from './lemonsqueezy'
import * as storage from './storage'

export async function activatePremium(key: string) {
  const result = await validateLicenseKey(key)
  if (!result.activated) {
    throw new Error('License activation failed')
  }
  await storage.setPremiumLicense(key)
  return result
}

export async function deactivatePremium() {
  await storage.removePremiumLicense()
}

export async function checkPremiumStatus() {
  const key = await storage.getPremiumLicense()
  if (!key) {
    return { activated: false }
  }
  try {
    const result = await validateLicenseKey(key)
    return { activated: result.activated }
  } catch (err) {
    console.error('Failed to validate license:', err)
    return { activated: false }
  }
}