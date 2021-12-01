import React, { Component } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import NanoX from '../../commons/NanoX';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
	// eslint-disable-next-line react-native/no-color-literals
	deviceItem: {
		paddingVertical: 16,
		paddingHorizontal: 32,
		marginVertical: 8,
		marginHorizontal: 16,
		borderColor: '#ccc',
		borderWidth: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	deviceName: {
		marginLeft: 20,
		marginRight: 20,
		fontSize: 20,
		fontWeight: 'bold',
	},
});

class DeviceItem extends Component {
	static propTypes = {
		device: PropTypes.object,
		onSelect: PropTypes.func,
	};

	state = {
		pending: false,
	};
	onPress = async () => {
		this.setState({ pending: true });
		try {
			await this.props.onSelect(this.props.device);
		} finally {
			this.setState({ pending: false });
		}
	};

	render() {
		const { device } = this.props;
		const { pending } = this.state;
		return (
			<TouchableOpacity style={styles.deviceItem} onPress={this.onPress} disabled={pending}>
				<NanoX color={'black'} height={36} width={8} />
				<Text style={styles.deviceName}>{device.name}</Text>
				{pending ? <ActivityIndicator /> : null}
			</TouchableOpacity>
		);
	}
}
export default DeviceItem;
