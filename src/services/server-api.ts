import { ofetch } from 'ofetch'
import { API_CONFIG } from '../config/api'

export async function decodePoeFormkey(html: string): Promise<string> {
  const resp = await ofetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.poeFormkey}`, {
    method: 'POST',
    body: { html },
  })
  return resp.formkey
}

type ActivateResponse =
  | {
      activated: true
      instance: { id: string }
      meta: { product_id: number }
    }
  | { activated: false; error: string }

export async function activateLicense(key: string, instanceName: string) {
  return ofetch<ActivateResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.activateLicense}`, {
    method: 'POST',
    body: {
      license_key: key,
      instance_name: instanceName,
    },
  })
}

interface Product {
  price: number
}

export async function fetchPremiumProduct() {
  return ofetch<Product>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.premiumProduct}`)
}

export async function createDiscount() {
  return ofetch<{ code: string; startTime: number }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.createDiscount}`, {
    method: 'POST',
  })
}

export interface Discount {
  code: string
  startTime: number
  price: number
  percent: number
}

export interface Campaign {
  description: string
  startTime: number
  endTime: number
}

export interface PurchaseInfo {
  price: number
  discount?: Discount
  campaign?: Campaign
}

export async function fetchPurchaseInfo() {
  return ofetch<PurchaseInfo>(`${API_CONFIG.baseUrl}/premium/purchase-info`)
}

export async function checkDiscount(params: { appOpenTimes: number; premiumModalOpenTimes: number }) {
  return ofetch<Discount>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.checkDiscount}`, {
    method: 'POST',
    body: params,
  })
}
