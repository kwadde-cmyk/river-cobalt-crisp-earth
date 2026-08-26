//#region node_modules/@ledgerhq/errors/lib-es/helpers.js
var errorClasses = {};
var deserializers = {};
/**
* @ignore
* @deprecated Part of the error serialization stack being sunset. Do not register
* new deserializers. Prefer checking `error.name === "X"` over rebuilding classes —
* a name comparison works the same before and after a value crosses a boundary.
*/
var addCustomErrorDeserializer = (name, deserializer) => {
	deserializers[name] = deserializer;
};
/**
* @ignore
* @deprecated Do not create new error classes with this factory. Define a plain
* native class instead, in your own package's `src/errors.ts`:
*
* ```ts
* export class MyError extends Error {
*   override name = "MyError";
* }
* ```
*
* Check the type with `error.name === "MyError"` (survives serialization) rather
* than `instanceof`.
*/
var createCustomErrorClass = (name) => {
	class CustomErrorClass extends Error {
		cause;
		constructor(message, fields, options) {
			super(message || name, options);
			Object.setPrototypeOf(this, CustomErrorClass.prototype);
			this.name = name;
			if (fields) for (const k in fields) this[k] = fields[k];
			if (options && isObject(options) && "cause" in options && !this.cause) {
				const cause = options.cause;
				this.cause = cause;
				if ("stack" in cause) this.stack = this.stack + "\nCAUSE: " + cause.stack;
			}
		}
	}
	errorClasses[name] = CustomErrorClass;
	return CustomErrorClass;
};
function isObject(value) {
	return typeof value === "object";
}
createCustomErrorClass("AccountNameRequired");
createCustomErrorClass("AccountNotSupported");
createCustomErrorClass("AccountAwaitingSendPendingOperations");
createCustomErrorClass("AmountRequired");
createCustomErrorClass("BluetoothRequired");
createCustomErrorClass("BtcUnmatchedApp");
createCustomErrorClass("CantOpenDevice");
createCustomErrorClass("CashAddrNotSupported");
createCustomErrorClass("ClaimRewardsFeesWarning");
createCustomErrorClass("CurrencyNotSupported");
createCustomErrorClass("DeviceAppVerifyNotSupported");
createCustomErrorClass("DeviceGenuineSocketEarlyClose");
createCustomErrorClass("DeviceNotGenuine");
createCustomErrorClass("DeviceOnDashboardExpected");
createCustomErrorClass("DeviceOnDashboardUnexpected");
createCustomErrorClass("DeviceInOSUExpected");
createCustomErrorClass("DeviceHalted");
createCustomErrorClass("DeviceNameInvalid");
createCustomErrorClass("DeviceSocketFail");
createCustomErrorClass("DeviceSocketNoBulkStatus");
createCustomErrorClass("DeviceSocketNoBulkStatus");
createCustomErrorClass("UnresponsiveDeviceError");
var DisconnectedDevice = createCustomErrorClass("DisconnectedDevice");
var DisconnectedDeviceDuringOperation = createCustomErrorClass("DisconnectedDeviceDuringOperation");
createCustomErrorClass("DeviceExtractOnboardingStateError");
createCustomErrorClass("DeviceOnboardingStatePollingError");
createCustomErrorClass("EnpointConfig");
createCustomErrorClass("EthAppPleaseEnableContractData");
createCustomErrorClass("SolAppPleaseEnableContractData");
createCustomErrorClass("CeloAppPleaseEnableContractData");
createCustomErrorClass("FeeEstimationFailed");
createCustomErrorClass("FirmwareNotRecognized");
createCustomErrorClass("HardResetFail");
createCustomErrorClass("InvalidXRPTag");
createCustomErrorClass("InvalidAddress");
createCustomErrorClass("InvalidTransactionError");
createCustomErrorClass("InvalidNonce");
createCustomErrorClass("InvalidAddressBecauseDestinationIsAlsoSource");
createCustomErrorClass("LatestMCUInstalledError");
createCustomErrorClass("LatestFirmwareVersionRequired");
createCustomErrorClass("UnsupportedFeatureError");
createCustomErrorClass("NanoSNotSupported");
createCustomErrorClass("UnknownMCU");
createCustomErrorClass("LedgerAPIError");
createCustomErrorClass("LedgerAPIErrorWithMessage");
createCustomErrorClass("LedgerAPINotAvailable");
createCustomErrorClass("ManagerAppAlreadyInstalled");
createCustomErrorClass("ManagerAppRelyOnBTC");
createCustomErrorClass("ManagerAppDepInstallRequired");
createCustomErrorClass("ManagerAppDepUninstallRequired");
createCustomErrorClass("ManagerDeviceLocked");
createCustomErrorClass("ManagerFirmwareNotEnoughSpace");
createCustomErrorClass("ManagerNotEnoughSpace");
createCustomErrorClass("ManagerUninstallBTCDep");
createCustomErrorClass("NetworkDown");
createCustomErrorClass("NetworkError");
createCustomErrorClass("NoAddressesFound");
createCustomErrorClass("NotEnoughBalance");
createCustomErrorClass("NotEnoughBalanceFees");
createCustomErrorClass("NotEnoughBalanceSwap");
createCustomErrorClass("NotEnoughBalanceToDelegate");
createCustomErrorClass("UnstakeNotEnoughStakedBalanceLeft");
createCustomErrorClass("RestakeNotEnoughStakedBalanceLeft");
createCustomErrorClass("NotEnoughToRestake");
createCustomErrorClass("NotEnoughToUnstake");
createCustomErrorClass("NotEnoughBalanceInParentAccount");
createCustomErrorClass("NotEnoughSpendableBalance");
createCustomErrorClass("NotEnoughBalanceBecauseDestinationNotCreated");
createCustomErrorClass("NotEnoughToStake");
createCustomErrorClass("NoAccessToCamera");
createCustomErrorClass("NotEnoughGas");
createCustomErrorClass("NotEnoughGasSwap");
createCustomErrorClass("TronEmptyAccount");
createCustomErrorClass("MaybeKeepTronAccountAlive");
createCustomErrorClass("NotSupportedLegacyAddress");
createCustomErrorClass("GasLessThanEstimate");
createCustomErrorClass("PriorityFeeTooLow");
createCustomErrorClass("PriorityFeeTooHigh");
createCustomErrorClass("PriorityFeeHigherThanMaxFee");
createCustomErrorClass("MaxFeeTooLow");
createCustomErrorClass("PasswordsDontMatch");
createCustomErrorClass("PasswordIncorrect");
createCustomErrorClass("RecommendSubAccountsToEmpty");
createCustomErrorClass("RecommendUndelegation");
createCustomErrorClass("TimeoutTagged");
createCustomErrorClass("UnexpectedBootloader");
createCustomErrorClass("MCUNotGenuineToDashboard");
createCustomErrorClass("RecipientRequired");
createCustomErrorClass("UnavailableTezosOriginatedAccountReceive");
createCustomErrorClass("UnavailableTezosOriginatedAccountSend");
createCustomErrorClass("UpdateFetchFileFail");
createCustomErrorClass("UpdateIncorrectHash");
createCustomErrorClass("UpdateIncorrectSig");
createCustomErrorClass("UpdateYourApp");
createCustomErrorClass("UserRefusedDeviceNameChange");
createCustomErrorClass("UserRefusedAddress");
createCustomErrorClass("UserRefusedFirmwareUpdate");
createCustomErrorClass("UserRefusedAllowManager");
createCustomErrorClass("UserRefusedOnDevice");
createCustomErrorClass("PinNotSet");
createCustomErrorClass("ExpertModeRequired");
var TransportOpenUserCancelled = createCustomErrorClass("TransportOpenUserCancelled");
createCustomErrorClass("TransportInterfaceNotAvailable");
var TransportRaceCondition = createCustomErrorClass("TransportRaceCondition");
createCustomErrorClass("TransportWebUSBGestureRequired");
createCustomErrorClass("TransactionHasBeenValidatedError");
createCustomErrorClass("TransportExchangeTimeoutError");
createCustomErrorClass("DeviceShouldStayInApp");
createCustomErrorClass("WebsocketConnectionError");
createCustomErrorClass("WebsocketConnectionFailed");
createCustomErrorClass("WrongDeviceForAccount");
createCustomErrorClass("WrongDeviceForAccountPayout");
createCustomErrorClass("MissingSwapPayloadParamaters");
createCustomErrorClass("WrongDeviceForAccountRefund");
createCustomErrorClass("WrongAppForCurrency");
createCustomErrorClass("ETHAddressNonEIP");
createCustomErrorClass("CantScanQRCode");
createCustomErrorClass("FeeNotLoaded");
createCustomErrorClass("FeeNotLoadedSwap");
createCustomErrorClass("FeeRequired");
createCustomErrorClass("FeeTooHigh");
createCustomErrorClass("ValAddressRequired");
createCustomErrorClass("RedelegateDstValAddressRequired");
createCustomErrorClass("PendingOperation");
createCustomErrorClass("SyncError");
createCustomErrorClass("PairingFailed");
createCustomErrorClass("PeerRemovedPairing");
createCustomErrorClass("GenuineCheckFailed");
createCustomErrorClass("LedgerAPI4xx");
createCustomErrorClass("LedgerAPI5xx");
createCustomErrorClass("FirmwareOrAppUpdateRequired");
createCustomErrorClass("ReplacementTransactionUnderpriced");
createCustomErrorClass("OpReturnSizeLimit");
createCustomErrorClass("DustLimit");
createCustomErrorClass("ConcordiumInsufficientFunds");
createCustomErrorClass("ConcordiumMemoTooLong");
createCustomErrorClass("ConcordiumPairingExpiredError");
createCustomErrorClass("ConcordiumSessionExpiredError");
createCustomErrorClass("ConcordiumTrustedMetadataServiceError");
createCustomErrorClass("ConcordiumAddressVerificationFailedError");
createCustomErrorClass("ConcordiumInvalidMaxFeeError");
createCustomErrorClass("LanguageNotFound");
createCustomErrorClass("NoDBPathGiven");
createCustomErrorClass("DBWrongPassword");
createCustomErrorClass("DBNotReset");
createCustomErrorClass("SequenceNumberError");
createCustomErrorClass("DisabledTransactionBroadcastError");
createCustomErrorClass("InvalidParameterError");
/**
* Type of a Transport error used to represent all equivalent errors coming from all possible implementation of Transport
*/
var HwTransportErrorType;
(function(HwTransportErrorType) {
	HwTransportErrorType["Unknown"] = "Unknown";
	HwTransportErrorType["LocationServicesDisabled"] = "LocationServicesDisabled";
	HwTransportErrorType["LocationServicesUnauthorized"] = "LocationServicesUnauthorized";
	HwTransportErrorType["BluetoothScanStartFailed"] = "BluetoothScanStartFailed";
})(HwTransportErrorType || (HwTransportErrorType = {}));
/**
* TransportError is used for any generic transport errors.
* e.g. Error thrown when data received by exchanges are incorrect or if exchanged failed to communicate with the device for various reason.
*/
var TransportError = class extends Error {
	id;
	constructor(message, id) {
		const name = "TransportError";
		super(message || name);
		this.name = name;
		this.message = message;
		this.stack = new Error(message).stack;
		this.id = id;
	}
};
addCustomErrorDeserializer("TransportError", (e) => new TransportError(e.message, e.id));
var StatusCodes = {
	ACCESS_CONDITION_NOT_FULFILLED: 38916,
	ALGORITHM_NOT_SUPPORTED: 38020,
	CLA_NOT_SUPPORTED: 28160,
	CLA_NOT_SUPPORTED_BOOTLOADER: 28161,
	CODE_BLOCKED: 38976,
	CODE_NOT_INITIALIZED: 38914,
	COMMAND_INCOMPATIBLE_FILE_STRUCTURE: 27009,
	CONDITIONS_OF_USE_NOT_SATISFIED: 27013,
	CONTRADICTION_INVALIDATION: 38928,
	CONTRADICTION_SECRET_CODE_STATUS: 38920,
	DEVICE_IN_RECOVERY_MODE: 26159,
	CUSTOM_IMAGE_EMPTY: 26158,
	FILE_ALREADY_EXISTS: 27273,
	FILE_NOT_FOUND: 37892,
	GP_AUTH_FAILED: 25344,
	HALTED: 28586,
	INCONSISTENT_FILE: 37896,
	INCORRECT_DATA: 27264,
	INCORRECT_LENGTH: 26368,
	INCORRECT_P1_P2: 27392,
	INS_NOT_SUPPORTED: 27904,
	DEVICE_NOT_ONBOARDED: 27911,
	DEVICE_NOT_ONBOARDED_2: 26129,
	INVALID_KCV: 38021,
	INVALID_OFFSET: 37890,
	LICENSING: 28482,
	LOCKED_DEVICE: 21781,
	MAX_VALUE_REACHED: 38992,
	MEMORY_PROBLEM: 37440,
	MISSING_CRITICAL_PARAMETER: 26624,
	NO_EF_SELECTED: 37888,
	NOT_ENOUGH_MEMORY_SPACE: 27268,
	OK: 36864,
	PIN_REMAINING_ATTEMPTS: 25536,
	REFERENCED_DATA_NOT_FOUND: 27272,
	SECURITY_STATUS_NOT_SATISFIED: 27010,
	TECHNICAL_PROBLEM: 28416,
	UNKNOWN_APDU: 27906,
	USER_REFUSED_ON_DEVICE: 21761,
	NOT_ENOUGH_SPACE: 20738,
	APP_NOT_FOUND_OR_INVALID_CONTEXT: 20771,
	INVALID_APP_NAME_LENGTH: 26378,
	GEN_AES_KEY_FAILED: 21529,
	INTERNAL_CRYPTO_OPERATION_FAILED: 21530,
	INTERNAL_COMPUTE_AES_CMAC_FAILED: 21531,
	ENCRYPT_APP_STORAGE_FAILED: 21532,
	INVALID_BACKUP_STATE: 26178,
	PIN_NOT_SET: 21762,
	INVALID_BACKUP_LENGTH: 26419,
	INVALID_RESTORE_STATE: 26179,
	INVALID_CHUNK_LENGTH: 26420,
	INVALID_BACKUP_HEADER: 26698,
	SW_BAD_STATE: 45063
};
function getAltStatusMessage(code) {
	switch (code) {
		case 26368: return "Incorrect length";
		case 26624: return "Missing critical parameter";
		case 27010: return "Security not satisfied (dongle locked or have invalid access rights)";
		case 27013: return "Condition of use not satisfied (denied by the user?)";
		case 27264: return "Invalid data received";
		case 27392: return "Invalid parameter received";
		case 21781: return "Locked device";
		case 45063: return "Unexpected state on the device";
	}
	if (28416 <= code && code <= 28671) return "Internal error, please report";
}
/**
* Error thrown when a device returned a non success status.
* the error.statusCode is one of the `StatusCodes` exported by this library.
*/
var TransportStatusError = class TransportStatusError extends Error {
	statusCode;
	statusText;
	/**
	* @param statusCode The error status code coming from a Transport implementation
	* @param options containing:
	*  - canBeMappedToChildError: enable the mapping of TransportStatusError to an error extending/inheriting from it
	*  . Ex: LockedDeviceError. Default to true.
	*/
	constructor(statusCode, { canBeMappedToChildError = true } = {}) {
		const statusText = Object.keys(StatusCodes).find((k) => StatusCodes[k] === statusCode) || "UNKNOWN_ERROR";
		const message = `Ledger device: ${getAltStatusMessage(statusCode) || statusText} (0x${statusCode.toString(16)})`;
		super(message);
		this.name = "TransportStatusError";
		this.statusCode = statusCode;
		this.statusText = statusText;
		Object.setPrototypeOf(this, TransportStatusError.prototype);
		if (canBeMappedToChildError && statusCode === StatusCodes.LOCKED_DEVICE) return new LockedDeviceError(message);
	}
};
var LockedDeviceError = class LockedDeviceError extends TransportStatusError {
	constructor(message) {
		super(StatusCodes.LOCKED_DEVICE, { canBeMappedToChildError: false });
		if (message) this.message = message;
		this.name = "LockedDeviceError";
		Object.setPrototypeOf(this, LockedDeviceError.prototype);
	}
};
addCustomErrorDeserializer("TransportStatusError", (e) => new TransportStatusError(e.statusCode));
//#endregion
export { TransportOpenUserCancelled as a, TransportError as i, DisconnectedDeviceDuringOperation as n, TransportRaceCondition as o, StatusCodes as r, TransportStatusError as s, DisconnectedDevice as t };
