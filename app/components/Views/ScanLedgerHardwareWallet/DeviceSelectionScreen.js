import React, { Component } from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { StyleSheet, Text, View, FlatList, Platform, PermissionsAndroid } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Observable } from 'rxjs';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import DeviceItem from './DeviceItem';
import PropTypes from 'prop-types';

const deviceAddition =
	(device) =>
	({ devices }) => ({
		devices: devices.some((i) => i.id === device.id) ? devices : devices.concat(device),
	});

const styles = StyleSheet.create({
	header: {
		paddingTop: 80,
		paddingBottom: 36,
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 22,
		marginBottom: 16,
	},
	// eslint-disable-next-line react-native/no-color-literals
	headerSubtitle: {
		marginLeft: 12,
		marginRight: 12,
		fontSize: 15,
		color: '#999',
	},
	list: {
		flex: 1,
	},
	// eslint-disable-next-line react-native/no-color-literals
	errorTitle: {
		color: '#c00',
		fontSize: 16,
		marginBottom: 16,
	},
});

class DeviceSelectionScreen extends Component {
	state = {
		devices: [],
		error: null,
		refreshing: false,
	};

	static propTypes = {
		onSelectDevice: PropTypes.func,
	};

	async componentDidMount() {
		// NB: this is the bare minimal. We recommend to implement a screen to explain to user.
		if (Platform.OS === 'android') {
			await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
		}
		let previousAvailable = false;
		Observable.create(TransportBLE.observeState).subscribe((e) => {
			if (e.available !== previousAvailable) {
				previousAvailable = e.available;
				if (e.available) {
					this.reload();
				}
			}
		});

		await this.startScan();
	}

	componentWillUnmount() {
		if (this.sub) this.sub.unsubscribe();
	}

	startScan = async () => {
		this.setState({ refreshing: true });
		this.sub = Observable.create(TransportBLE.listen).subscribe({
			complete: () => {
				this.setState({ refreshing: false });
			},
			next: (e) => {
				if (e.type === 'add') {
					this.setState(deviceAddition(e.descriptor));
				}
				// NB there is no "remove" case in BLE.
			},
			error: (error) => {
				this.setState({ error, refreshing: false });
			},
		});
	};

	reload = async () => {
		if (this.sub) this.sub.unsubscribe();
		this.setState({ devices: [], error: null, refreshing: false }, this.startScan);
	};

	keyExtractor = (item: *) => item.id;

	onSelectDevice = async (device) => {
		try {
			await this.props.onSelectDevice(device);
		} catch (error) {
			this.setState({ error });
		}
	};

	renderItem = ({ item }: { item: * }) => <DeviceItem device={item} onSelect={this.onSelectDevice} />;

	ListHeader = () => {
		const { error } = this.state;
		return error ? (
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Sorry, an error occurred</Text>
				<Text style={styles.errorTitle}>{String(error.message)}</Text>
			</View>
		) : (
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Looking for devices</Text>
				<Text style={styles.headerSubtitle}>
					Please make sure your Ledger Nano X is unlocked and Bluetooth is enabled.
				</Text>
			</View>
		);
	};

	render() {
		const { devices, error } = this.state;

		return (
			<FlatList
				extraData={error}
				style={styles.list}
				data={devices}
				renderItem={this.renderItem}
				keyExtractor={this.keyExtractor}
				ListHeaderComponent={this.ListHeader}
				onRefresh={this.reload}
				refreshing={false}
			/>
		);
	}
}

export default DeviceSelectionScreen;
