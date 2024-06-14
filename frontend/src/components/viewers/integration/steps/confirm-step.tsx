import { Component, Prop, State, h } from '@stencil/core';
import { TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';
import { IntegrationViewer } from '../integration-viewer';

@Component({
  tag: 'confirm-step',
  // styleUrl: 'tabbed-viewer.css',
  shadow: false,
  scoped: false,
})
export class ConfirmStep {
  @Prop()
  viewer: IntegrationViewer;

  @Prop()
  tokenScript: TokenScript;

  @State()
  securityInfo;

  async componentWillLoad() {}

  render() {
    return (
      <div>
        <div style={{ textAlign: 'center' }}>
          <div>
            <p>
              <span>{document.referrer ?? 'https://somesite.com/'}</span>wants to you to perform an action with the following TokenScript:
              <br />
              (TokenScript request details displayed)
            </p>
          </div>
          <div>
            <button
              class="btn btn-primary accept-btn"
              onClick={() => {
                this.viewer.step = 'token';
              }}
            >
              Accept
            </button>
            <button
              class="btn btn-secondary deny-btn"
              onClick={() => {
                this.viewer.returnResultToRequester({
                  error: 'User denied the action',
                });
              }}
            >
              Deny
            </button>
          </div>

          <security-status tokenScript={this.tokenScript} />
        </div>
      </div>
    );
  }
}
