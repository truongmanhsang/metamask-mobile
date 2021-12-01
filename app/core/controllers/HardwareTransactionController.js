import { TransactionController, TransactionStatus } from '@metamask/controllers';
import { query, isEIP1559Transaction } from '@metamask/controllers/dist/util';

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

export default class HardwareTransactionController extends TransactionController {
	constructor({ getNetworkState, onNetworkStateChange, getProvider }, config, state) {
		super({ getNetworkState, onNetworkStateChange, getProvider }, config, state);
	}

	approveTransactionOnLedger(transactionID, r, s, v) {
		// eslint-disable-next-line no-void
		return __awaiter(this, void 0, void 0, function* () {
			const { transactions } = this.state;
			const releaseLock = yield this.mutex.acquire();
			const { provider } = this.getNetworkState();
			const { chainId: currentChainId } = provider;
			const index = transactions.findIndex(({ id }) => transactionID === id);
			const transactionMeta = transactions[index];
			const { nonce } = transactionMeta.transaction;
			try {
				const { from } = transactionMeta.transaction;
				if (!currentChainId) {
					releaseLock();
					this.failTransaction(transactionMeta, new Error('No chainId defined.'));
					return;
				}
				const chainId = parseInt(currentChainId, undefined);
				const { approved: status } = TransactionStatus;
				const txNonce = nonce || (yield query(this.ethQuery, 'getTransactionCount', [from, 'pending']));
				transactionMeta.status = status;
				transactionMeta.transaction.nonce = txNonce;
				transactionMeta.transaction.chainId = chainId;
				const baseTxParams = Object.assign(Object.assign({}, transactionMeta.transaction), {
					gasLimit: transactionMeta.transaction.gas,
					chainId,
					nonce: txNonce,
					status,
				});
				const isEIP1559 = isEIP1559Transaction(transactionMeta.transaction);
				const txParams = isEIP1559
					? Object.assign(Object.assign({}, baseTxParams), {
							maxFeePerGas: transactionMeta.transaction.maxFeePerGas,
							maxPriorityFeePerGas: transactionMeta.transaction.maxPriorityFeePerGas,
							estimatedBaseFee: transactionMeta.transaction.estimatedBaseFee,
							// specify type 2 if maxFeePerGas and maxPriorityFeePerGas are set
							type: 2,
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  })
					: baseTxParams;
				// delete gasPrice if maxFeePerGas and maxPriorityFeePerGas are set
				if (isEIP1559) {
					delete txParams.gasPrice;
				}
				txParams.r = r;
				txParams.s = s;
				txParams.v = v;
				txParams.gasLimit = txParams.gas;
				const signedTx = this.prepareUnsignedEthTx(txParams);
				transactionMeta.status = TransactionStatus.signed;
				this.updateTransaction(transactionMeta);
				const rawTransaction = '0x' + signedTx.serialize().toString('hex');
				transactionMeta.rawTransaction = rawTransaction;
				this.updateTransaction(transactionMeta);
				transactionMeta.transactionHash = yield query(this.ethQuery, 'sendRawTransaction', [rawTransaction]);
				transactionMeta.status = TransactionStatus.submitted;
				this.updateTransaction(transactionMeta);
				this.hub.emit(`${transactionMeta.id}:finished`, transactionMeta);
			} catch (error) {
				this.failTransaction(transactionMeta, error);
			} finally {
				releaseLock();
			}
		});
	}

	getNonce(from) {
		// eslint-disable-next-line no-void
		return __awaiter(this, void 0, void 0, function* () {
			return yield query(this.ethQuery, 'getTransactionCount', [from, 'pending']);
		});
	}

	prepareTransactionOnLedger(transaction) {
		// eslint-disable-next-line no-void
		return __awaiter(this, void 0, void 0, function* () {
			const { provider } = this.getNetworkState();
			const { chainId: currentChainId } = provider;
			const chainId = parseInt(currentChainId, undefined);
			transaction.r = '0x00';
			transaction.s = '0x00';
			transaction.v = '0x' + Number(chainId).toString(16);
			transaction.chainId = '0x' + Number(chainId).toString(16);
			transaction.nonce = yield this.getNonce(transaction.from);
			transaction.gasLimit = transaction.gas;
			return transaction;
		});
	}
}
