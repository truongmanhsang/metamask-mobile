import UntypedEngine from './Engine';
import { SET_ACCOUNTS, SET_IDENTITIES, SET_RPC_TARGET, SET_SELECTED_ADDRESS } from '../actions/walletManager';
import { SET_WEB3 } from '../actions/inMemory';

const UPDATE_BG_STATE_KEY = 'UPDATE_BG_STATE';
const INIT_BG_STATE_KEY = 'INIT_BG_STATE';

class EngineService {
	private engineInitialized = false;

	/**
	 * Initializer for the EngineService
	 *
	 * @param store - Redux store
	 */
	initalizeEngine = (store: any) => {
		const reduxState = store.getState?.();
		const state = reduxState?.engine?.backgroundState || {};
		const Engine = UntypedEngine as any;

		Engine.init(state);

		const controllers = [
			{ name: 'AccountTrackerController' },
			{ name: 'AddressBookController' },
			{ name: 'AssetsContractController' },
			{ name: 'CollectiblesController' },
			{ name: 'TokensController' },
			{ name: 'TokenDetectionController' },
			{ name: 'CollectibleDetectionController' },
			{ name: 'KeyringController' },
			{ name: 'AccountTrackerController' },
			{ name: 'NetworkController' },
			{ name: 'PhishingController' },
			{ name: 'PreferencesController' },
			{ name: 'TokenBalancesController' },
			{ name: 'TokenRatesController' },
			{ name: 'TransactionController' },
			{ name: 'TypedMessageManager' },
			{ name: 'SwapsController' },
			{ name: 'TokenListController', key: `${Engine.context.TokenListController.name}:stateChange` },
			{ name: 'CurrencyRateController', key: `${Engine.context.CurrencyRateController.name}:stateChange` },
			{ name: 'GasFeeController', key: `${Engine.context.GasFeeController.name}:stateChange` },
		];

		Engine?.datamodel?.subscribe?.(() => {
			if (!this.engineInitialized) {
				store.dispatch({ type: INIT_BG_STATE_KEY });
				this.engineInitialized = true;
			}
		});

		controllers.forEach((controller) => {
			const { name, key = undefined } = controller;
			const update_bg_state_cb = () => {
				switch (name) {
					case 'PreferencesController':
						store.dispatch({
							type: SET_SELECTED_ADDRESS,
							payload: Engine.context.PreferencesController.state.selectedAddress,
						});
						store.dispatch({
							type: SET_IDENTITIES,
							payload: Engine.context.PreferencesController.state.identities,
						});
						break;
					case 'NetworkController':
						if (Engine.context.NetworkController.state.provider.rpcTarget) {
							store.dispatch({
								type: SET_RPC_TARGET,
								payload: Engine.context.NetworkController.state.provider.rpcTarget,
							});
							store.dispatch({
								type: SET_WEB3,
								payload: Engine.context.NetworkController.state.provider.rpcTarget,
							});
						}
						break;
					case 'AccountTrackerController':
						store.dispatch({
							type: SET_ACCOUNTS,
							payload: Engine.context.AccountTrackerController.state.accounts,
						});
						break;
					default:
						break;
				}
				return store.dispatch({ type: UPDATE_BG_STATE_KEY, key: name });
			};
			if (!key) Engine.context[name].subscribe(update_bg_state_cb);
			else Engine.controllerMessenger.subscribe(key, update_bg_state_cb);
		});
	};
}

/**
 * EngineService class used for initializing and subscribing to the engine controllers
 */
export default new EngineService();
