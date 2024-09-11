import { Component, Method, Prop, State, h } from '@stencil/core';
import { TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';
import { TokenGridContext } from '../../viewers/util/getTokensFlat';
import { ethers } from 'ethers';

@Component({
  tag: 'token-info-popover',
  styleUrl: 'token-info-popover.css',
  shadow: false,
})
export class TokenInfoPopover {
  private dialog: HTMLPopoverDialogElement;

  @State()
  private token: TokenGridContext;

  @State()
  private tsAttributes: Record<string, bigint> = {};

  @Prop()
  tokenScript: TokenScript;

  @Method()
  async openDialog(token: TokenGridContext) {
    this.token = token;

    const [contract, index] = this.token.contextId.split('-');
    this.tokenScript.setCurrentTokenContext(contract, index ? parseInt(index) : null);

    const newAttributes = {};
    for (const attribute of this.tokenScript.getAttributes()) {
      const value = await attribute.getCurrentValue();
      if (value !== undefined) newAttributes[attribute.getLabel()] = value;
    }
    this.tsAttributes = newAttributes;

    await this.dialog.openDialog();
  }

  @Method()
  async closeDialog() {
    await this.dialog.closeDialog();
  }

  render() {
    return (
      <popover-dialog ref={el => (this.dialog = el as HTMLPopoverDialogElement)} dialogClasses={['ts-token-container']}>
        {this.token ? (
          <div class="token-info-container">
            <div class="token-info-header">
              <p class="token-info-title">Charity Card #{this.tsAttributes['Card ID']}</p>
              <p class="token-info-subtitle">This is your Charity Connect Membership Card.</p>
            </div>
            <div class="token-info-attributes">
              <div class="token-info-attribute">
                <p class="label">CHARITYeet Balance</p>
                <p class="value">$CHTY {Number(ethers.formatEther(this.tsAttributes['Charity Balance'])).toFixed(6)}</p>
              </div>
              <div class="token-info-attribute">
                <p class="label">Donated</p>
                <p class="value">{Number(ethers.formatEther(this.tsAttributes['Donated'])).toFixed(6)} ETH</p>
              </div>
            </div>
            <button class="btn action-btn" onClick={() => this.closeDialog()}>
              Ok
            </button>
          </div>
        ) : (
          ''
        )}
      </popover-dialog>
    );
  }
}
