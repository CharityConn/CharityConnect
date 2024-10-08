import { EventEmitter } from '@stencil/core';
import { ITransactionStatus, TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';
import { Attribute } from '@tokenscript/engine-js/dist/lib.esm/tokenScript/Attribute';
import { Card } from '@tokenscript/engine-js/dist/lib.esm/tokenScript/Card';
import { RequestFromView, ViewEvent } from '@tokenscript/engine-js/dist/lib.esm/view/ViewController';
import { AbstractViewBinding } from '../../../integration/abstractViewBinding';
import { CHAIN_CONFIG } from '../../../integration/constants';
import { ShowToastEventArgs } from '../../app/app';
import { showToastNotification } from '../util/showToast';
import { handleTransactionError, showTransactionNotification } from '../util/showTransactionNotification';

export class ViewBinding extends AbstractViewBinding {
  constructor(protected view: HTMLElement, private showToast?: EventEmitter<ShowToastEventArgs>) {
    super(view);
  }

  setTokenScript(tokenScript: TokenScript) {
    super.setTokenScript(tokenScript);
    this.tokenScript.on(
      'TX_STATUS',
      (data: ITransactionStatus) => {
        if (data.status !== 'error') {
          showTransactionNotification(data, this.showToast);
        } else {
          handleTransactionError(data.error, this.showToast);
        }
      },
      'card-view',
    );
  }

  async showTokenView(card: Card) {
    (this.view as HTMLDivElement).style.display = 'block';

    await super.showTokenView(card);

    this.renderAttributesTable();
  }

  async unloadTokenView() {
    (this.view as HTMLDivElement).style.display = 'none';
  }

  async renderAttributesTable() {
    const elem = this.view.querySelector('.attribute-table');

    if (!elem) return;

    let attrTable = '<tr><th>Attribute</th><th>Value</th></tr>';

    const rowRender = async (attr: Attribute, isLocal = false) => {
      return `<tr><td>${attr.getName()} ${isLocal ? '(Card)' : '(Global)'}</td><td>${await attr.getCurrentValue()}</td></tr>`;
    };

    for (let attr of this.tokenScript.getAttributes()) {
      attrTable += await rowRender(attr);
    }

    for (let attr of this.currentCard.getAttributes()) {
      attrTable += await rowRender(attr, true);
    }

    elem.innerHTML = attrTable;
  }

  async confirmAction() {
    await this.viewController.executeTransaction();
  }

  async handleMessageFromView(method: RequestFromView, params: any) {
    switch (method) {
      case RequestFromView.SET_LOADER:
        this.showLoader(params.show);
        break;
      case RequestFromView.SHOW_TX_TOAST:
        showTransactionNotification(
          {
            status: params.status,
            txLink: CHAIN_CONFIG[params?.chain].explorer ? CHAIN_CONFIG[params?.chain].explorer + params.txHash : null,
            txNumber: params.txHash,
          },
          this.showToast,
        );
        break;
      case RequestFromView.SHOW_TOAST:
        showToastNotification(params.type, params.title, params.description);
        break;
      /*case RequestFromView.EXEC_TRANSACTION:
				await this.confirmAction(params.txName);
				break;*/
      default:
        await super.handleMessageFromView(method, params);
    }

    if (method === RequestFromView.PUT_USER_INPUT) this.renderAttributesTable();
  }

  async dispatchViewEvent(event: ViewEvent, data: any, id: string) {
    await super.dispatchViewEvent(event, data, id);

    if (event === ViewEvent.TOKENS_UPDATED) this.renderAttributesTable();
  }
}
