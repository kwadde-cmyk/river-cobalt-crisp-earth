import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/bip174/src/lib/typeFields.js
var require_typeFields = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	(function(GlobalTypes) {
		GlobalTypes[GlobalTypes["UNSIGNED_TX"] = 0] = "UNSIGNED_TX";
		GlobalTypes[GlobalTypes["GLOBAL_XPUB"] = 1] = "GLOBAL_XPUB";
	})(exports.GlobalTypes || (exports.GlobalTypes = {}));
	exports.GLOBAL_TYPE_NAMES = ["unsignedTx", "globalXpub"];
	(function(InputTypes) {
		InputTypes[InputTypes["NON_WITNESS_UTXO"] = 0] = "NON_WITNESS_UTXO";
		InputTypes[InputTypes["WITNESS_UTXO"] = 1] = "WITNESS_UTXO";
		InputTypes[InputTypes["PARTIAL_SIG"] = 2] = "PARTIAL_SIG";
		InputTypes[InputTypes["SIGHASH_TYPE"] = 3] = "SIGHASH_TYPE";
		InputTypes[InputTypes["REDEEM_SCRIPT"] = 4] = "REDEEM_SCRIPT";
		InputTypes[InputTypes["WITNESS_SCRIPT"] = 5] = "WITNESS_SCRIPT";
		InputTypes[InputTypes["BIP32_DERIVATION"] = 6] = "BIP32_DERIVATION";
		InputTypes[InputTypes["FINAL_SCRIPTSIG"] = 7] = "FINAL_SCRIPTSIG";
		InputTypes[InputTypes["FINAL_SCRIPTWITNESS"] = 8] = "FINAL_SCRIPTWITNESS";
		InputTypes[InputTypes["POR_COMMITMENT"] = 9] = "POR_COMMITMENT";
		InputTypes[InputTypes["TAP_KEY_SIG"] = 19] = "TAP_KEY_SIG";
		InputTypes[InputTypes["TAP_SCRIPT_SIG"] = 20] = "TAP_SCRIPT_SIG";
		InputTypes[InputTypes["TAP_LEAF_SCRIPT"] = 21] = "TAP_LEAF_SCRIPT";
		InputTypes[InputTypes["TAP_BIP32_DERIVATION"] = 22] = "TAP_BIP32_DERIVATION";
		InputTypes[InputTypes["TAP_INTERNAL_KEY"] = 23] = "TAP_INTERNAL_KEY";
		InputTypes[InputTypes["TAP_MERKLE_ROOT"] = 24] = "TAP_MERKLE_ROOT";
	})(exports.InputTypes || (exports.InputTypes = {}));
	exports.INPUT_TYPE_NAMES = [
		"nonWitnessUtxo",
		"witnessUtxo",
		"partialSig",
		"sighashType",
		"redeemScript",
		"witnessScript",
		"bip32Derivation",
		"finalScriptSig",
		"finalScriptWitness",
		"porCommitment",
		"tapKeySig",
		"tapScriptSig",
		"tapLeafScript",
		"tapBip32Derivation",
		"tapInternalKey",
		"tapMerkleRoot"
	];
	(function(OutputTypes) {
		OutputTypes[OutputTypes["REDEEM_SCRIPT"] = 0] = "REDEEM_SCRIPT";
		OutputTypes[OutputTypes["WITNESS_SCRIPT"] = 1] = "WITNESS_SCRIPT";
		OutputTypes[OutputTypes["BIP32_DERIVATION"] = 2] = "BIP32_DERIVATION";
		OutputTypes[OutputTypes["TAP_INTERNAL_KEY"] = 5] = "TAP_INTERNAL_KEY";
		OutputTypes[OutputTypes["TAP_TREE"] = 6] = "TAP_TREE";
		OutputTypes[OutputTypes["TAP_BIP32_DERIVATION"] = 7] = "TAP_BIP32_DERIVATION";
	})(exports.OutputTypes || (exports.OutputTypes = {}));
	exports.OUTPUT_TYPE_NAMES = [
		"redeemScript",
		"witnessScript",
		"bip32Derivation",
		"tapInternalKey",
		"tapTree",
		"tapBip32Derivation"
	];
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/global/globalXpub.js
var require_globalXpub = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	var range = (n) => [...Array(n).keys()];
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.GlobalTypes.GLOBAL_XPUB) throw new Error("Decode Error: could not decode globalXpub with key 0x" + keyVal.key.toString("hex"));
		if (keyVal.key.length !== 79 || ![2, 3].includes(keyVal.key[46])) throw new Error("Decode Error: globalXpub has invalid extended pubkey in key 0x" + keyVal.key.toString("hex"));
		if (keyVal.value.length / 4 % 1 !== 0) throw new Error("Decode Error: Global GLOBAL_XPUB value length should be multiple of 4");
		const extendedPubkey = keyVal.key.slice(1);
		const data = {
			masterFingerprint: keyVal.value.slice(0, 4),
			extendedPubkey,
			path: "m"
		};
		for (const i of range(keyVal.value.length / 4 - 1)) {
			const val = keyVal.value.readUInt32LE(i * 4 + 4);
			const isHard = !!(val & 2147483648);
			const idx = val & 2147483647;
			data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
		}
		return data;
	}
	exports.decode = decode;
	function encode(data) {
		const head = Buffer.from([typeFields_1.GlobalTypes.GLOBAL_XPUB]);
		const key = Buffer.concat([head, data.extendedPubkey]);
		const splitPath = data.path.split("/");
		const value = Buffer.allocUnsafe(splitPath.length * 4);
		data.masterFingerprint.copy(value, 0);
		let offset = 4;
		splitPath.slice(1).forEach((level) => {
			const isHard = level.slice(-1) === "'";
			let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
			if (isHard) num += 2147483648;
			value.writeUInt32LE(num, offset);
			offset += 4;
		});
		return {
			key,
			value
		};
	}
	exports.encode = encode;
	exports.expected = "{ masterFingerprint: Buffer; extendedPubkey: Buffer; path: string; }";
	function check(data) {
		const epk = data.extendedPubkey;
		const mfp = data.masterFingerprint;
		const p = data.path;
		return Buffer.isBuffer(epk) && epk.length === 78 && [2, 3].indexOf(epk[45]) > -1 && Buffer.isBuffer(mfp) && mfp.length === 4 && typeof p === "string" && !!p.match(/^m(\/\d+'?)*$/);
	}
	exports.check = check;
	function canAddToArray(array, item, dupeSet) {
		const dupeString = item.extendedPubkey.toString("hex");
		if (dupeSet.has(dupeString)) return false;
		dupeSet.add(dupeString);
		return array.filter((v) => v.extendedPubkey.equals(item.extendedPubkey)).length === 0;
	}
	exports.canAddToArray = canAddToArray;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/global/unsignedTx.js
var require_unsignedTx = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function encode(data) {
		return {
			key: Buffer.from([typeFields_1.GlobalTypes.UNSIGNED_TX]),
			value: data.toBuffer()
		};
	}
	exports.encode = encode;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/finalScriptSig.js
var require_finalScriptSig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.FINAL_SCRIPTSIG) throw new Error("Decode Error: could not decode finalScriptSig with key 0x" + keyVal.key.toString("hex"));
		return keyVal.value;
	}
	exports.decode = decode;
	function encode(data) {
		return {
			key: Buffer.from([typeFields_1.InputTypes.FINAL_SCRIPTSIG]),
			value: data
		};
	}
	exports.encode = encode;
	exports.expected = "Buffer";
	function check(data) {
		return Buffer.isBuffer(data);
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.finalScriptSig === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/finalScriptWitness.js
var require_finalScriptWitness = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.FINAL_SCRIPTWITNESS) throw new Error("Decode Error: could not decode finalScriptWitness with key 0x" + keyVal.key.toString("hex"));
		return keyVal.value;
	}
	exports.decode = decode;
	function encode(data) {
		return {
			key: Buffer.from([typeFields_1.InputTypes.FINAL_SCRIPTWITNESS]),
			value: data
		};
	}
	exports.encode = encode;
	exports.expected = "Buffer";
	function check(data) {
		return Buffer.isBuffer(data);
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.finalScriptWitness === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/nonWitnessUtxo.js
var require_nonWitnessUtxo = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.NON_WITNESS_UTXO) throw new Error("Decode Error: could not decode nonWitnessUtxo with key 0x" + keyVal.key.toString("hex"));
		return keyVal.value;
	}
	exports.decode = decode;
	function encode(data) {
		return {
			key: Buffer.from([typeFields_1.InputTypes.NON_WITNESS_UTXO]),
			value: data
		};
	}
	exports.encode = encode;
	exports.expected = "Buffer";
	function check(data) {
		return Buffer.isBuffer(data);
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.nonWitnessUtxo === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/partialSig.js
var require_partialSig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.PARTIAL_SIG) throw new Error("Decode Error: could not decode partialSig with key 0x" + keyVal.key.toString("hex"));
		if (!(keyVal.key.length === 34 || keyVal.key.length === 66) || ![
			2,
			3,
			4
		].includes(keyVal.key[1])) throw new Error("Decode Error: partialSig has invalid pubkey in key 0x" + keyVal.key.toString("hex"));
		return {
			pubkey: keyVal.key.slice(1),
			signature: keyVal.value
		};
	}
	exports.decode = decode;
	function encode(pSig) {
		const head = Buffer.from([typeFields_1.InputTypes.PARTIAL_SIG]);
		return {
			key: Buffer.concat([head, pSig.pubkey]),
			value: pSig.signature
		};
	}
	exports.encode = encode;
	exports.expected = "{ pubkey: Buffer; signature: Buffer; }";
	function check(data) {
		return Buffer.isBuffer(data.pubkey) && Buffer.isBuffer(data.signature) && [33, 65].includes(data.pubkey.length) && [
			2,
			3,
			4
		].includes(data.pubkey[0]) && isDerSigWithSighash(data.signature);
	}
	exports.check = check;
	function isDerSigWithSighash(buf) {
		if (!Buffer.isBuffer(buf) || buf.length < 9) return false;
		if (buf[0] !== 48) return false;
		if (buf.length !== buf[1] + 3) return false;
		if (buf[2] !== 2) return false;
		const rLen = buf[3];
		if (rLen > 33 || rLen < 1) return false;
		if (buf[3 + rLen + 1] !== 2) return false;
		const sLen = buf[3 + rLen + 2];
		if (sLen > 33 || sLen < 1) return false;
		if (buf.length !== 3 + rLen + 2 + sLen + 2) return false;
		return true;
	}
	function canAddToArray(array, item, dupeSet) {
		const dupeString = item.pubkey.toString("hex");
		if (dupeSet.has(dupeString)) return false;
		dupeSet.add(dupeString);
		return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
	}
	exports.canAddToArray = canAddToArray;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/porCommitment.js
var require_porCommitment = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.POR_COMMITMENT) throw new Error("Decode Error: could not decode porCommitment with key 0x" + keyVal.key.toString("hex"));
		return keyVal.value.toString("utf8");
	}
	exports.decode = decode;
	function encode(data) {
		return {
			key: Buffer.from([typeFields_1.InputTypes.POR_COMMITMENT]),
			value: Buffer.from(data, "utf8")
		};
	}
	exports.encode = encode;
	exports.expected = "string";
	function check(data) {
		return typeof data === "string";
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.porCommitment === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/sighashType.js
var require_sighashType = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.SIGHASH_TYPE) throw new Error("Decode Error: could not decode sighashType with key 0x" + keyVal.key.toString("hex"));
		return keyVal.value.readUInt32LE(0);
	}
	exports.decode = decode;
	function encode(data) {
		const key = Buffer.from([typeFields_1.InputTypes.SIGHASH_TYPE]);
		const value = Buffer.allocUnsafe(4);
		value.writeUInt32LE(data, 0);
		return {
			key,
			value
		};
	}
	exports.encode = encode;
	exports.expected = "number";
	function check(data) {
		return typeof data === "number";
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.sighashType === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/tapKeySig.js
var require_tapKeySig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_KEY_SIG || keyVal.key.length !== 1) throw new Error("Decode Error: could not decode tapKeySig with key 0x" + keyVal.key.toString("hex"));
		if (!check(keyVal.value)) throw new Error("Decode Error: tapKeySig not a valid 64-65-byte BIP340 signature");
		return keyVal.value;
	}
	exports.decode = decode;
	function encode(value) {
		return {
			key: Buffer.from([typeFields_1.InputTypes.TAP_KEY_SIG]),
			value
		};
	}
	exports.encode = encode;
	exports.expected = "Buffer";
	function check(data) {
		return Buffer.isBuffer(data) && (data.length === 64 || data.length === 65);
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.tapKeySig === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/tapLeafScript.js
var require_tapLeafScript = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_LEAF_SCRIPT) throw new Error("Decode Error: could not decode tapLeafScript with key 0x" + keyVal.key.toString("hex"));
		if ((keyVal.key.length - 2) % 32 !== 0) throw new Error("Decode Error: tapLeafScript has invalid control block in key 0x" + keyVal.key.toString("hex"));
		const leafVersion = keyVal.value[keyVal.value.length - 1];
		if ((keyVal.key[1] & 254) !== leafVersion) throw new Error("Decode Error: tapLeafScript bad leaf version in key 0x" + keyVal.key.toString("hex"));
		const script = keyVal.value.slice(0, -1);
		return {
			controlBlock: keyVal.key.slice(1),
			script,
			leafVersion
		};
	}
	exports.decode = decode;
	function encode(tScript) {
		const head = Buffer.from([typeFields_1.InputTypes.TAP_LEAF_SCRIPT]);
		const verBuf = Buffer.from([tScript.leafVersion]);
		return {
			key: Buffer.concat([head, tScript.controlBlock]),
			value: Buffer.concat([tScript.script, verBuf])
		};
	}
	exports.encode = encode;
	exports.expected = "{ controlBlock: Buffer; leafVersion: number, script: Buffer; }";
	function check(data) {
		return Buffer.isBuffer(data.controlBlock) && (data.controlBlock.length - 1) % 32 === 0 && (data.controlBlock[0] & 254) === data.leafVersion && Buffer.isBuffer(data.script);
	}
	exports.check = check;
	function canAddToArray(array, item, dupeSet) {
		const dupeString = item.controlBlock.toString("hex");
		if (dupeSet.has(dupeString)) return false;
		dupeSet.add(dupeString);
		return array.filter((v) => v.controlBlock.equals(item.controlBlock)).length === 0;
	}
	exports.canAddToArray = canAddToArray;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/tapMerkleRoot.js
var require_tapMerkleRoot = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_MERKLE_ROOT || keyVal.key.length !== 1) throw new Error("Decode Error: could not decode tapMerkleRoot with key 0x" + keyVal.key.toString("hex"));
		if (!check(keyVal.value)) throw new Error("Decode Error: tapMerkleRoot not a 32-byte hash");
		return keyVal.value;
	}
	exports.decode = decode;
	function encode(value) {
		return {
			key: Buffer.from([typeFields_1.InputTypes.TAP_MERKLE_ROOT]),
			value
		};
	}
	exports.encode = encode;
	exports.expected = "Buffer";
	function check(data) {
		return Buffer.isBuffer(data) && data.length === 32;
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.tapMerkleRoot === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/tapScriptSig.js
var require_tapScriptSig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_SCRIPT_SIG) throw new Error("Decode Error: could not decode tapScriptSig with key 0x" + keyVal.key.toString("hex"));
		if (keyVal.key.length !== 65) throw new Error("Decode Error: tapScriptSig has invalid key 0x" + keyVal.key.toString("hex"));
		if (keyVal.value.length !== 64 && keyVal.value.length !== 65) throw new Error("Decode Error: tapScriptSig has invalid signature in key 0x" + keyVal.key.toString("hex"));
		return {
			pubkey: keyVal.key.slice(1, 33),
			leafHash: keyVal.key.slice(33),
			signature: keyVal.value
		};
	}
	exports.decode = decode;
	function encode(tSig) {
		const head = Buffer.from([typeFields_1.InputTypes.TAP_SCRIPT_SIG]);
		return {
			key: Buffer.concat([
				head,
				tSig.pubkey,
				tSig.leafHash
			]),
			value: tSig.signature
		};
	}
	exports.encode = encode;
	exports.expected = "{ pubkey: Buffer; leafHash: Buffer; signature: Buffer; }";
	function check(data) {
		return Buffer.isBuffer(data.pubkey) && Buffer.isBuffer(data.leafHash) && Buffer.isBuffer(data.signature) && data.pubkey.length === 32 && data.leafHash.length === 32 && (data.signature.length === 64 || data.signature.length === 65);
	}
	exports.check = check;
	function canAddToArray(array, item, dupeSet) {
		const dupeString = item.pubkey.toString("hex") + item.leafHash.toString("hex");
		if (dupeSet.has(dupeString)) return false;
		dupeSet.add(dupeString);
		return array.filter((v) => v.pubkey.equals(item.pubkey) && v.leafHash.equals(item.leafHash)).length === 0;
	}
	exports.canAddToArray = canAddToArray;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/varint.js
var require_varint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var MAX_SAFE_INTEGER = 9007199254740991;
	function checkUInt53(n) {
		if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError("value out of range");
	}
	function encode(_number, buffer, offset) {
		checkUInt53(_number);
		if (!buffer) buffer = Buffer.allocUnsafe(encodingLength(_number));
		if (!Buffer.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
		if (!offset) offset = 0;
		if (_number < 253) {
			buffer.writeUInt8(_number, offset);
			Object.assign(encode, { bytes: 1 });
		} else if (_number <= 65535) {
			buffer.writeUInt8(253, offset);
			buffer.writeUInt16LE(_number, offset + 1);
			Object.assign(encode, { bytes: 3 });
		} else if (_number <= 4294967295) {
			buffer.writeUInt8(254, offset);
			buffer.writeUInt32LE(_number, offset + 1);
			Object.assign(encode, { bytes: 5 });
		} else {
			buffer.writeUInt8(255, offset);
			buffer.writeUInt32LE(_number >>> 0, offset + 1);
			buffer.writeUInt32LE(_number / 4294967296 | 0, offset + 5);
			Object.assign(encode, { bytes: 9 });
		}
		return buffer;
	}
	exports.encode = encode;
	function decode(buffer, offset) {
		if (!Buffer.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
		if (!offset) offset = 0;
		const first = buffer.readUInt8(offset);
		if (first < 253) {
			Object.assign(decode, { bytes: 1 });
			return first;
		} else if (first === 253) {
			Object.assign(decode, { bytes: 3 });
			return buffer.readUInt16LE(offset + 1);
		} else if (first === 254) {
			Object.assign(decode, { bytes: 5 });
			return buffer.readUInt32LE(offset + 1);
		} else {
			Object.assign(decode, { bytes: 9 });
			const lo = buffer.readUInt32LE(offset + 1);
			const _number = buffer.readUInt32LE(offset + 5) * 4294967296 + lo;
			checkUInt53(_number);
			return _number;
		}
	}
	exports.decode = decode;
	function encodingLength(_number) {
		checkUInt53(_number);
		return _number < 253 ? 1 : _number <= 65535 ? 3 : _number <= 4294967295 ? 5 : 9;
	}
	exports.encodingLength = encodingLength;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/tools.js
var require_tools = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var varuint = require_varint();
	exports.range = (n) => [...Array(n).keys()];
	function reverseBuffer(buffer) {
		if (buffer.length < 1) return buffer;
		let j = buffer.length - 1;
		let tmp = 0;
		for (let i = 0; i < buffer.length / 2; i++) {
			tmp = buffer[i];
			buffer[i] = buffer[j];
			buffer[j] = tmp;
			j--;
		}
		return buffer;
	}
	exports.reverseBuffer = reverseBuffer;
	function keyValsToBuffer(keyVals) {
		const buffers = keyVals.map(keyValToBuffer);
		buffers.push(Buffer.from([0]));
		return Buffer.concat(buffers);
	}
	exports.keyValsToBuffer = keyValsToBuffer;
	function keyValToBuffer(keyVal) {
		const keyLen = keyVal.key.length;
		const valLen = keyVal.value.length;
		const keyVarIntLen = varuint.encodingLength(keyLen);
		const valVarIntLen = varuint.encodingLength(valLen);
		const buffer = Buffer.allocUnsafe(keyVarIntLen + keyLen + valVarIntLen + valLen);
		varuint.encode(keyLen, buffer, 0);
		keyVal.key.copy(buffer, keyVarIntLen);
		varuint.encode(valLen, buffer, keyVarIntLen + keyLen);
		keyVal.value.copy(buffer, keyVarIntLen + keyLen + valVarIntLen);
		return buffer;
	}
	exports.keyValToBuffer = keyValToBuffer;
	function verifuint(value, max) {
		if (typeof value !== "number") throw new Error("cannot write a non-number as a number");
		if (value < 0) throw new Error("specified a negative value for writing an unsigned value");
		if (value > max) throw new Error("RangeError: value out of range");
		if (Math.floor(value) !== value) throw new Error("value has a fractional component");
	}
	function readUInt64LE(buffer, offset) {
		const a = buffer.readUInt32LE(offset);
		let b = buffer.readUInt32LE(offset + 4);
		b *= 4294967296;
		verifuint(b + a, 9007199254740991);
		return b + a;
	}
	exports.readUInt64LE = readUInt64LE;
	function writeUInt64LE(buffer, value, offset) {
		verifuint(value, 9007199254740991);
		buffer.writeInt32LE(value & -1, offset);
		buffer.writeUInt32LE(Math.floor(value / 4294967296), offset + 4);
		return offset + 8;
	}
	exports.writeUInt64LE = writeUInt64LE;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/input/witnessUtxo.js
var require_witnessUtxo = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	var tools_1 = require_tools();
	var varuint = require_varint();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.InputTypes.WITNESS_UTXO) throw new Error("Decode Error: could not decode witnessUtxo with key 0x" + keyVal.key.toString("hex"));
		const value = tools_1.readUInt64LE(keyVal.value, 0);
		let _offset = 8;
		const scriptLen = varuint.decode(keyVal.value, _offset);
		_offset += varuint.encodingLength(scriptLen);
		const script = keyVal.value.slice(_offset);
		if (script.length !== scriptLen) throw new Error("Decode Error: WITNESS_UTXO script is not proper length");
		return {
			script,
			value
		};
	}
	exports.decode = decode;
	function encode(data) {
		const { script, value } = data;
		const varintLen = varuint.encodingLength(script.length);
		const result = Buffer.allocUnsafe(8 + varintLen + script.length);
		tools_1.writeUInt64LE(result, value, 0);
		varuint.encode(script.length, result, 8);
		script.copy(result, 8 + varintLen);
		return {
			key: Buffer.from([typeFields_1.InputTypes.WITNESS_UTXO]),
			value: result
		};
	}
	exports.encode = encode;
	exports.expected = "{ script: Buffer; value: number; }";
	function check(data) {
		return Buffer.isBuffer(data.script) && typeof data.value === "number";
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.witnessUtxo === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/output/tapTree.js
var require_tapTree = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	var varuint = require_varint();
	function decode(keyVal) {
		if (keyVal.key[0] !== typeFields_1.OutputTypes.TAP_TREE || keyVal.key.length !== 1) throw new Error("Decode Error: could not decode tapTree with key 0x" + keyVal.key.toString("hex"));
		let _offset = 0;
		const data = [];
		while (_offset < keyVal.value.length) {
			const depth = keyVal.value[_offset++];
			const leafVersion = keyVal.value[_offset++];
			const scriptLen = varuint.decode(keyVal.value, _offset);
			_offset += varuint.encodingLength(scriptLen);
			data.push({
				depth,
				leafVersion,
				script: keyVal.value.slice(_offset, _offset + scriptLen)
			});
			_offset += scriptLen;
		}
		return { leaves: data };
	}
	exports.decode = decode;
	function encode(tree) {
		const key = Buffer.from([typeFields_1.OutputTypes.TAP_TREE]);
		const bufs = [].concat(...tree.leaves.map((tapLeaf) => [
			Buffer.of(tapLeaf.depth, tapLeaf.leafVersion),
			varuint.encode(tapLeaf.script.length),
			tapLeaf.script
		]));
		return {
			key,
			value: Buffer.concat(bufs)
		};
	}
	exports.encode = encode;
	exports.expected = "{ leaves: [{ depth: number; leafVersion: number, script: Buffer; }] }";
	function check(data) {
		return Array.isArray(data.leaves) && data.leaves.every((tapLeaf) => tapLeaf.depth >= 0 && tapLeaf.depth <= 128 && (tapLeaf.leafVersion & 254) === tapLeaf.leafVersion && Buffer.isBuffer(tapLeaf.script));
	}
	exports.check = check;
	function canAdd(currentData, newData) {
		return !!currentData && !!newData && currentData.tapTree === void 0;
	}
	exports.canAdd = canAdd;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/shared/bip32Derivation.js
var require_bip32Derivation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var range = (n) => [...Array(n).keys()];
	var isValidDERKey = (pubkey) => pubkey.length === 33 && [2, 3].includes(pubkey[0]) || pubkey.length === 65 && 4 === pubkey[0];
	function makeConverter(TYPE_BYTE, isValidPubkey = isValidDERKey) {
		function decode(keyVal) {
			if (keyVal.key[0] !== TYPE_BYTE) throw new Error("Decode Error: could not decode bip32Derivation with key 0x" + keyVal.key.toString("hex"));
			const pubkey = keyVal.key.slice(1);
			if (!isValidPubkey(pubkey)) throw new Error("Decode Error: bip32Derivation has invalid pubkey in key 0x" + keyVal.key.toString("hex"));
			if (keyVal.value.length / 4 % 1 !== 0) throw new Error("Decode Error: Input BIP32_DERIVATION value length should be multiple of 4");
			const data = {
				masterFingerprint: keyVal.value.slice(0, 4),
				pubkey,
				path: "m"
			};
			for (const i of range(keyVal.value.length / 4 - 1)) {
				const val = keyVal.value.readUInt32LE(i * 4 + 4);
				const isHard = !!(val & 2147483648);
				const idx = val & 2147483647;
				data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
			}
			return data;
		}
		function encode(data) {
			const head = Buffer.from([TYPE_BYTE]);
			const key = Buffer.concat([head, data.pubkey]);
			const splitPath = data.path.split("/");
			const value = Buffer.allocUnsafe(splitPath.length * 4);
			data.masterFingerprint.copy(value, 0);
			let offset = 4;
			splitPath.slice(1).forEach((level) => {
				const isHard = level.slice(-1) === "'";
				let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
				if (isHard) num += 2147483648;
				value.writeUInt32LE(num, offset);
				offset += 4;
			});
			return {
				key,
				value
			};
		}
		const expected = "{ masterFingerprint: Buffer; pubkey: Buffer; path: string; }";
		function check(data) {
			return Buffer.isBuffer(data.pubkey) && Buffer.isBuffer(data.masterFingerprint) && typeof data.path === "string" && isValidPubkey(data.pubkey) && data.masterFingerprint.length === 4;
		}
		function canAddToArray(array, item, dupeSet) {
			const dupeString = item.pubkey.toString("hex");
			if (dupeSet.has(dupeString)) return false;
			dupeSet.add(dupeString);
			return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
		}
		return {
			decode,
			encode,
			check,
			expected,
			canAddToArray
		};
	}
	exports.makeConverter = makeConverter;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/shared/checkPubkey.js
var require_checkPubkey = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	function makeChecker(pubkeyTypes) {
		return checkPubkey;
		function checkPubkey(keyVal) {
			let pubkey;
			if (pubkeyTypes.includes(keyVal.key[0])) {
				pubkey = keyVal.key.slice(1);
				if (!(pubkey.length === 33 || pubkey.length === 65) || ![
					2,
					3,
					4
				].includes(pubkey[0])) throw new Error("Format Error: invalid pubkey in key 0x" + keyVal.key.toString("hex"));
			}
			return pubkey;
		}
	}
	exports.makeChecker = makeChecker;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/shared/redeemScript.js
var require_redeemScript = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	function makeConverter(TYPE_BYTE) {
		function decode(keyVal) {
			if (keyVal.key[0] !== TYPE_BYTE) throw new Error("Decode Error: could not decode redeemScript with key 0x" + keyVal.key.toString("hex"));
			return keyVal.value;
		}
		function encode(data) {
			return {
				key: Buffer.from([TYPE_BYTE]),
				value: data
			};
		}
		const expected = "Buffer";
		function check(data) {
			return Buffer.isBuffer(data);
		}
		function canAdd(currentData, newData) {
			return !!currentData && !!newData && currentData.redeemScript === void 0;
		}
		return {
			decode,
			encode,
			check,
			expected,
			canAdd
		};
	}
	exports.makeConverter = makeConverter;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/shared/tapBip32Derivation.js
var require_tapBip32Derivation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var varuint = require_varint();
	var bip32Derivation = require_bip32Derivation();
	var isValidBIP340Key = (pubkey) => pubkey.length === 32;
	function makeConverter(TYPE_BYTE) {
		const parent = bip32Derivation.makeConverter(TYPE_BYTE, isValidBIP340Key);
		function decode(keyVal) {
			const nHashes = varuint.decode(keyVal.value);
			const nHashesLen = varuint.encodingLength(nHashes);
			const base = parent.decode({
				key: keyVal.key,
				value: keyVal.value.slice(nHashesLen + nHashes * 32)
			});
			const leafHashes = new Array(nHashes);
			for (let i = 0, _offset = nHashesLen; i < nHashes; i++, _offset += 32) leafHashes[i] = keyVal.value.slice(_offset, _offset + 32);
			return Object.assign({}, base, { leafHashes });
		}
		function encode(data) {
			const base = parent.encode(data);
			const nHashesLen = varuint.encodingLength(data.leafHashes.length);
			const nHashesBuf = Buffer.allocUnsafe(nHashesLen);
			varuint.encode(data.leafHashes.length, nHashesBuf);
			const value = Buffer.concat([
				nHashesBuf,
				...data.leafHashes,
				base.value
			]);
			return Object.assign({}, base, { value });
		}
		const expected = "{ masterFingerprint: Buffer; pubkey: Buffer; path: string; leafHashes: Buffer[]; }";
		function check(data) {
			return Array.isArray(data.leafHashes) && data.leafHashes.every((leafHash) => Buffer.isBuffer(leafHash) && leafHash.length === 32) && parent.check(data);
		}
		return {
			decode,
			encode,
			check,
			expected,
			canAddToArray: parent.canAddToArray
		};
	}
	exports.makeConverter = makeConverter;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/shared/tapInternalKey.js
var require_tapInternalKey = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	function makeConverter(TYPE_BYTE) {
		function decode(keyVal) {
			if (keyVal.key[0] !== TYPE_BYTE || keyVal.key.length !== 1) throw new Error("Decode Error: could not decode tapInternalKey with key 0x" + keyVal.key.toString("hex"));
			if (keyVal.value.length !== 32) throw new Error("Decode Error: tapInternalKey not a 32-byte x-only pubkey");
			return keyVal.value;
		}
		function encode(value) {
			return {
				key: Buffer.from([TYPE_BYTE]),
				value
			};
		}
		const expected = "Buffer";
		function check(data) {
			return Buffer.isBuffer(data) && data.length === 32;
		}
		function canAdd(currentData, newData) {
			return !!currentData && !!newData && currentData.tapInternalKey === void 0;
		}
		return {
			decode,
			encode,
			check,
			expected,
			canAdd
		};
	}
	exports.makeConverter = makeConverter;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/shared/witnessScript.js
var require_witnessScript = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	function makeConverter(TYPE_BYTE) {
		function decode(keyVal) {
			if (keyVal.key[0] !== TYPE_BYTE) throw new Error("Decode Error: could not decode witnessScript with key 0x" + keyVal.key.toString("hex"));
			return keyVal.value;
		}
		function encode(data) {
			return {
				key: Buffer.from([TYPE_BYTE]),
				value: data
			};
		}
		const expected = "Buffer";
		function check(data) {
			return Buffer.isBuffer(data);
		}
		function canAdd(currentData, newData) {
			return !!currentData && !!newData && currentData.witnessScript === void 0;
		}
		return {
			decode,
			encode,
			check,
			expected,
			canAdd
		};
	}
	exports.makeConverter = makeConverter;
}));
//#endregion
//#region node_modules/bip174/src/lib/converter/index.js
var require_converter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var typeFields_1 = require_typeFields();
	var globalXpub = require_globalXpub();
	var unsignedTx = require_unsignedTx();
	var finalScriptSig = require_finalScriptSig();
	var finalScriptWitness = require_finalScriptWitness();
	var nonWitnessUtxo = require_nonWitnessUtxo();
	var partialSig = require_partialSig();
	var porCommitment = require_porCommitment();
	var sighashType = require_sighashType();
	var tapKeySig = require_tapKeySig();
	var tapLeafScript = require_tapLeafScript();
	var tapMerkleRoot = require_tapMerkleRoot();
	var tapScriptSig = require_tapScriptSig();
	var witnessUtxo = require_witnessUtxo();
	var tapTree = require_tapTree();
	var bip32Derivation = require_bip32Derivation();
	var checkPubkey = require_checkPubkey();
	var redeemScript = require_redeemScript();
	var tapBip32Derivation = require_tapBip32Derivation();
	var tapInternalKey = require_tapInternalKey();
	var witnessScript = require_witnessScript();
	exports.globals = {
		unsignedTx,
		globalXpub,
		checkPubkey: checkPubkey.makeChecker([])
	};
	exports.inputs = {
		nonWitnessUtxo,
		partialSig,
		sighashType,
		finalScriptSig,
		finalScriptWitness,
		porCommitment,
		witnessUtxo,
		bip32Derivation: bip32Derivation.makeConverter(typeFields_1.InputTypes.BIP32_DERIVATION),
		redeemScript: redeemScript.makeConverter(typeFields_1.InputTypes.REDEEM_SCRIPT),
		witnessScript: witnessScript.makeConverter(typeFields_1.InputTypes.WITNESS_SCRIPT),
		checkPubkey: checkPubkey.makeChecker([typeFields_1.InputTypes.PARTIAL_SIG, typeFields_1.InputTypes.BIP32_DERIVATION]),
		tapKeySig,
		tapScriptSig,
		tapLeafScript,
		tapBip32Derivation: tapBip32Derivation.makeConverter(typeFields_1.InputTypes.TAP_BIP32_DERIVATION),
		tapInternalKey: tapInternalKey.makeConverter(typeFields_1.InputTypes.TAP_INTERNAL_KEY),
		tapMerkleRoot
	};
	exports.outputs = {
		bip32Derivation: bip32Derivation.makeConverter(typeFields_1.OutputTypes.BIP32_DERIVATION),
		redeemScript: redeemScript.makeConverter(typeFields_1.OutputTypes.REDEEM_SCRIPT),
		witnessScript: witnessScript.makeConverter(typeFields_1.OutputTypes.WITNESS_SCRIPT),
		checkPubkey: checkPubkey.makeChecker([typeFields_1.OutputTypes.BIP32_DERIVATION]),
		tapBip32Derivation: tapBip32Derivation.makeConverter(typeFields_1.OutputTypes.TAP_BIP32_DERIVATION),
		tapTree,
		tapInternalKey: tapInternalKey.makeConverter(typeFields_1.OutputTypes.TAP_INTERNAL_KEY)
	};
}));
//#endregion
//#region node_modules/bip174/src/lib/parser/fromBuffer.js
var require_fromBuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var convert = require_converter();
	var tools_1 = require_tools();
	var varuint = require_varint();
	var typeFields_1 = require_typeFields();
	function psbtFromBuffer(buffer, txGetter) {
		let offset = 0;
		function varSlice() {
			const keyLen = varuint.decode(buffer, offset);
			offset += varuint.encodingLength(keyLen);
			const key = buffer.slice(offset, offset + keyLen);
			offset += keyLen;
			return key;
		}
		function readUInt32BE() {
			const num = buffer.readUInt32BE(offset);
			offset += 4;
			return num;
		}
		function readUInt8() {
			const num = buffer.readUInt8(offset);
			offset += 1;
			return num;
		}
		function getKeyValue() {
			return {
				key: varSlice(),
				value: varSlice()
			};
		}
		function checkEndOfKeyValPairs() {
			if (offset >= buffer.length) throw new Error("Format Error: Unexpected End of PSBT");
			const isEnd = buffer.readUInt8(offset) === 0;
			if (isEnd) offset++;
			return isEnd;
		}
		if (readUInt32BE() !== 1886610036) throw new Error("Format Error: Invalid Magic Number");
		if (readUInt8() !== 255) throw new Error("Format Error: Magic Number must be followed by 0xff separator");
		const globalMapKeyVals = [];
		const globalKeyIndex = {};
		while (!checkEndOfKeyValPairs()) {
			const keyVal = getKeyValue();
			const hexKey = keyVal.key.toString("hex");
			if (globalKeyIndex[hexKey]) throw new Error("Format Error: Keys must be unique for global keymap: key " + hexKey);
			globalKeyIndex[hexKey] = 1;
			globalMapKeyVals.push(keyVal);
		}
		const unsignedTxMaps = globalMapKeyVals.filter((keyVal) => keyVal.key[0] === typeFields_1.GlobalTypes.UNSIGNED_TX);
		if (unsignedTxMaps.length !== 1) throw new Error("Format Error: Only one UNSIGNED_TX allowed");
		const unsignedTx = txGetter(unsignedTxMaps[0].value);
		const { inputCount, outputCount } = unsignedTx.getInputOutputCounts();
		const inputKeyVals = [];
		const outputKeyVals = [];
		for (const index of tools_1.range(inputCount)) {
			const inputKeyIndex = {};
			const input = [];
			while (!checkEndOfKeyValPairs()) {
				const keyVal = getKeyValue();
				const hexKey = keyVal.key.toString("hex");
				if (inputKeyIndex[hexKey]) throw new Error("Format Error: Keys must be unique for each input: input index " + index + " key " + hexKey);
				inputKeyIndex[hexKey] = 1;
				input.push(keyVal);
			}
			inputKeyVals.push(input);
		}
		for (const index of tools_1.range(outputCount)) {
			const outputKeyIndex = {};
			const output = [];
			while (!checkEndOfKeyValPairs()) {
				const keyVal = getKeyValue();
				const hexKey = keyVal.key.toString("hex");
				if (outputKeyIndex[hexKey]) throw new Error("Format Error: Keys must be unique for each output: output index " + index + " key " + hexKey);
				outputKeyIndex[hexKey] = 1;
				output.push(keyVal);
			}
			outputKeyVals.push(output);
		}
		return psbtFromKeyVals(unsignedTx, {
			globalMapKeyVals,
			inputKeyVals,
			outputKeyVals
		});
	}
	exports.psbtFromBuffer = psbtFromBuffer;
	function checkKeyBuffer(type, keyBuf, keyNum) {
		if (!keyBuf.equals(Buffer.from([keyNum]))) throw new Error(`Format Error: Invalid ${type} key: ${keyBuf.toString("hex")}`);
	}
	exports.checkKeyBuffer = checkKeyBuffer;
	function psbtFromKeyVals(unsignedTx, { globalMapKeyVals, inputKeyVals, outputKeyVals }) {
		const globalMap = { unsignedTx };
		let txCount = 0;
		for (const keyVal of globalMapKeyVals) switch (keyVal.key[0]) {
			case typeFields_1.GlobalTypes.UNSIGNED_TX:
				checkKeyBuffer("global", keyVal.key, typeFields_1.GlobalTypes.UNSIGNED_TX);
				if (txCount > 0) throw new Error("Format Error: GlobalMap has multiple UNSIGNED_TX");
				txCount++;
				break;
			case typeFields_1.GlobalTypes.GLOBAL_XPUB:
				if (globalMap.globalXpub === void 0) globalMap.globalXpub = [];
				globalMap.globalXpub.push(convert.globals.globalXpub.decode(keyVal));
				break;
			default:
				if (!globalMap.unknownKeyVals) globalMap.unknownKeyVals = [];
				globalMap.unknownKeyVals.push(keyVal);
		}
		const inputCount = inputKeyVals.length;
		const outputCount = outputKeyVals.length;
		const inputs = [];
		const outputs = [];
		for (const index of tools_1.range(inputCount)) {
			const input = {};
			for (const keyVal of inputKeyVals[index]) {
				convert.inputs.checkPubkey(keyVal);
				switch (keyVal.key[0]) {
					case typeFields_1.InputTypes.NON_WITNESS_UTXO:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.NON_WITNESS_UTXO);
						if (input.nonWitnessUtxo !== void 0) throw new Error("Format Error: Input has multiple NON_WITNESS_UTXO");
						input.nonWitnessUtxo = convert.inputs.nonWitnessUtxo.decode(keyVal);
						break;
					case typeFields_1.InputTypes.WITNESS_UTXO:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.WITNESS_UTXO);
						if (input.witnessUtxo !== void 0) throw new Error("Format Error: Input has multiple WITNESS_UTXO");
						input.witnessUtxo = convert.inputs.witnessUtxo.decode(keyVal);
						break;
					case typeFields_1.InputTypes.PARTIAL_SIG:
						if (input.partialSig === void 0) input.partialSig = [];
						input.partialSig.push(convert.inputs.partialSig.decode(keyVal));
						break;
					case typeFields_1.InputTypes.SIGHASH_TYPE:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.SIGHASH_TYPE);
						if (input.sighashType !== void 0) throw new Error("Format Error: Input has multiple SIGHASH_TYPE");
						input.sighashType = convert.inputs.sighashType.decode(keyVal);
						break;
					case typeFields_1.InputTypes.REDEEM_SCRIPT:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.REDEEM_SCRIPT);
						if (input.redeemScript !== void 0) throw new Error("Format Error: Input has multiple REDEEM_SCRIPT");
						input.redeemScript = convert.inputs.redeemScript.decode(keyVal);
						break;
					case typeFields_1.InputTypes.WITNESS_SCRIPT:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.WITNESS_SCRIPT);
						if (input.witnessScript !== void 0) throw new Error("Format Error: Input has multiple WITNESS_SCRIPT");
						input.witnessScript = convert.inputs.witnessScript.decode(keyVal);
						break;
					case typeFields_1.InputTypes.BIP32_DERIVATION:
						if (input.bip32Derivation === void 0) input.bip32Derivation = [];
						input.bip32Derivation.push(convert.inputs.bip32Derivation.decode(keyVal));
						break;
					case typeFields_1.InputTypes.FINAL_SCRIPTSIG:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.FINAL_SCRIPTSIG);
						input.finalScriptSig = convert.inputs.finalScriptSig.decode(keyVal);
						break;
					case typeFields_1.InputTypes.FINAL_SCRIPTWITNESS:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.FINAL_SCRIPTWITNESS);
						input.finalScriptWitness = convert.inputs.finalScriptWitness.decode(keyVal);
						break;
					case typeFields_1.InputTypes.POR_COMMITMENT:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.POR_COMMITMENT);
						input.porCommitment = convert.inputs.porCommitment.decode(keyVal);
						break;
					case typeFields_1.InputTypes.TAP_KEY_SIG:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.TAP_KEY_SIG);
						input.tapKeySig = convert.inputs.tapKeySig.decode(keyVal);
						break;
					case typeFields_1.InputTypes.TAP_SCRIPT_SIG:
						if (input.tapScriptSig === void 0) input.tapScriptSig = [];
						input.tapScriptSig.push(convert.inputs.tapScriptSig.decode(keyVal));
						break;
					case typeFields_1.InputTypes.TAP_LEAF_SCRIPT:
						if (input.tapLeafScript === void 0) input.tapLeafScript = [];
						input.tapLeafScript.push(convert.inputs.tapLeafScript.decode(keyVal));
						break;
					case typeFields_1.InputTypes.TAP_BIP32_DERIVATION:
						if (input.tapBip32Derivation === void 0) input.tapBip32Derivation = [];
						input.tapBip32Derivation.push(convert.inputs.tapBip32Derivation.decode(keyVal));
						break;
					case typeFields_1.InputTypes.TAP_INTERNAL_KEY:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.TAP_INTERNAL_KEY);
						input.tapInternalKey = convert.inputs.tapInternalKey.decode(keyVal);
						break;
					case typeFields_1.InputTypes.TAP_MERKLE_ROOT:
						checkKeyBuffer("input", keyVal.key, typeFields_1.InputTypes.TAP_MERKLE_ROOT);
						input.tapMerkleRoot = convert.inputs.tapMerkleRoot.decode(keyVal);
						break;
					default:
						if (!input.unknownKeyVals) input.unknownKeyVals = [];
						input.unknownKeyVals.push(keyVal);
				}
			}
			inputs.push(input);
		}
		for (const index of tools_1.range(outputCount)) {
			const output = {};
			for (const keyVal of outputKeyVals[index]) {
				convert.outputs.checkPubkey(keyVal);
				switch (keyVal.key[0]) {
					case typeFields_1.OutputTypes.REDEEM_SCRIPT:
						checkKeyBuffer("output", keyVal.key, typeFields_1.OutputTypes.REDEEM_SCRIPT);
						if (output.redeemScript !== void 0) throw new Error("Format Error: Output has multiple REDEEM_SCRIPT");
						output.redeemScript = convert.outputs.redeemScript.decode(keyVal);
						break;
					case typeFields_1.OutputTypes.WITNESS_SCRIPT:
						checkKeyBuffer("output", keyVal.key, typeFields_1.OutputTypes.WITNESS_SCRIPT);
						if (output.witnessScript !== void 0) throw new Error("Format Error: Output has multiple WITNESS_SCRIPT");
						output.witnessScript = convert.outputs.witnessScript.decode(keyVal);
						break;
					case typeFields_1.OutputTypes.BIP32_DERIVATION:
						if (output.bip32Derivation === void 0) output.bip32Derivation = [];
						output.bip32Derivation.push(convert.outputs.bip32Derivation.decode(keyVal));
						break;
					case typeFields_1.OutputTypes.TAP_INTERNAL_KEY:
						checkKeyBuffer("output", keyVal.key, typeFields_1.OutputTypes.TAP_INTERNAL_KEY);
						output.tapInternalKey = convert.outputs.tapInternalKey.decode(keyVal);
						break;
					case typeFields_1.OutputTypes.TAP_TREE:
						checkKeyBuffer("output", keyVal.key, typeFields_1.OutputTypes.TAP_TREE);
						output.tapTree = convert.outputs.tapTree.decode(keyVal);
						break;
					case typeFields_1.OutputTypes.TAP_BIP32_DERIVATION:
						if (output.tapBip32Derivation === void 0) output.tapBip32Derivation = [];
						output.tapBip32Derivation.push(convert.outputs.tapBip32Derivation.decode(keyVal));
						break;
					default:
						if (!output.unknownKeyVals) output.unknownKeyVals = [];
						output.unknownKeyVals.push(keyVal);
				}
			}
			outputs.push(output);
		}
		return {
			globalMap,
			inputs,
			outputs
		};
	}
	exports.psbtFromKeyVals = psbtFromKeyVals;
}));
//#endregion
//#region node_modules/bip174/src/lib/parser/toBuffer.js
var require_toBuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var convert = require_converter();
	var tools_1 = require_tools();
	function psbtToBuffer({ globalMap, inputs, outputs }) {
		const { globalKeyVals, inputKeyVals, outputKeyVals } = psbtToKeyVals({
			globalMap,
			inputs,
			outputs
		});
		const globalBuffer = tools_1.keyValsToBuffer(globalKeyVals);
		const keyValsOrEmptyToBuffer = (keyVals) => keyVals.length === 0 ? [Buffer.from([0])] : keyVals.map(tools_1.keyValsToBuffer);
		const inputBuffers = keyValsOrEmptyToBuffer(inputKeyVals);
		const outputBuffers = keyValsOrEmptyToBuffer(outputKeyVals);
		const header = Buffer.allocUnsafe(5);
		header.writeUIntBE(482972169471, 0, 5);
		return Buffer.concat([header, globalBuffer].concat(inputBuffers, outputBuffers));
	}
	exports.psbtToBuffer = psbtToBuffer;
	var sortKeyVals = (a, b) => {
		return a.key.compare(b.key);
	};
	function keyValsFromMap(keyValMap, converterFactory) {
		const keyHexSet = /* @__PURE__ */ new Set();
		const keyVals = Object.entries(keyValMap).reduce((result, [key, value]) => {
			if (key === "unknownKeyVals") return result;
			const converter = converterFactory[key];
			if (converter === void 0) return result;
			const encodedKeyVals = (Array.isArray(value) ? value : [value]).map(converter.encode);
			encodedKeyVals.map((kv) => kv.key.toString("hex")).forEach((hex) => {
				if (keyHexSet.has(hex)) throw new Error("Serialize Error: Duplicate key: " + hex);
				keyHexSet.add(hex);
			});
			return result.concat(encodedKeyVals);
		}, []);
		const otherKeyVals = keyValMap.unknownKeyVals ? keyValMap.unknownKeyVals.filter((keyVal) => {
			return !keyHexSet.has(keyVal.key.toString("hex"));
		}) : [];
		return keyVals.concat(otherKeyVals).sort(sortKeyVals);
	}
	function psbtToKeyVals({ globalMap, inputs, outputs }) {
		return {
			globalKeyVals: keyValsFromMap(globalMap, convert.globals),
			inputKeyVals: inputs.map((i) => keyValsFromMap(i, convert.inputs)),
			outputKeyVals: outputs.map((o) => keyValsFromMap(o, convert.outputs))
		};
	}
	exports.psbtToKeyVals = psbtToKeyVals;
}));
//#endregion
//#region node_modules/bip174/src/lib/parser/index.js
var require_parser = /* @__PURE__ */ __commonJSMin(((exports) => {
	function __export(m) {
		for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(require_fromBuffer());
	__export(require_toBuffer());
}));
//#endregion
//#region node_modules/bip174/src/lib/combiner/index.js
var require_combiner = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var parser_1 = require_parser();
	function combine(psbts) {
		const self = psbts[0];
		const selfKeyVals = parser_1.psbtToKeyVals(self);
		const others = psbts.slice(1);
		if (others.length === 0) throw new Error("Combine: Nothing to combine");
		const selfTx = getTx(self);
		if (selfTx === void 0) throw new Error("Combine: Self missing transaction");
		const selfGlobalSet = getKeySet(selfKeyVals.globalKeyVals);
		const selfInputSets = selfKeyVals.inputKeyVals.map(getKeySet);
		const selfOutputSets = selfKeyVals.outputKeyVals.map(getKeySet);
		for (const other of others) {
			const otherTx = getTx(other);
			if (otherTx === void 0 || !otherTx.toBuffer().equals(selfTx.toBuffer())) throw new Error("Combine: One of the Psbts does not have the same transaction.");
			const otherKeyVals = parser_1.psbtToKeyVals(other);
			getKeySet(otherKeyVals.globalKeyVals).forEach(keyPusher(selfGlobalSet, selfKeyVals.globalKeyVals, otherKeyVals.globalKeyVals));
			otherKeyVals.inputKeyVals.map(getKeySet).forEach((inputSet, idx) => inputSet.forEach(keyPusher(selfInputSets[idx], selfKeyVals.inputKeyVals[idx], otherKeyVals.inputKeyVals[idx])));
			otherKeyVals.outputKeyVals.map(getKeySet).forEach((outputSet, idx) => outputSet.forEach(keyPusher(selfOutputSets[idx], selfKeyVals.outputKeyVals[idx], otherKeyVals.outputKeyVals[idx])));
		}
		return parser_1.psbtFromKeyVals(selfTx, {
			globalMapKeyVals: selfKeyVals.globalKeyVals,
			inputKeyVals: selfKeyVals.inputKeyVals,
			outputKeyVals: selfKeyVals.outputKeyVals
		});
	}
	exports.combine = combine;
	function keyPusher(selfSet, selfKeyVals, otherKeyVals) {
		return (key) => {
			if (selfSet.has(key)) return;
			const newKv = otherKeyVals.filter((kv) => kv.key.toString("hex") === key)[0];
			selfKeyVals.push(newKv);
			selfSet.add(key);
		};
	}
	function getTx(psbt) {
		return psbt.globalMap.unsignedTx;
	}
	function getKeySet(keyVals) {
		const set = /* @__PURE__ */ new Set();
		keyVals.forEach((keyVal) => {
			const hex = keyVal.key.toString("hex");
			if (set.has(hex)) throw new Error("Combine: KeyValue Map keys should be unique");
			set.add(hex);
		});
		return set;
	}
}));
//#endregion
//#region node_modules/bip174/src/lib/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var converter = require_converter();
	function checkForInput(inputs, inputIndex) {
		const input = inputs[inputIndex];
		if (input === void 0) throw new Error(`No input #${inputIndex}`);
		return input;
	}
	exports.checkForInput = checkForInput;
	function checkForOutput(outputs, outputIndex) {
		const output = outputs[outputIndex];
		if (output === void 0) throw new Error(`No output #${outputIndex}`);
		return output;
	}
	exports.checkForOutput = checkForOutput;
	function checkHasKey(checkKeyVal, keyVals, enumLength) {
		if (checkKeyVal.key[0] < enumLength) throw new Error(`Use the method for your specific key instead of addUnknownKeyVal*`);
		if (keyVals && keyVals.filter((kv) => kv.key.equals(checkKeyVal.key)).length !== 0) throw new Error(`Duplicate Key: ${checkKeyVal.key.toString("hex")}`);
	}
	exports.checkHasKey = checkHasKey;
	function getEnumLength(myenum) {
		let count = 0;
		Object.keys(myenum).forEach((val) => {
			if (Number(isNaN(Number(val)))) count++;
		});
		return count;
	}
	exports.getEnumLength = getEnumLength;
	function inputCheckUncleanFinalized(inputIndex, input) {
		let result = false;
		if (input.nonWitnessUtxo || input.witnessUtxo) {
			const needScriptSig = !!input.redeemScript;
			const needWitnessScript = !!input.witnessScript;
			const scriptSigOK = !needScriptSig || !!input.finalScriptSig;
			const witnessScriptOK = !needWitnessScript || !!input.finalScriptWitness;
			const hasOneFinal = !!input.finalScriptSig || !!input.finalScriptWitness;
			result = scriptSigOK && witnessScriptOK && hasOneFinal;
		}
		if (result === false) throw new Error(`Input #${inputIndex} has too much or too little data to clean`);
	}
	exports.inputCheckUncleanFinalized = inputCheckUncleanFinalized;
	function throwForUpdateMaker(typeName, name, expected, data) {
		throw new Error(`Data for ${typeName} key ${name} is incorrect: Expected ${expected} and got ${JSON.stringify(data)}`);
	}
	function updateMaker(typeName) {
		return (updateData, mainData) => {
			for (const name of Object.keys(updateData)) {
				const data = updateData[name];
				const { canAdd, canAddToArray, check, expected } = converter[typeName + "s"][name] || {};
				const isArray = !!canAddToArray;
				if (check) {
					if (isArray) {
						if (!Array.isArray(data) || mainData[name] && !Array.isArray(mainData[name])) throw new Error(`Key type ${name} must be an array`);
						if (!data.every(check)) throwForUpdateMaker(typeName, name, expected, data);
						const arr = mainData[name] || [];
						const dupeCheckSet = /* @__PURE__ */ new Set();
						if (!data.every((v) => canAddToArray(arr, v, dupeCheckSet))) throw new Error("Can not add duplicate data to array");
						mainData[name] = arr.concat(data);
					} else {
						if (!check(data)) throwForUpdateMaker(typeName, name, expected, data);
						if (!canAdd(mainData, data)) throw new Error(`Can not add duplicate data to ${typeName}`);
						mainData[name] = data;
					}
				}
			}
		};
	}
	exports.updateGlobal = updateMaker("global");
	exports.updateInput = updateMaker("input");
	exports.updateOutput = updateMaker("output");
	function addInputAttributes(inputs, data) {
		const input = checkForInput(inputs, inputs.length - 1);
		exports.updateInput(data, input);
	}
	exports.addInputAttributes = addInputAttributes;
	function addOutputAttributes(outputs, data) {
		const output = checkForOutput(outputs, outputs.length - 1);
		exports.updateOutput(data, output);
	}
	exports.addOutputAttributes = addOutputAttributes;
	function defaultVersionSetter(version, txBuf) {
		if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) throw new Error("Set Version: Invalid Transaction");
		txBuf.writeUInt32LE(version, 0);
		return txBuf;
	}
	exports.defaultVersionSetter = defaultVersionSetter;
	function defaultLocktimeSetter(locktime, txBuf) {
		if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) throw new Error("Set Locktime: Invalid Transaction");
		txBuf.writeUInt32LE(locktime, txBuf.length - 4);
		return txBuf;
	}
	exports.defaultLocktimeSetter = defaultLocktimeSetter;
}));
//#endregion
//#region node_modules/bip174/src/lib/psbt.js
var require_psbt = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var combiner_1 = require_combiner();
	var parser_1 = require_parser();
	var typeFields_1 = require_typeFields();
	var utils_1 = require_utils();
	var Psbt = class {
		constructor(tx) {
			this.inputs = [];
			this.outputs = [];
			this.globalMap = { unsignedTx: tx };
		}
		static fromBase64(data, txFromBuffer) {
			const buffer = Buffer.from(data, "base64");
			return this.fromBuffer(buffer, txFromBuffer);
		}
		static fromHex(data, txFromBuffer) {
			const buffer = Buffer.from(data, "hex");
			return this.fromBuffer(buffer, txFromBuffer);
		}
		static fromBuffer(buffer, txFromBuffer) {
			const results = parser_1.psbtFromBuffer(buffer, txFromBuffer);
			const psbt = new this(results.globalMap.unsignedTx);
			Object.assign(psbt, results);
			return psbt;
		}
		toBase64() {
			return this.toBuffer().toString("base64");
		}
		toHex() {
			return this.toBuffer().toString("hex");
		}
		toBuffer() {
			return parser_1.psbtToBuffer(this);
		}
		updateGlobal(updateData) {
			utils_1.updateGlobal(updateData, this.globalMap);
			return this;
		}
		updateInput(inputIndex, updateData) {
			const input = utils_1.checkForInput(this.inputs, inputIndex);
			utils_1.updateInput(updateData, input);
			return this;
		}
		updateOutput(outputIndex, updateData) {
			const output = utils_1.checkForOutput(this.outputs, outputIndex);
			utils_1.updateOutput(updateData, output);
			return this;
		}
		addUnknownKeyValToGlobal(keyVal) {
			utils_1.checkHasKey(keyVal, this.globalMap.unknownKeyVals, utils_1.getEnumLength(typeFields_1.GlobalTypes));
			if (!this.globalMap.unknownKeyVals) this.globalMap.unknownKeyVals = [];
			this.globalMap.unknownKeyVals.push(keyVal);
			return this;
		}
		addUnknownKeyValToInput(inputIndex, keyVal) {
			const input = utils_1.checkForInput(this.inputs, inputIndex);
			utils_1.checkHasKey(keyVal, input.unknownKeyVals, utils_1.getEnumLength(typeFields_1.InputTypes));
			if (!input.unknownKeyVals) input.unknownKeyVals = [];
			input.unknownKeyVals.push(keyVal);
			return this;
		}
		addUnknownKeyValToOutput(outputIndex, keyVal) {
			const output = utils_1.checkForOutput(this.outputs, outputIndex);
			utils_1.checkHasKey(keyVal, output.unknownKeyVals, utils_1.getEnumLength(typeFields_1.OutputTypes));
			if (!output.unknownKeyVals) output.unknownKeyVals = [];
			output.unknownKeyVals.push(keyVal);
			return this;
		}
		addInput(inputData) {
			this.globalMap.unsignedTx.addInput(inputData);
			this.inputs.push({ unknownKeyVals: [] });
			const addKeyVals = inputData.unknownKeyVals || [];
			const inputIndex = this.inputs.length - 1;
			if (!Array.isArray(addKeyVals)) throw new Error("unknownKeyVals must be an Array");
			addKeyVals.forEach((keyVal) => this.addUnknownKeyValToInput(inputIndex, keyVal));
			utils_1.addInputAttributes(this.inputs, inputData);
			return this;
		}
		addOutput(outputData) {
			this.globalMap.unsignedTx.addOutput(outputData);
			this.outputs.push({ unknownKeyVals: [] });
			const addKeyVals = outputData.unknownKeyVals || [];
			const outputIndex = this.outputs.length - 1;
			if (!Array.isArray(addKeyVals)) throw new Error("unknownKeyVals must be an Array");
			addKeyVals.forEach((keyVal) => this.addUnknownKeyValToOutput(outputIndex, keyVal));
			utils_1.addOutputAttributes(this.outputs, outputData);
			return this;
		}
		clearFinalizedInput(inputIndex) {
			const input = utils_1.checkForInput(this.inputs, inputIndex);
			utils_1.inputCheckUncleanFinalized(inputIndex, input);
			for (const key of Object.keys(input)) if (![
				"witnessUtxo",
				"nonWitnessUtxo",
				"finalScriptSig",
				"finalScriptWitness",
				"unknownKeyVals"
			].includes(key)) delete input[key];
			return this;
		}
		combine(...those) {
			const result = combiner_1.combine([this].concat(those));
			Object.assign(this, result);
			return this;
		}
		getTransaction() {
			return this.globalMap.unsignedTx.toBuffer();
		}
	};
	exports.Psbt = Psbt;
}));
//#endregion
export { require_utils as n, require_varint as r, require_psbt as t };
