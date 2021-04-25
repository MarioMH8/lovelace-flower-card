import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'flower-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

export interface BoilerplateCardConfig extends LovelaceCardConfig {
  type: string;
  entity?: string;
  name?: string;
  test_gui?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
