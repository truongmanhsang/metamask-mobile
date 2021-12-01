import { PreferencesController } from '@metamask/controllers';

export default class HardwarePreferencesController extends PreferencesController {
	setTempIdentities(identities) {
		this.update({ identities: Object.assign({}, identities) });
	}
}
