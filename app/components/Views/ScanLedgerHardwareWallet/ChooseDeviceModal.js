'use strict';
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DeviceSelectionScreen from './DeviceSelectionScreen';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import BluetoothScanning from '../../commons/BluetoothScanning';
import { SET_TRANSPORT } from '../../../actions/inMemory';
import Device from '../../../util/device';
import { ADD_ADDRESS } from '../../../actions/walletManager';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: colors.white,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		minHeight: 200,
		maxHeight: '95%',
		paddingTop: 24,
		paddingBottom: Device.isIphoneX() ? 32 : 24,
	},
});

class ChooseDeviceModal extends PureComponent {
	onSelectDevice = async (device) => {
		const { onSelectDevice } = this.props;
		const transport = await TransportBLE.open(device);
		transport.on('disconnect', () => {
			this.props.setTransport(null);
		});
		this.props.setTransport(transport);
		onSelectDevice();
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

ChooseDeviceModal.propTypes = {
	/**
	 * Function that set transport to store
	 */
	setTransport: PropTypes.func,
	/**
	 * Function that add selected ledger address to list
	 */
	onSelectDevice: PropTypes.func,
};

const mapStateToProps = (state) => ({
	addresses: state.walletManager.addresses,
	transport: state.inMemory.transport,
});

const mapDispatchToProps = (dispatch) => ({
	setTransport: (transport) => dispatch({ type: SET_TRANSPORT, payload: transport }),
	addAddress: (address) => dispatch({ type: ADD_ADDRESS, payload: address }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChooseDeviceModal);
