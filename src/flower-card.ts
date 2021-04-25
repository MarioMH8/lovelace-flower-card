/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  internalProperty,
} from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types

import './editor';

import type { BoilerplateCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { localize } from './localize/localize';
import * as flowers from './flower-card.json';
import * as p from '../package.json';

/* eslint no-console: 0 */
console.info(
  `%c  FLOWER-CARD \n%c  ${localize('common.version')}: ${p.version}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'flower-card',
  name: localize('card.name'),
  description: localize('card.description'),
});

@customElement('flower-card')
export class FlowerCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('flower-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private config!: BoilerplateCardConfig;

  public setConfig(config: BoilerplateCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }
    if (!config.entity) {
      throw new Error(localize('common.invalid_configuration_entity'));
    }
    if (!config.species) {
      throw new Error(localize('common.invalid_configuration_species'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: localize('default.name'),
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this.config.entity) {
      return this._showError(localize('common.show_error'));
    }
    if (!this.config.species) {
      return this._showError(localize('common.show_error'));
    }
    const state = this.hass.states[this.config.entity];
    const flower = flowers.db.find(f => f[0] === this.config.species);
    if (!flower) {
      return this._showWarning(localize('common.invalid_species'));
    }

    const attribute = (icon, val, min, max): TemplateResult => {
          const pct = 100 * Math.max(0, Math.min(1, (val - min) / (max - min)));
          return html`
            <div class="attribute">
              <ha-icon .icon="${icon}"></ha-icon>
              <div class="meter red">
                <span
                class="${val < min || val > max ? 'bad' : 'good'}"
                style="width: 100%;"
                ></span>
              </div>
              <div class="meter green">
                <span
                class="${val > max ? 'bad' : 'good'}"
                style="width:${pct}%;"
                ></span>
              </div>
              <div class="meter red">
                <span
                class="bad"
                style="width:${val > max ? 100 : 0}%;"
                ></span>
              </div>
            </div>
          `;
    };

      return html`
        <ha-card>
          <div class="header" 
              @action=${this._handleAction}
              .actionHandler=${actionHandler({
                hasHold: hasAction(this.config.hold_action),
                hasDoubleClick: hasAction(this.config.double_tap_action),
            })}>
              <img src="/local/community/flower-card/images/${this.config.species}.jpg">
              <span id="name"> ${this.config.name || state.attributes.friendly_name}</span>
              <span id="species"> ${flower[1]} </span>
          </div>

          <div class="divider"></div>

          <div class="attributes">
              ${attribute('mdi:thermometer', state.attributes.temperature, flower[2], flower[3])}
              ${attribute('mdi:white-balance-sunny', state.attributes.brightness, flower[4], flower[5])}
          </div>

          <div class="attributes">
              ${attribute('mdi:water-percent', state.attributes.moisture, flower[6], flower[7])}
              ${attribute('mdi:leaf', state.attributes.conductivity, flower[8], flower[9])}
          </div>

        </ha-card>
      `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

    static get styles(): CSSResult {
        return css`
			ha-card {
				margin-top: 32px;
			}
			.attributes {
				white-space: nowrap;
				padding: 8px;
			}
			.attribute ha-icon {
				float: left;
				margin-right: 4px;
			}
			.attribute {
				display: inline-block;
				width: 50%;
				white-space: normal;
			}

			.header {
				padding-top: 8px;
				height: 72px;
				cursor: pointer;
			}
			.header > img {
				width: 88px;
				border-radius: var(--ha-card-border-radius, 2px);
				margin-left: 16px;
				margin-right: 16px;
				margin-top: -32px;
				float: left;
				box-shadow: var( --ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2) );
			}
			.header > #name {
				font-weight: bold;
				width: 100%;
				margin-top: 16px;
				text-transform: capitalize;
				display: block;
			}
			.header > #species {
				text-transform: capitalize;
				color: #8c96a5;
				display: block;
			}
			.meter {
				height: 8px;
				background-color: #f1f1f1;
				border-radius: 2px;
				display: inline-grid;
				overflow: hidden;
			}
			.meter.red {
				width: 10%;
			}
			.meter.green {
				width: 50%;
			}
			.meter > span {
				grid-row: 1;
				grid-column: 1;
				height: 100%;
			}
			.meter > .good {
				background-color: rgba(43,194,83,1);
			}
			.meter > .bad {
				background-color: rgba(240,163,163);
			}
			.divider {
				height: 1px;
				background-color: #727272;
				opacity: 0.25;
				margin-left: 8px;
				margin-right: 8px;
			}
        `;
    }
}
