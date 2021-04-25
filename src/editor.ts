/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  CSSResult,
  css,
  internalProperty,
} from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';

import { BoilerplateCardConfig } from './types';

@customElement('flower-card-editor')
export class BoilerplateCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @internalProperty() private _config?: BoilerplateCardConfig;
  @internalProperty() private _toggle?: boolean;
  @internalProperty() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: BoilerplateCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: 'more-info' };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: 'none' };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: 'none' };
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    // The climate more-info has ha-switch and paper-dropdown-menu elements that are lazy loaded unless explicitly done here
    this._helpers.importMoreInfoControl('climate');

    // You can restrict on domain type
    const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'plant');

    return html`
      <div class="values">
        <paper-dropdown-menu
          label="Entity (Required)"
          @value-changed=${this._valueChanged}
          .configValue=${'entity'}>
            <paper-listbox 
              slot="dropdown-content" 
              .selected=${entities.indexOf(this._entity)}>
                ${entities.map(entity => {
                  return html`
                    <paper-item>${entity}</paper-item>
                  `;
                })}
            </paper-listbox>
        </paper-dropdown-menu>
      </div>
      <div class="values">
        <paper-input
          label="Name (Optional)"
          .value=${this._name}
          .configValue=${'name'}
          @value-changed=${this._valueChanged}>
        </paper-input>
      </div>
    `
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }
    `;
  }
}
