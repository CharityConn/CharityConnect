import { Component, h, Method, Prop, State } from '@stencil/core';

@Component({
  tag: 'popover-dialog',
  styleUrl: 'popover-dialog.css',
  shadow: false,
  scoped: false,
})
export class PopoverDialog {
  @State()
  open: boolean = false;

  @Prop()
  showShareToTg?: boolean = false;

  @Prop()
  dialogStyles: { [cssProp: string]: string } = {};

  @Prop()
  modalStyles: { [cssProp: string]: string } = {};

  @Prop()
  dialogClasses: string[] = [];

  @Prop()
  disableClose = false;

  @Prop()
  fullScreen = false;

  private dismissCallback: () => void | Promise<void>;

  @Method()
  async openDialog(dismissCallback?: () => void | Promise<void>) {
    this.open = true;
    this.dismissCallback = dismissCallback;
  }

  @Method()
  async closeDialog() {
    this.open = false;
  }

  render() {
    return (
      <div class={'popover-modal' + (this.open ? ' open' : '')} style={this.modalStyles}>
        <div class={'popover-container' + (this.fullScreen ? ' fullscreen ' : '') + ' ' + this.dialogClasses.join(' ')} style={this.dialogStyles}>
          {this.showShareToTg && (
            <div class="share-to-tg">
              <share-to-tg-button></share-to-tg-button>
            </div>
          )}

          <slot name="outer-content" />
          <div class="popover-inner">
            <button
              class="close-btn"
              disabled={this.disableClose}
			  style={{"margin-right": "20px", "margin-top": "20px"}}
              onClick={() => {
                this.open = false;
                if (this.dismissCallback) {
                  this.dismissCallback();
                  this.dismissCallback = null;
                }
              }}
            >
              <img alt="close" src="/assets/icon/close.svg" />
            </button>
            <slot />
          </div>
        </div>
      </div>
    );
  }
}
