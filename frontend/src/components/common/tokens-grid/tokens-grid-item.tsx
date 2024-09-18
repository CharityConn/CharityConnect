import { Component, h, Host, JSX, Prop, State, Watch } from '@stencil/core';
import { EthUtils } from '@tokenscript/engine-js/dist/lib.esm/ethereum/EthUtils';
import { ITokenIdContext, TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';
import { Card } from '@tokenscript/engine-js/dist/lib.esm/tokenScript/Card';
import { previewAddr } from '@tokenscript/engine-js/dist/lib.esm/utils';
import { getCardButtonClass } from '../../viewers/util/getCardButtonClass';
import { TokenGridContext } from '../../viewers/util/getTokensFlat';
import { PASS_CONTRACT, POINTS_CONTRACT } from '../../../integration/constants';

@Component({
  tag: 'tokens-grid-item',
  styleUrl: 'tokens-grid-item.css',
  shadow: false,
  scoped: false,
})
export class TokensGridItem {
  @Prop() tokenScript: TokenScript;

  @Prop() token: TokenGridContext;

  @Prop() showCard: (card: Card, token: TokenGridContext, index: number) => void;

  @Prop() openActionOverflowModal: (buttons: JSX.Element[]) => void;

  @State() cardButtons: JSX.Element[];

  @State() overflowCardButtons: JSX.Element[];

  private overflowDialog: HTMLActionOverflowModalElement;

  async componentDidLoad() {
    await this.loadCardButtons();
  }

  @Watch('tokenScript')
  private async loadCardButtons() {
    const cardButtons: JSX.Element[] = [];
    const overflowCardButtons: JSX.Element[] = [];

    // TODO: Rework NFT/fungible interfaces so they are cross compatible
    const context: ITokenIdContext = {
      originId: this.token.originId,
      chainId: 'chainId' in this.token ? this.token.chainId : this.token.collectionDetails.chainId,
      selectedTokenId: 'tokenId' in this.token ? this.token.tokenId : undefined,
    };

    const cards = this.tokenScript.getCards().filterCards(this.token.originId);

    for (let [index, card] of cards.entries()) {
      let label = card.label;

      if (label === 'Unnamed Card') label = card.type === 'token' ? 'Token Info' : card.type + ' Card';

      try {
        const enabled = await card.isEnabledOrReason(context);

        if (enabled === false) continue;

        const cardButtonClass = getCardButtonClass(card, index);
        let cardElem = (
          <button
            class={'ts-card-button btn ' + getCardButtonClass(card, index)}
            onClick={() => this.showCard(card, this.token, index)}
            disabled={enabled !== true}
            title={enabled !== true ? enabled : label}
          >
            <span>{label}</span>
          </button>
        );

        if (cardButtonClass === 'btn-secondary') {
          cardElem = <div class={'btn-wrapper'}>{cardElem}</div>;
        }

        if (enabled !== true || cardButtons.length > 2) {
          overflowCardButtons.push(cardElem);
        } else {
          cardButtons.push(cardElem);
        }
      } catch (e) {
        console.error('Failed to check if card is available', e);
      }
    }

    this.cardButtons = cardButtons;
    this.overflowCardButtons = overflowCardButtons;
  }

  private showTokenInfo(token: TokenGridContext) {
    (document.getElementById('token-info-popover') as HTMLTokenInfoPopoverElement).openDialog(token);
  }

  private async deleteAttestation() {
    if ('collectionId' in this.token && confirm('Are you sure you want to delete this attestation?')) {
      await this.tokenScript.getEngine().getAttestationManager().removeAttestation(this.token.collectionId, this.token.tokenId);
      this.tokenScript.getTokenMetadata(true);
    }
  }

  render() {
    let title;
    let details;

    if ('tokenId' in this.token && this.token.tokenId) {
      title = '#' + this.token.tokenId;
      details = this.token.name;
    } else {
      title = this.token.name;
    }
    let imageURL: string;
    const fallbackImageURL = this.tokenScript.getMetadata().imageUrl ? this.tokenScript.getMetadata().imageUrl : this.token.image ?? this.tokenScript.getMetadata().iconUrl;

    // @ts-ignore
    const contract = this.token.collectionId ?? this.token.contractAddress;
    if (contract) {
      if (contract === PASS_CONTRACT) {
        imageURL = 'assets/images/charity-connect-card.png';
      } else if (contract === POINTS_CONTRACT) {
        imageURL = 'assets/images/charity-connect-card-points.png';
      } else {
        imageURL = fallbackImageURL;
      }
    } else {
      imageURL = fallbackImageURL;
    }

    return (
      <Host class="ts-token-container tokens-grid-item">
        <token-icon src={imageURL} imageTitle={this.token.name} style={{ background: 'linear-gradient(90deg, rgba(220, 121, 255, 0.1), rgba(104, 104, 255, 0.1))' }} />
        <div class="tg-item-details">
          <div class="tg-item-heading">
            <h5>
              {previewAddr(title)}
              {'tokenId' in this.token ? <copy-icon copyText={this.token.tokenId} /> : ''}
            </h5>
            {details ? <span title={details}>{previewAddr(details)}</span> : ''}
            {this.token.tokenType !== 'erc721' ? <span title={details}>Balance: {EthUtils.calculateDecimalValue(this.token.balance, this.token.decimals)}</span> : ''}
          </div>
          <button class="btn btn-secondary info-btn" onClick={() => this.showTokenInfo(this.token)}>
            <img src="assets/icon/info-icon.svg" width={28} height={29} />
          </button>
          <div class="actions">
            {this.cardButtons ? this.cardButtons : <img class="loading-icon" alt="loading" src="assets/images/loading-icon.gif" />}
            {this.overflowCardButtons?.length ? (
              <button class="btn more-actions-btn ts-overflow-button" onClick={() => this.openActionOverflowModal(this.overflowCardButtons)}>
                + More actions
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
        <token-security-status tokenScript={this.tokenScript} originId={this.token.originId} />
        {this.token?.data?.type === 'eas' ? (
          <button class="delete-attest-btn" title="Delete attestation" onClick={() => this.deleteAttestation()}>
            X
          </button>
        ) : (
          ''
        )}
      </Host>
    );
  }
}
