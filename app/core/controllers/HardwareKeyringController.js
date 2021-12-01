import { KeyringController } from '@metamask/controllers';

const __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P((resolve) => {
						resolve(value);
						// eslint-disable-next-line no-mixed-spaces-and-tabs
				  });
		}
		return new (P || (P = Promise))((resolve, reject) => {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator.throw(value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};

export default class HardwareKeyringController extends KeyringController {
	/**
	 * Creates a KeyringController instance.
	 *
	 * @param options - The controller options.
	 * @param options.removeIdentity - Remove the identity with the given address.
	 * @param options.syncIdentities - Sync identities with the given list of addresses.
	 * @param options.updateIdentities - Generate an identity for each address given that doesn't already have an identity.
	 * @param options.setSelectedAddress - Set the selected address.
	 * @param config - Initial options used to configure this controller.
	 * @param state - Initial state to set on this controller.
	 */
	constructor({ removeIdentity, syncIdentities, updateIdentities, setSelectedAddress }, config, state) {
		super({ removeIdentity, syncIdentities, updateIdentities, setSelectedAddress }, config, state);
	}

	/**
	 * Add only ledger address to keyring.
	 *
	 * @param ledgerWalletAddress - The ledger wallet address.
	 */
	addLedgerWalletAddress(ledgerWalletAddress) {
		// eslint-disable-next-line no-void
		return __awaiter(this, void 0, void 0, function* () {
			const oldAccounts = yield this.getAccounts();
			const newAccounts = [...oldAccounts, ledgerWalletAddress];
			this.updateIdentities(newAccounts);
			newAccounts.forEach((selectedAddress) => {
				if (!oldAccounts.includes(selectedAddress)) {
					this.setSelectedAddress(selectedAddress);
				}
			});
			return this.fullUpdate();
		});
	}
}
