'use strict';

import { AccountTrackerController } from '@metamask/controllers';

export default class HardwareAccountTrackerController extends AccountTrackerController {
	constructor({ onPreferencesStateChange, getIdentities }, config, state) {
		super({ onPreferencesStateChange, getIdentities }, config, state);
	}
}
