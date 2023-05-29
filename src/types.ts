import type {
	ActionConfig,
	LovelaceCard,
	LovelaceCardConfig,
	LovelaceCardEditor,
} from 'custom-card-helpers';

declare global {
	interface HTMLElementTagNameMap {
		'flower-card-editor': LovelaceCardEditor;
		'hui-error-card': LovelaceCard;
	}

	interface Window {
		customCards?: {
			description: string;
			name: string;
			type: string;
		}[];
	}
}

export interface BoilerplateCardConfig extends LovelaceCardConfig {
	double_tap_action?: ActionConfig;
	entity?: string;
	hold_action?: ActionConfig;
	name?: string;
	species?: string;
	tap_action?: ActionConfig;
	test_gui?: boolean;
	type: string;
}
