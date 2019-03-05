import BncClient from "../src"
import * as crypto from "../src/crypto"

const mnemonic = "fragile duck lunch coyote cotton pole gym orange share muscle impulse mom pause isolate define oblige hungry sound stereo spider style river fun account"

const keystore = {"version":1,"id":"73a811d0-5e31-4a0e-9b3a-a2a457ccbd7b","crypto":{"ciphertext":"3b","cipherparams":{"iv":"56d59d999578a0364c59934128dd215d"},"cipher":"aes-256-ctr","kdf":"pbkdf2","kdfparams":{"dklen":32,"salt":"781849b3477252928cfbe5d62180a755dce1e5b2569b02f6f14e7f46a0740687","c":262144,"prf":"hmac-sha256"},"mac":"6a967b9dad5062eac3dbc9db4e30a8f2efa60f60403aa9ea0345e50cdfb5e9d86343f5808b7e2f51b062f7c7f24189723acd4a94568e6a72bb63e6345e988c0f"}}

const targetAddress = "tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd"

let client

const getClient = async () => {
  if(client && client.chainId){
    return client
  }
  client = new BncClient("https://testnet-dex.binance.org")
  await client.initChain()
  const privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic).toString("hex")
  client.setPrivateKey(privateKey)
  return client
}

const wait = ms => {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve()
    }, ms)
  })
}

describe("BncClient test", async () => {

  it("create account", async () => {
    const client = await getClient()
    const res = client.createAccount()
    expect(res.address).toBeTruthy()
    expect(res.privateKey).toBeTruthy()
  })

  it("create account with keystore", async () => {
    const client = await getClient()
    const res = client.createAccountWithKeystore("12345678")
    expect(res.address).toBeTruthy()
    expect(res.privateKey).toBeTruthy()
    expect(res.keystore).toBeTruthy()
  })

  it("create account with mneomnic", async () => {
    const client = await getClient()
    const res = client.createAccountWithMneomnic()
    console.log(res)
    expect(res.address).toBeTruthy()
    expect(res.privateKey).toBeTruthy()
    expect(res.mnemonic).toBeTruthy()
  })

  it("recover account from keystore", async () => {
    const client = await getClient()
    const res = client.recoverAccountFromKeystore(keystore, "12345qwert!S")
    expect(res.address).toBeTruthy()
    expect(res.privateKey).toBeTruthy()
  })

  it("recover account from mneomnic", async () => {
    const client = await getClient()
    const res = client.recoverAccountFromMneomnic(mnemonic)
    expect(res.address).toBeTruthy()
    expect(res.privateKey).toBeTruthy()
  })

  it("recover account from privatekey", async () => {
    const client = await getClient()
    const pk = crypto.generatePrivateKey()
    const res = client.recoverAccountFromPrivateKey(pk)
    expect(res.address).toBeTruthy()
    expect(res.privateKey).toBeTruthy()
  })

  it("get balance", async () => {
    const client = await getClient()
    const res = await client.getBalance(targetAddress)
    expect(res.length).toBeGreaterThanOrEqual(0)
  })

  it("transfer placeOrder cancelOrder", async () => {
    jest.setTimeout(50000)
    const symbol = 'ADA.B-F2F_BNB'
    const client = await getClient()
    const addr = crypto.getAddressFromPrivateKey(client.privateKey)
    const accCode = crypto.decodeAddress(addr)
    const account = await client._httpClient.request("get", `/api/v1/account/${addr}`)
    const sequence = account.result && account.result.sequence

    const res = await client.transfer(addr, targetAddress, 1, "BNB", "hello world", sequence)
    expect(res.status).toBe(200)

    await wait(3000)

    const res1 = await client.placeOrder(addr, symbol, 1, 0.000396000, 12, sequence + 1)
    expect(res1.status).toBe(200)

    await wait(5000)

    const orderId = `${accCode.toString("hex")}-${sequence + 2}`.toUpperCase()
    const res2 = await client.cancelOrder(addr, symbol, orderId, sequence + 2)
    expect(res2.status).toBe(200)
  })

  it("get account", async () => {
    const client = await getClient(``)
    const res = await client.getAccount("tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd")
    if(res.status === 200){
      expect(res.status).toBe(200)
    }else {
      expect(res.status).toBe(204)
    }
  })
})
