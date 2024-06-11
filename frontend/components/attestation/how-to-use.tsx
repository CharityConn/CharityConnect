export function HowToUserSection({}: {}) {
  return (
    <section className="pb-8  pl-4 text-left lg:w-2/5">
      <h6 className="font-bold">How to use?</h6>
      <ol className="ml-4 list-decimal">
        <li>
          <a
            href="https://sepolia.easscan.org/"
            className="cursor-pointer underline"
          >
            create an EAS offchain attestation
          </a>
        </li>
        <li>upload the attestation json or qr image from the eas site.</li>
        <li>
          set the rpc url of your &quot;local network&quot; in MM to :
          <a
            href="https://sln-nodes-server.autographnft.io/json-rpc"
            className="cursor-pointer underline"
          >
            https://sln-nodes-server.autographnft.io/json-rpc
          </a>
        </li>
        <li>
          go to &quot;NFTs&quot; tab and click &quot;Import NFT&quot; in MM
          <ul className="ml-4 list-disc">
            <li>
              contract address = signer or attester address in attestation json
            </li>
            <li>token id = uid in attestation json</li>
          </ul>
        </li>
      </ol>

      <div>Then you will see the offchain attestation in your MM!</div>

      <div className="font-bold">
        Note: the same attestation can only be uploaded once, ether by issuer or
        owner.
      </div>
    </section>
  )
}
