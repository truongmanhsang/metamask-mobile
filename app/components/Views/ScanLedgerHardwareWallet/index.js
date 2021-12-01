'use strict';
import React, { PureComponent } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';

import { connect } from 'react-redux';

import DeviceSelectionScreen from './DeviceSelectionScreen';

import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import BluetoothScanning from '../../commons/BluetoothScanning';
import { SET_TRANSPORT } from '../../../actions/inMemory';
import Engine from '../../../core/Engine';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import Device from '../../../util/device';
import { ADD_ADDRESS } from '../../../actions/walletManager';
import { ADD_LEDGER, HD_DERIVATION_PATH } from '../../../constants/commons';
import AppEth from '@ledgerhq/hw-app-eth';
import Logger from '../../../util/Logger';
import NotificationManager from '../../../core/NotificationManager';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 20,
	},
	backButton: {
		paddingLeft: Device.isAndroid() ? 22 : 18,
		paddingRight: Device.isAndroid() ? 22 : 18,
		marginTop: 5,
	},
});

class ScanLedgerHardwareWallet extends PureComponent {
	static navigationOptions = ({ navigation, route }) => ({
		title: strings('accounts.connect_ledger_hardware_wallet'),
		headerTitleStyle: {
			fontSize: 20,
			color: colors.fontPrimary,
			...fontStyles.normal,
		},
		headerLeft: () => (
			<TouchableOpacity
				onPress={() => {
					if (route.params && route.params.onCancel) {
						route.params.onCancel();
					}
					navigation.goBack();
				}}
				style={styles.backButton}
				testID={'title-back-arrow-button'}
			>
				<IonicIcon
					name={Device.isAndroid() ? 'md-arrow-back' : 'ios-arrow-back'}
					size={Device.isAndroid() ? 24 : 28}
					style={styles.backIcon}
				/>
			</TouchableOpacity>
		),
	});

	onSelectDevice = async (device) => {
		const { navigation, route, addresses, addAddress } = this.props;
		const transport = await TransportBLE.open(device);
		transport.on('disconnect', () => {
			this.props.setTransport(null);
		});
		this.props.setTransport(transport);
		if (route.params) {
			if (route.params.onReturn) {
				route.params.onReturn();
			}
			if (route.params.type === ADD_LEDGER) {
				try {
					const ledgerApp = new AppEth(transport);
					const { address } = await ledgerApp.getAddress(HD_DERIVATION_PATH, true);
					if (!addresses.includes(address)) {
						addAddress(address);
						Engine.context.KeyringController.addLedgerWalletAddress(address);
						NotificationManager.showSimpleNotification({
							status: `simple_notification`,
							duration: 5000,
							title: 'Done',
							description: 'Add Ledger account successfully.',
						});
					}
				} catch (error) {
					Alert.alert('Fail to add Ledger account', 'Please unlock your Ledger and open Ethereum app.', [
						{ text: strings('navigation.ok') },
					]);
					Logger.error(error);
				}
			}
		}
		navigation.goBack();
	};

	render() {
		return (
			<View style={styles.container}>
				<BluetoothScanning isAnimated />
				<DeviceSelectionScreen onSelectDevice={this.onSelectDevice.bind(this)} />
			</View>
		);
	}
}

ScanLedgerHardwareWallet.propTypes = {
	/**
	 * Object that represents the navigator
	 */
	navigation: PropTypes.object,
	/**
	 * Function that set transport to store
	 */
	setTransport: PropTypes.func,
	/**
	 * Function that add selected ledger address to list
	 */
	addAddress: PropTypes.func,
	addresses: PropTypes.array,
	route: PropTypes.object,
};

const mapStateToProps = (state) => ({
	addresses: state.walletManager.addresses,
	transport: state.inMemory.transport,
});

const mapDispatchToProps = (dispatch) => ({
	setTransport: (transport) => dispatch({ type: SET_TRANSPORT, payload: transport }),
	addAddress: (address) => dispatch({ type: ADD_ADDRESS, payload: address }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ScanLedgerHardwareWallet);
