import { validateLicenseKey } from './lemonsqueezy'
import * as storage from './storage'

export const activatePremium = async (key: string) => {
  const result = await validateLicenseKey(key)
  if (!result.activated) {
    throw new Error('License activation failed')
  }
  await storage.setPremiumLicense(key)
  return result
}

export const deactivatePremium = async () => {
  await storage.removePremiumLicense()
}

export const validatePremium = async () => {
  const key = await storage.getPremiumLicense()
  if (!key) {
    return { valid: false }
  }
  try {
    const result = await validateLicenseKey(key)
    return { valid: result.activated }
  } catch (err) {
    console.error('Failed to validate license:', err)
    return { valid: false }
  }
}

export const getPremiumActivation = () => {
  return !!localStorage.getItem('premium_license')
}