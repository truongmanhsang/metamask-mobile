import Web3 from 'web3';
import { SET_TRANSPORT, SET_WEB3 } from '../../actions/inMemory';

const initialState = {
	web3: {},
	transport: null,
};

const inMemoryReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_WEB3:
			return { ...state, web3: new Web3(action.payload) };
		case SET_TRANSPORT:
			return { ...state, transport: action.payload };
		default:
			return state;
	}
};

export default inMemoryReducer;
