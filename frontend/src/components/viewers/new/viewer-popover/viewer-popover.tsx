import { Component, Element, Event, EventEmitter, Host, JSX, Method, State, h } from '@stencil/core';
import { ScriptSourceType } from '@tokenscript/engine-js/dist/lib.esm/Engine';
import { ITransactionStatus, TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';
import { Card } from '@tokenscript/engine-js/dist/lib.esm/tokenScript/Card';
import { ShowToastEventArgs } from '../../../app/app';
import { WalletConnection, Web3WalletProvider } from '../../../wallet/Web3WalletProvider';
import { getCardButtonClass } from '../../util/getCardButtonClass';
import { TokenGridContext } from '../../util/getTokensFlat';
import { handleTransactionError, showTransactionNotification } from '../../util/showTransactionNotification';

@Component({
  tag: 'viewer-popover',
  styleUrl: 'viewer-popover.css',
  shadow: false,
  scoped: false,
})
export class ViewerPopover {
  @State()
  private walletConnection: WalletConnection;

  @Element()
  host;

  @State()
  tokenScript?: TokenScript;

  @State()
  onboardingCards?: Card[];

  @Event({
    eventName: 'showToast',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  showToast: EventEmitter<ShowToastEventArgs>;

  @Event({
    eventName: 'showLoader',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  showLoader: EventEmitter<void>;

  @Event({
    eventName: 'hideLoader',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  hideLoader: EventEmitter<void>;

  @State()
  private overflowCardButtons: JSX.Element[];
  private overflowDialog: HTMLActionOverflowModalElement;

  componentWillLoad() {
    Web3WalletProvider.registerWalletChangeListener(async (walletConnection?: WalletConnection) => {
      // if wallet disconnected or switched, reload the pass from dashboard
      if (!walletConnection || (this.walletConnection && this.walletConnection.address !== walletConnection.address)) {
        this.close();
      }
      this.walletConnection = walletConnection;
    });
  }

  @Method()
  async open(tokenScript: TokenScript) {
    this.tokenScript = tokenScript;

    const onboardingCards = tokenScript.getCards().getOnboardingCards();

    const enabledCards = [];

    for (let [index, card] of onboardingCards.entries()) {
      let label = card.label;

      if (label === 'Unnamed Card') label = card.type === 'token' ? 'Token Info' : card.type + ' Card';

      try {
        const enabled = await card.isEnabledOrReason();

        console.log('Card enabled: ', enabled);

        if (enabled === false) continue;

        const cardElem = (
          <button
            class={'ts-card-button btn ' + getCardButtonClass(card, index)}
            onClick={() => this.showCard(card)}
            disabled={enabled !== true}
            title={enabled !== true ? enabled : label}
          >
            <span>{label}</span>
          </button>
        );

        enabledCards.push(cardElem);
      } catch (e) {
        console.error('Failed to check if card is available', e);
      }
    }

    this.onboardingCards = enabledCards;

    // Update URL
    const params = new URLSearchParams(document.location.search);

    const sourceInfo = this.tokenScript.getSourceInfo();

    if (sourceInfo.source !== ScriptSourceType.UNKNOWN && !params.has('emulator')) {
      if (sourceInfo.source === ScriptSourceType.SCRIPT_URI) {
        const [chain, contract] = sourceInfo.tsId.split('-');
        if (contract) {
          params.set('chain', chain);
          params.set('contract', contract);
        } else {
          params.set('tsId', sourceInfo.tsId);
        }
      } else {
        params.set('tokenscriptUrl', sourceInfo.sourceUrl);
      }
    }

    const location = new URL(document.location.href);
    location.search = params.toString();

    history.pushState(undefined, undefined, location);
  }

  private async showCard(card: Card, token?: TokenGridContext, cardIndex?: number) {
    if (token) {
      const refs = token.contextId.split('-');
      this.tokenScript.setCurrentTokenContext(refs[0], refs.length > 1 ? parseInt(refs[1]) : null);
    } else {
      this.tokenScript.unsetTokenContext();
    }

    this.showLoader.emit();

    try {
      await this.tokenScript.showOrExecuteTokenCard(card, async (data: ITransactionStatus) => {
        if (data.status === 'started') this.showLoader.emit();

        if (data.status === 'completed') this.hideLoader.emit();

        await showTransactionNotification(data, this.showToast);

        await this.tokenScript.getTokenMetadata(true);
      });
    } catch (e) {
      console.error(e);
      this.hideLoader.emit();
      handleTransactionError(e, this.showToast);
      return;
    }

    this.hideLoader.emit();
  }

  private async openActionOverflowModal(buttons: JSX.Element[]) {
    this.overflowCardButtons = buttons;
    this.overflowDialog.openDialog();
  }

  @Method()
  async close() {
    this.tokenScript = null;
    const location = new URL(document.location.href);
    const params = new URLSearchParams(document.location.search);
    params.delete('chain');
    params.delete('contract');
    params.delete('tsId');
    params.delete('tokenscriptUrl');
    params.delete('tokenId');
    location.search = params.toString();
    history.pushState(undefined, undefined, location);
  }

  render() {
    return this.tokenScript ? (
      <Host class={this.tokenScript ? ' open' : ''}>
        <style innerHTML={this.tokenScript ? this.tokenScript.viewStyles.getViewCss() : ''} />
        <div class="toolbar">
          <div class="view-heading">
            <button class="btn" onClick={() => this.close()}>
              &lt;
            </button>
            <h3>{this.tokenScript.getLabel(2) ?? this.tokenScript.getName()}</h3>
          </div>
        </div>
        <div class="meta-details">
          {this.tokenScript.getMetadata().description ? <p>{this.tokenScript.getMetadata().description}</p> : ''}
          {this.tokenScript.getMetadata().aboutUrl ? (
            <a class="how-it-works" href={this.tokenScript.getMetadata().aboutUrl} target="_blank">
              {'Discover how it works'}
              <img alt="about" src="/assets/icon/question.svg" />
            </a>
          ) : (
            ''
          )}
        </div>
        {this.onboardingCards ? <div class="onboarding-cards">{this.onboardingCards}</div> : ''}
        <tokens-grid
          tokenScript={this.tokenScript}
          showCard={this.showCard.bind(this)}
          openActionOverflowModal={this.openActionOverflowModal.bind(this)}
          closeView={this.close.bind(this)}
        ></tokens-grid>
        <action-overflow-modal ref={el => (this.overflowDialog = el as HTMLActionOverflowModalElement)}>
          <div class="actions">{this.overflowCardButtons}</div>
        </action-overflow-modal>
        <card-popover tokenScript={this.tokenScript}></card-popover>
        <token-info-popover id="token-info-popover" tokenScript={this.tokenScript} />
        <token-security-status-popover id="token-security-status-popover" />
      </Host>
    ) : (
      ''
    );
  }
}
