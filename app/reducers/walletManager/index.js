import {
	ADD_ADDRESS,
	SET_ACCOUNTS,
	SET_IDENTITIES,
	SET_RPC_TARGET,
	SET_SELECTED_ADDRESS,
} from '../../actions/walletManager';

const initialState = {
	identities: {},
	accounts: {},
	addresses: [],
	selectedAddress: '',
	rpcTarget: '',
	transport: {},
};

const walletManagerReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_ACCOUNTS: {
			const newAccounts = { ...state.accounts, ...action.payload };
			return { ...state, accounts: newAccounts };
		}
		case SET_IDENTITIES: {
			const newIdentities = { ...state.identities, ...action.payload };
			return { ...state, identities: newIdentities };
		}
		case SET_SELECTED_ADDRESS:
			return { ...state, selectedAddress: action.payload };
		case SET_RPC_TARGET:
			return { ...state, rpcTarget: action.payload };
		case ADD_ADDRESS: {
			const addresses = new Array(...state.addresses);
			if (!addresses.includes(action.payload)) {
				addresses.push(action.payload);
			}
			return { ...state, addresses };
		}
		default:
			return state;
	}
};

export default walletManagerReducer;
