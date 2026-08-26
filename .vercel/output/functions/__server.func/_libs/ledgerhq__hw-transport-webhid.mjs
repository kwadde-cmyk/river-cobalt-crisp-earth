import { a as TransportOpenUserCancelled, i as TransportError, n as DisconnectedDeviceDuringOperation, t as DisconnectedDevice } from "./ledgerhq__errors.mjs";
import { n as log, t as Transport } from "./@ledgerhq/hw-transport+[...].mjs";
import { n as ledgerUSBVendorId, t as identifyUSBProductId } from "./ledgerhq__devices+semver.mjs";
//#region node_modules/@ledgerhq/hw-transport-webhid/lib-es/hid-framing.js
var Tag = 5;
function asUInt16BE(value) {
	const b = Buffer.alloc(2);
	b.writeUInt16BE(value, 0);
	return b;
}
var initialAcc = {
	data: Buffer.alloc(0),
	dataLength: 0,
	sequence: 0
};
/**
* Object to handle HID frames (encoding and decoding)
*
* @param channel
* @param packetSize The HID protocol packet size in bytes (usually 64)
*/
var createHIDframing = (channel, packetSize) => {
	return {
		/**
		* Frames/encodes an APDU message into HID USB packets/frames
		*
		* @param apdu The APDU message to send, in a Buffer containing [cla, ins, p1, p2, data length, data(if not empty)]
		* @returns an array of HID USB frames ready to be sent
		*/
		makeBlocks(apdu) {
			let data = Buffer.concat([asUInt16BE(apdu.length), apdu]);
			const blockSize = packetSize - 5;
			const nbBlocks = Math.ceil(data.length / blockSize);
			data = Buffer.concat([data, Buffer.alloc(nbBlocks * blockSize - data.length + 1).fill(0)]);
			const blocks = [];
			for (let i = 0; i < nbBlocks; i++) {
				const head = Buffer.alloc(5);
				head.writeUInt16BE(channel, 0);
				head.writeUInt8(Tag, 2);
				head.writeUInt16BE(i, 3);
				const chunk = data.slice(i * blockSize, (i + 1) * blockSize);
				blocks.push(new Uint8Array(Buffer.concat([head, chunk])));
			}
			return blocks;
		},
		/**
		* Reduces HID USB packets/frames to one response.
		*
		* @param acc The value resulting from (accumulating) the previous call of reduceResponse.
		*   On first call initialized to `initialAcc`. The accumulator enables handling multi-frames messages.
		* @param chunk Current chunk to reduce into accumulator
		* @returns An accumulator value updated with the current chunk
		*/
		reduceResponse(acc, chunk) {
			let { data, dataLength, sequence } = acc || initialAcc;
			if (chunk.readUInt16BE(0) !== channel) throw new TransportError("Invalid channel", "InvalidChannel");
			if (chunk.readUInt8(2) !== Tag) throw new TransportError("Invalid tag", "InvalidTag");
			if (chunk.readUInt16BE(3) !== sequence) throw new TransportError("Invalid sequence", "InvalidSequence");
			if (!acc) dataLength = chunk.readUInt16BE(5);
			sequence++;
			const chunkData = chunk.slice(acc ? 5 : 7);
			data = Buffer.concat([data, chunkData]);
			if (data.length > dataLength) data = data.slice(0, dataLength);
			return {
				data,
				dataLength,
				sequence
			};
		},
		/**
		* Returns the response message that has been reduced from the HID USB frames
		*
		* @param acc The accumulator
		* @returns A Buffer containing the cleaned response message, or null if no response message, or undefined if the
		*   accumulator is incorrect (message length is not valid)
		*/
		getReducedResult(acc) {
			if (acc && acc.dataLength === acc.data.length) return acc.data;
		}
	};
};
//#endregion
//#region node_modules/@ledgerhq/hw-transport-webhid/lib-es/TransportWebHID.js
var ledgerDevices = [{ vendorId: ledgerUSBVendorId }];
var isSupported = () => Promise.resolve(!!(window.navigator && window.navigator.hid));
var getHID = () => {
	const { hid } = navigator;
	if (!hid) throw new TransportError("navigator.hid is not supported", "HIDNotSupported");
	return hid;
};
async function requestLedgerDevices() {
	const device = await getHID().requestDevice({ filters: ledgerDevices });
	if (Array.isArray(device)) return device;
	return [device];
}
async function getLedgerDevices() {
	return (await getHID().getDevices()).filter((d) => d.vendorId === ledgerUSBVendorId);
}
async function getFirstLedgerDevice() {
	const existingDevices = await getLedgerDevices();
	if (existingDevices.length > 0) return existingDevices[0];
	return (await requestLedgerDevices())[0];
}
/**
* WebHID Transport implementation
* @example
* import TransportWebHID from "@ledgerhq/hw-transport-webhid";
* ...
* TransportWebHID.create().then(transport => ...)
*/
var TransportWebHID = class TransportWebHID extends Transport {
	device;
	deviceModel;
	channel = Math.floor(Math.random() * 65535);
	packetSize = 64;
	constructor(device) {
		super();
		this.device = device;
		this.deviceModel = typeof device.productId === "number" ? identifyUSBProductId(device.productId) : void 0;
		device.addEventListener("inputreport", this.onInputReport);
	}
	inputs = [];
	inputCallback;
	read = () => {
		if (this.inputs.length) {
			const value = this.inputs.shift();
			if (value !== void 0) return Promise.resolve(value);
			throw new Error("Unreachable: non-empty inputs");
		}
		return new Promise((success) => {
			this.inputCallback = success;
		});
	};
	onInputReport = (e) => {
		const buffer = Buffer.from(e.data.buffer);
		if (this.inputCallback) {
			this.inputCallback(buffer);
			this.inputCallback = null;
		} else this.inputs.push(buffer);
	};
	/**
	* Check if WebUSB transport is supported.
	*/
	static isSupported = isSupported;
	/**
	* List the WebUSB devices that was previously authorized by the user.
	*/
	static list = getLedgerDevices;
	/**
	* Actively listen to WebUSB devices and emit ONE device
	* that was either accepted before, if not it will trigger the native permission UI.
	*
	* Important: it must be called in the context of a UI click!
	*/
	static listen = (observer) => {
		let unsubscribed = false;
		getFirstLedgerDevice().then((device) => {
			if (!device) observer.error(new TransportOpenUserCancelled("Access denied to use Ledger device"));
			else if (!unsubscribed) {
				const deviceModel = typeof device.productId === "number" ? identifyUSBProductId(device.productId) : void 0;
				observer.next({
					type: "add",
					descriptor: device,
					deviceModel
				});
				observer.complete();
			}
		}, (error) => {
			observer.error(new TransportOpenUserCancelled(error.message));
		});
		function unsubscribe() {
			unsubscribed = true;
		}
		return { unsubscribe };
	};
	/**
	* Similar to create() except it will always display the device permission (even if some devices are already accepted).
	*/
	static async request() {
		const [device] = await requestLedgerDevices();
		return TransportWebHID.open(device);
	}
	/**
	* Similar to create() except it will never display the device permission (it returns a Promise<?Transport>, null if it fails to find a device).
	*/
	static async openConnected() {
		const devices = await getLedgerDevices();
		if (devices.length === 0) return null;
		return TransportWebHID.open(devices[0]);
	}
	/**
	* Create a Ledger transport with a HIDDevice
	*/
	static async open(device) {
		await device.open();
		const transport = new TransportWebHID(device);
		const onDisconnect = (e) => {
			if (device === e.device) {
				getHID().removeEventListener("disconnect", onDisconnect);
				transport._emitDisconnect(new DisconnectedDevice());
			}
		};
		getHID().addEventListener("disconnect", onDisconnect);
		return transport;
	}
	_disconnectEmitted = false;
	_emitDisconnect = (e) => {
		if (this._disconnectEmitted) return;
		this._disconnectEmitted = true;
		this.emit("disconnect", e);
	};
	/**
	* Release the transport device
	*/
	async close() {
		await this.exchangeBusyPromise;
		this.device.removeEventListener("inputreport", this.onInputReport);
		await this.device.close();
	}
	/**
	* Exchange with the device using APDU protocol.
	* @param apdu
	* @returns a promise of apdu response
	*/
	exchange = async (apdu) => {
		return await this.exchangeAtomicImpl(async () => {
			const { channel, packetSize } = this;
			log("apdu", "=> " + apdu.toString("hex"));
			const framing = createHIDframing(channel, packetSize);
			const blocks = framing.makeBlocks(apdu);
			for (let i = 0; i < blocks.length; i++) await this.device.sendReport(0, blocks[i]);
			let result;
			let acc;
			while (!(result = framing.getReducedResult(acc))) try {
				const buffer = await this.read();
				acc = framing.reduceResponse(acc, buffer);
			} catch (e) {
				if (e instanceof TransportError && e.id === "InvalidChannel") continue;
				throw e;
			}
			log("apdu", "<= " + result.toString("hex"));
			return result;
		}).catch((e) => {
			if (e && e.message && e.message.includes("write")) {
				this._emitDisconnect(e);
				throw new DisconnectedDeviceDuringOperation(e.message);
			}
			throw e;
		});
	};
	setScrambleKey() {}
};
//#endregion
export { TransportWebHID as t };
