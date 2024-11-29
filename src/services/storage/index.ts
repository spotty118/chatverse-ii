export const setPremiumLicense = async (key: string) => {
  localStorage.setItem('premium_license', key)
}

export const getPremiumLicense = async () => {
  return localStorage.getItem('premium_license')
}

export const removePremiumLicense = async () => {
  localStorage.removeItem('premium_license')
}