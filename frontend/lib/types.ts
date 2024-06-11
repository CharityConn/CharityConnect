export type EasAttestations = Array<{
  email: string
  attester: string
  uid: string
}>

export type IDData = {
  idType: string
  value: string | null
  secret?: string
}
