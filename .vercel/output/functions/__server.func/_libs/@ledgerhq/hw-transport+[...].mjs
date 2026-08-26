import { i as TransportError, o as TransportRaceCondition, r as StatusCodes, s as TransportStatusError } from "../ledgerhq__errors.mjs";
import EventEmitter from "events";
//#region node_modules/@ledgerhq/logs/lib-es/index.js
var id = 0;
var subscribers = [];
/**
* Logs something
*
* @param type a namespaced identifier of the log (it is not a level like "debug", "error" but more like "apdu-in", "apdu-out", etc...)
* @param message a clear message of the log associated to the type
*/
var log = (type, message, data) => {
	const obj = {
		type,
		id: String(++id),
		date: /* @__PURE__ */ new Date()
	};
	if (message) obj.message = message;
	if (data) obj.data = data;
	dispatch(obj);
};
/**
* A simple tracer function, only expanding the existing log function
*
* Its goal is to capture more context than a log function.
* This is simple for now, but can be improved later.
*
* @param context Anything representing the context where the log occurred
*/
var trace = ({ type, message, data, context }) => {
	const obj = {
		type,
		id: String(++id),
		date: /* @__PURE__ */ new Date()
	};
	if (message) obj.message = message;
	if (data) obj.data = data;
	if (context) obj.context = context;
	dispatch(obj);
};
/**
* A simple tracer class, that can be used to avoid repetition when using the `trace` function
*
* Its goal is to capture more context than a log function.
* This is simple for now, but can be improved later.
*
* @param type A given type (not level) for the current local tracer ("hw", "withDevice", etc.)
* @param context Anything representing the context where the log occurred
*/
var LocalTracer = class LocalTracer {
	type;
	context;
	constructor(type, context) {
		this.type = type;
		this.context = context;
	}
	trace(message, data) {
		trace({
			type: this.type,
			message,
			data,
			context: this.context
		});
	}
	getContext() {
		return this.context;
	}
	setContext(context) {
		this.context = context;
	}
	updateContext(contextToAdd) {
		this.context = {
			...this.context,
			...contextToAdd
		};
	}
	getType() {
		return this.type;
	}
	setType(type) {
		this.type = type;
	}
	/**
	* Create a new instance of the LocalTracer with an updated `type`
	*
	* It does not mutate the calling instance, but returns a new LocalTracer,
	* following a simple builder pattern.
	*/
	withType(type) {
		return new LocalTracer(type, this.context);
	}
	/**
	* Create a new instance of the LocalTracer with a new `context`
	*
	* It does not mutate the calling instance, but returns a new LocalTracer,
	* following a simple builder pattern.
	*
	* @param context A TraceContext, that can undefined to reset the context
	*/
	withContext(context) {
		return new LocalTracer(this.type, context);
	}
	/**
	* Create a new instance of the LocalTracer with an updated `context`,
	* on which an additional context is merged with the existing one.
	*
	* It does not mutate the calling instance, but returns a new LocalTracer,
	* following a simple builder pattern.
	*/
	withUpdatedContext(contextToAdd) {
		return new LocalTracer(this.type, {
			...this.context,
			...contextToAdd
		});
	}
};
/**
* Adds a subscribers to the emitted logs.
*
* @param cb that is called for each future log() with the Log object
* @return a function that can be called to unsubscribe the listener
*/
var listen = (cb) => {
	subscribers.push(cb);
	return () => {
		const i = subscribers.indexOf(cb);
		if (i !== -1) {
			subscribers[i] = subscribers[subscribers.length - 1];
			subscribers.pop();
		}
	};
};
function dispatch(log) {
	for (let i = 0; i < subscribers.length; i++) try {
		subscribers[i](log);
	} catch (e) {
		console.error(e);
	}
}
if (typeof window !== "undefined") window.__ledgerLogsListen = listen;
//#endregion
//#region node_modules/@ledgerhq/hw-transport/lib-es/Transport.js
var DEFAULT_LOG_TYPE = "transport";
/**
* The Transport class defines a generic interface for communicating with a Ledger hardware wallet.
* There are different kind of transports based on the technology (channels like U2F, HID, Bluetooth, Webusb) and environment (Node, Web,...).
* It is an abstract class that needs to be implemented.
*/
var Transport = class {
	exchangeTimeout = 3e4;
	unresponsiveTimeout = 15e3;
	deviceModel = null;
	tracer;
	constructor({ context, logType } = {}) {
		this.tracer = new LocalTracer(logType ?? DEFAULT_LOG_TYPE, context);
	}
	/**
	* Check if the transport is supported on the current platform/browser.
	* @returns {Promise<boolean>} A promise that resolves with a boolean indicating support.
	*/
	static isSupported;
	/**
	* List all available descriptors for the transport.
	* For a better granularity, checkout `listen()`.
	*
	* @returns {Promise<Array<any>>} A promise that resolves with an array of descriptors.
	* @example
	* TransportFoo.list().then(descriptors => ...)
	*/
	static list;
	/**
	* Listen for device events for the transport. The method takes an observer of DescriptorEvent and returns a Subscription.
	* A DescriptorEvent is an object containing a "descriptor" and a "type" field. The "type" field can be "add" or "remove", and the "descriptor" field can be passed to the "open" method.
	* The "listen" method will first emit all currently connected devices and then will emit events as they occur, such as when a USB device is plugged in or a Bluetooth device becomes discoverable.
	* @param {Observer<DescriptorEvent<any>>} observer - An object with "next", "error", and "complete" functions, following the observer pattern.
	* @returns {Subscription} A Subscription object on which you can call ".unsubscribe()" to stop listening to descriptors.
	* @example
	const sub = TransportFoo.listen({
	next: e => {
	if (e.type==="add") {
	sub.unsubscribe();
	const transport = await TransportFoo.open(e.descriptor);
	...
	}
	},
	error: error => {},
	complete: () => {}
	})
	*/
	static listen;
	/**
	* Attempt to create a Transport instance with a specific descriptor.
	* @param {any} descriptor - The descriptor to open the transport with.
	* @param {number} timeout - An optional timeout for the transport connection.
	* @param {TraceContext} context Optional tracing/log context
	* @returns {Promise<Transport>} A promise that resolves with a Transport instance.
	* @example
	TransportFoo.open(descriptor).then(transport => ...)
	*/
	static open;
	/**
	* Send data to the device using a low level API.
	* It's recommended to use the "send" method for a higher level API.
	* @param {Buffer} apdu - The data to send.
	* @param {Object} options - Contains optional options for the exchange function
	*  - abortTimeoutMs: stop the exchange after a given timeout. Another timeout exists
	*    to detect unresponsive device (see `unresponsiveTimeout`). This timeout aborts the exchange.
	* @returns {Promise<Buffer>} A promise that resolves with the response data from the device.
	*/
	exchange(_apdu, { abortTimeoutMs: _abortTimeoutMs } = {}) {
		throw new Error("exchange not implemented");
	}
	/**
	* Send apdus in batch to the device using a low level API.
	* The default implementation is to call exchange for each apdu.
	* @param {Array<Buffer>} apdus - array of apdus to send.
	* @param {Observer<Buffer>} observer - an observer that will receive the response of each apdu.
	* @returns {Subscription} A Subscription object on which you can call ".unsubscribe()" to stop sending apdus.
	*/
	exchangeBulk(apdus, observer) {
		let unsubscribed = false;
		const unsubscribe = () => {
			unsubscribed = true;
		};
		const main = async () => {
			if (unsubscribed) return;
			for (const apdu of apdus) {
				const r = await this.exchange(apdu);
				if (unsubscribed) return;
				const status = r.readUInt16BE(r.length - 2);
				if (status !== StatusCodes.OK) throw new TransportStatusError(status);
				observer.next(r);
			}
		};
		main().then(() => !unsubscribed && observer.complete(), (e) => !unsubscribed && observer.error(e));
		return { unsubscribe };
	}
	/**
	* Set the "scramble key" for the next data exchanges with the device.
	* Each app can have a different scramble key and it is set internally during instantiation.
	* @param {string} key - The scramble key to set.
	* deprecated This method is no longer needed for modern transports and should be migrated away from.
	* no @ before deprecated as it breaks documentationjs on version 14.0.2
	* https://github.com/documentationjs/documentation/issues/1596
	*/
	setScrambleKey(_key) {}
	/**
	* Close the connection with the device.
	*
	* Note: for certain transports (hw-transport-node-hid-singleton for ex), once the promise resolved,
	* the transport instance is actually still cached, and the device is disconnected only after a defined timeout.
	* But for the consumer of the Transport, this does not matter and it can consider the transport to be closed.
	*
	* @returns {Promise<void>} A promise that resolves when the transport is closed.
	*/
	close() {
		return Promise.resolve();
	}
	_events = new EventEmitter();
	/**
	* Listen for an event on the transport instance.
	* Transport implementations may have specific events. Common events include:
	* "disconnect" : triggered when the transport is disconnected.
	* @param {string} eventName - The name of the event to listen for.
	* @param {(...args: Array<any>) => any} cb - The callback function to be invoked when the event occurs.
	*/
	on(eventName, cb) {
		this._events.on(eventName, cb);
	}
	/**
	* Stop listening to an event on an instance of transport.
	*/
	off(eventName, cb) {
		this._events.removeListener(eventName, cb);
	}
	emit(event, ...args) {
		this._events.emit(event, ...args);
	}
	/**
	* Enable or not logs of the binary exchange
	*/
	setDebugMode() {
		console.warn("setDebugMode is deprecated. use @ledgerhq/logs instead. No logs are emitted in this anymore.");
	}
	/**
	* Set a timeout (in milliseconds) for the exchange call. Only some transport might implement it. (e.g. U2F)
	*/
	setExchangeTimeout(exchangeTimeout) {
		this.exchangeTimeout = exchangeTimeout;
	}
	/**
	* Define the delay before emitting "unresponsive" on an exchange that does not respond
	*/
	setExchangeUnresponsiveTimeout(unresponsiveTimeout) {
		this.unresponsiveTimeout = unresponsiveTimeout;
	}
	/**
	* Send data to the device using the higher level API.
	*
	* @param {number} cla - The instruction class for the command.
	* @param {number} ins - The instruction code for the command.
	* @param {number} p1 - The first parameter for the instruction.
	* @param {number} p2 - The second parameter for the instruction.
	* @param {Buffer} data - The data to be sent. Defaults to an empty buffer.
	* @param {Array<number>} statusList - A list of acceptable status codes for the response. Defaults to [StatusCodes.OK].
	* @param {Object} options - Contains optional options for the exchange function
	*  - abortTimeoutMs: stop the send after a given timeout. Another timeout exists
	*    to detect unresponsive device (see `unresponsiveTimeout`). This timeout aborts the exchange.
	* @returns {Promise<Buffer>} A promise that resolves with the response data from the device.
	*/
	send = async (cla, ins, p1, p2, data = Buffer.alloc(0), statusList = [StatusCodes.OK], { abortTimeoutMs } = {}) => {
		const tracer = this.tracer.withUpdatedContext({ function: "send" });
		if (data.length >= 256) {
			tracer.trace("data.length exceeded 256 bytes limit", { dataLength: data.length });
			throw new TransportError("data.length exceed 256 bytes limit. Got: " + data.length, "DataLengthTooBig");
		}
		const response = await this.exchange(Buffer.concat([
			Buffer.from([
				cla,
				ins,
				p1,
				p2
			]),
			Buffer.from([data.length]),
			data
		]), { abortTimeoutMs });
		const sw = response.readUInt16BE(response.length - 2);
		if (!statusList.some((s) => s === sw)) throw new TransportStatusError(sw);
		return response;
	};
	/**
	* create() allows to open the first descriptor available or
	* throw if there is none or if timeout is reached.
	* This is a light helper, alternative to using listen() and open() (that you may need for any more advanced usecase)
	* @example
	TransportFoo.create().then(transport => ...)
	*/
	static create(openTimeout = 3e3, listenTimeout) {
		return new Promise((resolve, reject) => {
			let found = false;
			const sub = this.listen({
				next: (e) => {
					found = true;
					if (sub) sub.unsubscribe();
					if (listenTimeoutId) clearTimeout(listenTimeoutId);
					this.open(e.descriptor, openTimeout).then(resolve, reject);
				},
				error: (e) => {
					if (listenTimeoutId) clearTimeout(listenTimeoutId);
					reject(e);
				},
				complete: () => {
					if (listenTimeoutId) clearTimeout(listenTimeoutId);
					if (!found) reject(new TransportError(this.ErrorMessage_NoDeviceFound, "NoDeviceFound"));
				}
			});
			const listenTimeoutId = listenTimeout ? setTimeout(() => {
				sub.unsubscribe();
				reject(new TransportError(this.ErrorMessage_ListenTimeout, "ListenTimeout"));
			}, listenTimeout) : null;
		});
	}
	exchangeBusyPromise;
	/**
	* Wrapper to make an exchange "atomic" (blocking any other exchange)
	*
	* It also handles "unresponsiveness" by emitting "unresponsive" and "responsive" events.
	*
	* @param f The exchange job, using the transport to run
	* @returns a Promise resolving with the output of the given job
	*/
	async exchangeAtomicImpl(f) {
		const tracer = this.tracer.withUpdatedContext({
			function: "exchangeAtomicImpl",
			unresponsiveTimeout: this.unresponsiveTimeout
		});
		if (this.exchangeBusyPromise) {
			tracer.trace("Atomic exchange is already busy");
			throw new TransportRaceCondition("An action was already pending on the Ledger device. Please deny or reconnect.");
		}
		let resolveBusy;
		const busyPromise = new Promise((r) => {
			resolveBusy = r;
		});
		this.exchangeBusyPromise = busyPromise;
		let unresponsiveReached = false;
		const timeout = setTimeout(() => {
			tracer.trace(`Timeout reached, emitting Transport event "unresponsive"`, { unresponsiveTimeout: this.unresponsiveTimeout });
			unresponsiveReached = true;
			this.emit("unresponsive");
		}, this.unresponsiveTimeout);
		try {
			const res = await f();
			if (unresponsiveReached) {
				tracer.trace("Device was unresponsive, emitting responsive");
				this.emit("responsive");
			}
			return res;
		} finally {
			tracer.trace("Finalize, clearing busy guard");
			clearTimeout(timeout);
			if (resolveBusy) resolveBusy();
			this.exchangeBusyPromise = null;
		}
	}
	decorateAppAPIMethods(self, methods, scrambleKey) {
		for (const methodName of methods) self[methodName] = this.decorateAppAPIMethod(methodName, self[methodName], self, scrambleKey);
	}
	_appAPIlock = null;
	decorateAppAPIMethod(methodName, f, ctx, scrambleKey) {
		return async (...args) => {
			const { _appAPIlock } = this;
			if (_appAPIlock) return Promise.reject(new TransportError("Ledger Device is busy (lock " + _appAPIlock + ")", "TransportLocked"));
			try {
				this._appAPIlock = methodName;
				this.setScrambleKey(scrambleKey);
				return await f.apply(ctx, args);
			} finally {
				this._appAPIlock = null;
			}
		};
	}
	/**
	* Sets the context used by the logging/tracing mechanism
	*
	* Useful when re-using (cached) the same Transport instance,
	* but with a new tracing context.
	*
	* @param context A TraceContext, that can undefined to reset the context
	*/
	setTraceContext(context) {
		this.tracer = this.tracer.withContext(context);
	}
	/**
	* Updates the context used by the logging/tracing mechanism
	*
	* The update only overrides the key-value that are already defined in the current context.
	*
	* @param contextToAdd A TraceContext that will be added to the current context
	*/
	updateTraceContext(contextToAdd) {
		this.tracer.updateContext(contextToAdd);
	}
	/**
	* Gets the tracing context of the transport instance
	*/
	getTraceContext() {
		return this.tracer.getContext();
	}
	static ErrorMessage_ListenTimeout = "No Ledger device found (timeout)";
	static ErrorMessage_NoDeviceFound = "No Ledger device found";
};
//#endregion
export { log as n, Transport as t };
