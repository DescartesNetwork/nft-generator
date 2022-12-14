import {
  bundlrStorage,
  CreateNftInput,
  Metadata,
  Metaplex,
  MetaplexFile,
  NftWithToken,
  UpdateNftInput,
  UploadMetadataInput,
  walletAdapterIdentity,
} from '@metaplex-foundation/js'
import { util } from '@sentre/senhub'
import { PublicKey } from '@solana/web3.js'

import { ConcreteMetaplexAdapter } from './walletMetaplexAdapter'
import configs from 'configs'

const {
  sol: { connection, bundlrConfig },
} = configs

class MetaplexNFT {
  public static instance: MetaplexNFT
  private _metaplex: Metaplex

  constructor(metaplex: Metaplex) {
    this._metaplex = metaplex
  }

  static async initializeMetaplex() {
    if (!MetaplexNFT.instance) {
      const newMetaplex = Metaplex.make(connection)
        .use(
          walletAdapterIdentity(
            await ConcreteMetaplexAdapter.createPublicKey(window.sentre.wallet),
          ),
        )
        .use(bundlrStorage(bundlrConfig!))

      MetaplexNFT.instance = new MetaplexNFT(newMetaplex)
    }
    return MetaplexNFT.instance
  }

  createNFT = async (input: CreateNftInput): Promise<NftWithToken> => {
    const { nft } = await this._metaplex.nfts().create(input).run()
    return nft
  }

  findAllNftsByOwner = async (ownerAddress: string) => {
    if (!util.isAddress(ownerAddress)) throw new Error('Invalid address!')
    const arrayNFTs = await this._metaplex
      .nfts()
      .findAllByOwner({ owner: this._metaplex.identity().publicKey })
      .run()
    return arrayNFTs
  }

  findByMint = async (nftAddress: PublicKey) => {
    const nftInfo = await this._metaplex
      .nfts()
      .findByMint({ mintAddress: nftAddress })
      .run()
    return nftInfo
  }

  findAllByMintList = async (mintAddresses: PublicKey[]) => {
    const nftInfo = await this._metaplex
      .nfts()
      .findAllByMintList({ mints: mintAddresses })
      .run()
    return nftInfo
  }

  // Get nft information include metadata
  load = async (metadata: Metadata) => {
    return await this._metaplex.nfts().load({ metadata }).run()
  }

  findAllByCreator = async (creator: PublicKey) => {
    const nftList = await this._metaplex
      .nfts()
      .findAllByCreator({ creator })
      .run()
    return nftList
  }

  uploadMetadata = async (data: UploadMetadataInput) => {
    const { uri } = await this._metaplex.nfts().uploadMetadata(data).run()
    return uri
  }

  uploadFile = async (data: MetaplexFile) => {
    return await this._metaplex.storage().upload(data)
  }

  update = async (nft: UpdateNftInput) => {
    return await this._metaplex.nfts().update(nft).run()
  }

  printNewEdition = async (originalMint: PublicKey) => {
    const { nft: printedNft } = await this._metaplex
      .nfts()
      .printNewEdition({ originalMint })
      .run()
    return printedNft
  }

  getCost = async (file: any) => {
    const price = (
      await this._metaplex.storage().getUploadPriceForFile(file)
    ).basisPoints.toString(10)
    return price
  }
}

export default MetaplexNFT
