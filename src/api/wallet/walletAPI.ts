import client from '../client'

export const getWalletBalance = async (
  vaultAccountId: number,
  assetId: string,
): Promise<number> => {
  const { data } = await client.get(`/balance/${vaultAccountId}/${assetId}`)
  const balance = data.data.balance
  return balance
}
