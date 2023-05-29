import type { HomeAssistant } from 'custom-card-helpers';
import { hasConfigOrEntityChanged } from 'custom-card-helpers';
import type { CSSResult, PropertyValues, TemplateResult } from 'lit';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import p from '../package.json';
import flowers from './data/flowers.json';
import localize from './localize';
import type { BoilerplateCardConfig } from './types';

// eslint-disable-next-line no-console
console.info(
	`%c  FLOWER-CARD \n%c  ${localize('common.version')}: ${p.version}    `,
	'color: orange; font-weight: bold; background: black',
	'color: white; font-weight: bold; background: dimgray'
);

// This puts your card into the UI card picker dialog
window.customCards = window.customCards ?? [];
window.customCards.push({
	type: 'flower-card',
	name: localize('card.name'),
	description: localize('card.description'),
});

@customElement('flower-card')
export class FlowerCard extends LitElement {
	@property({ attribute: false }) public hass!: HomeAssistant;
	@state() private config!: BoilerplateCardConfig;

	static override get styles(): CSSResult {
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
				box-shadow: var(
					--ha-card-box-shadow,
					0 2px 2px 0 rgba(0, 0, 0, 0.14),
					0 1px 5px 0 rgba(0, 0, 0, 0.12),
					0 3px 1px -2px rgba(0, 0, 0, 0.2)
				);
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
				background-color: rgba(43, 194, 83, 1);
			}
			.meter > .bad {
				background-color: rgba(240, 163, 163);
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

	public static getStubConfig(): object {
		return {};
	}

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

		this.config = {
			name: localize('default.name'),
			...config,
		};
	}

	protected override render(): TemplateResult | void {
		if (!this.config.entity) {
			return this.#showError(localize('common.show_error'));
		}
		if (!this.config.species) {
			return this.#showError(localize('common.show_error'));
		}
		const state = this.hass.states[this.config.entity];
		const flower = flowers.db.find(f => f[0] === this.config.species);
		if (!flower) {
			return this.#showWarning(localize('common.invalid_species'));
		}
		if (!state) {
			return this.#showWarning(localize('common.invalid_entity'));
		}

		const attribute = (icon: string, val: number, min: number, max: number): TemplateResult => {
			const pct = 100 * Math.max(0, Math.min(1, (val - min) / (max - min)));

			return html`
				<div class="attribute">
					<ha-icon .icon="${icon}"></ha-icon>
					<div class="meter red">
						<span
							class="${val < min || val > max ? 'bad' : 'good'}"
							style="width: 100%;"></span>
					</div>
					<div class="meter green">
						<span class="${val > max ? 'bad' : 'good'}" style="width:${pct}%;"></span>
					</div>
					<div class="meter red">
						<span class="bad" style="width:${val > max ? 100 : 0}%;"></span>
					</div>
				</div>
			`;
		};

		return html`
			<ha-card>
				<div class="header">
					<img
						src="/local/community/lovelace-flower-card/images/${this.config
							.species}.jpg" />
					<span id="name"> ${this.config.name ?? state.attributes.friendly_name}</span>
					<span id="species"> ${flower[1]} </span>
				</div>

				<div class="divider"></div>

				<div class="attributes">
					${attribute(
						'mdi:thermometer',
						state.attributes['temperature'] as number,
						(flower[2] as number | undefined) ?? 0,
						(flower[3] as number | undefined) ?? 0
					)}
					${attribute(
						'mdi:white-balance-sunny',
						state.attributes['brightness'] as number,
						(flower[4] as number | undefined) ?? 0,
						(flower[5] as number | undefined) ?? 0
					)}
				</div>

				<div class="attributes">
					${attribute(
						'mdi:water-percent',
						state.attributes['moisture'] as number,
						(flower[6] as number | undefined) ?? 0,
						(flower[7] as number | undefined) ?? 0
					)}
					${attribute(
						'mdi:leaf',
						state.attributes['conductivity'] as number,
						(flower[8] as number | undefined) ?? 0,
						(flower[9] as number | undefined) ?? 0
					)}
				</div>
			</ha-card>
		`;
	}

	protected override shouldUpdate(changedProps: PropertyValues): boolean {
		if (!this.config) {
			return false;
		}

		return hasConfigOrEntityChanged(this, changedProps, false);
	}

	#showError(error: string): TemplateResult {
		const errorCard = document.createElement('hui-error-card');
		errorCard.setConfig({
			type: 'error',
			error,
			origConfig: this.config,
		});

		return html` ${errorCard} `;
	}

	#showWarning(warning: string): TemplateResult {
		return html` <hui-warning>${warning}</hui-warning> `;
	}
}
