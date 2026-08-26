import { r as __require, t as __commonJSMin } from "../_runtime.mjs";
import { i as require_sha256, n as require_sha1, r as require_ripemd160, t as require_sha256$1 } from "./noble__hashes.mjs";
import { t as require_src$1 } from "./base-x.mjs";
import { t as require_dist } from "./bech32.mjs";
import { n as require_utils, r as require_varint, t as require_psbt$1 } from "./bip174.mjs";
//#region node_modules/bs58/index.js
var require_bs58 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_src$1()("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
}));
//#endregion
//#region node_modules/bs58check/base.js
var require_base = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var base58 = require_bs58();
	module.exports = function(checksumFn) {
		function encode(payload) {
			var payloadU8 = Uint8Array.from(payload);
			var checksum = checksumFn(payloadU8);
			var length = payloadU8.length + 4;
			var both = new Uint8Array(length);
			both.set(payloadU8, 0);
			both.set(checksum.subarray(0, 4), payloadU8.length);
			return base58.encode(both, length);
		}
		function decodeRaw(buffer) {
			var payload = buffer.slice(0, -4);
			var checksum = buffer.slice(-4);
			var newChecksum = checksumFn(payload);
			if (checksum[0] ^ newChecksum[0] | checksum[1] ^ newChecksum[1] | checksum[2] ^ newChecksum[2] | checksum[3] ^ newChecksum[3]) return;
			return payload;
		}
		function decodeUnsafe(string) {
			var buffer = base58.decodeUnsafe(string);
			if (!buffer) return;
			return decodeRaw(buffer);
		}
		function decode(string) {
			var payload = decodeRaw(base58.decode(string), checksumFn);
			if (!payload) throw new Error("Invalid checksum");
			return payload;
		}
		return {
			encode,
			decode,
			decodeUnsafe
		};
	};
}));
//#endregion
//#region node_modules/bs58check/index.js
var require_bs58check = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { sha256 } = require_sha256();
	var bs58checkBase = require_base();
	function sha256x2(buffer) {
		return sha256(sha256(buffer));
	}
	module.exports = bs58checkBase(sha256x2);
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/networks.js
var require_networks = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.testnet = exports.regtest = exports.bitcoin = void 0;
	/**
	* Represents the Bitcoin network configuration.
	*/
	exports.bitcoin = {
		/**
		* The message prefix used for signing Bitcoin messages.
		*/
		messagePrefix: "Bitcoin Signed Message:\n",
		/**
		* The Bech32 prefix used for Bitcoin addresses.
		*/
		bech32: "bc",
		/**
		* The BIP32 key prefixes for Bitcoin.
		*/
		bip32: {
			/**
			* The public key prefix for BIP32 extended public keys.
			*/
			public: 76067358,
			/**
			* The private key prefix for BIP32 extended private keys.
			*/
			private: 76066276
		},
		/**
		* The prefix for Bitcoin public key hashes.
		*/
		pubKeyHash: 0,
		/**
		* The prefix for Bitcoin script hashes.
		*/
		scriptHash: 5,
		/**
		* The prefix for Bitcoin Wallet Import Format (WIF) private keys.
		*/
		wif: 128
	};
	/**
	* Represents the regtest network configuration.
	*/
	exports.regtest = {
		messagePrefix: "Bitcoin Signed Message:\n",
		bech32: "bcrt",
		bip32: {
			public: 70617039,
			private: 70615956
		},
		pubKeyHash: 111,
		scriptHash: 196,
		wif: 239
	};
	/**
	* Represents the testnet network configuration.
	*/
	exports.testnet = {
		messagePrefix: "Bitcoin Signed Message:\n",
		bech32: "tb",
		bip32: {
			public: 70617039,
			private: 70615956
		},
		pubKeyHash: 111,
		scriptHash: 196,
		wif: 239
	};
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/bip66.js
var require_bip66 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encode = exports.decode = exports.check = void 0;
	function check(buffer) {
		if (buffer.length < 8) return false;
		if (buffer.length > 72) return false;
		if (buffer[0] !== 48) return false;
		if (buffer[1] !== buffer.length - 2) return false;
		if (buffer[2] !== 2) return false;
		const lenR = buffer[3];
		if (lenR === 0) return false;
		if (5 + lenR >= buffer.length) return false;
		if (buffer[4 + lenR] !== 2) return false;
		const lenS = buffer[5 + lenR];
		if (lenS === 0) return false;
		if (6 + lenR + lenS !== buffer.length) return false;
		if (buffer[4] & 128) return false;
		if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128)) return false;
		if (buffer[lenR + 6] & 128) return false;
		if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128)) return false;
		return true;
	}
	exports.check = check;
	function decode(buffer) {
		if (buffer.length < 8) throw new Error("DER sequence length is too short");
		if (buffer.length > 72) throw new Error("DER sequence length is too long");
		if (buffer[0] !== 48) throw new Error("Expected DER sequence");
		if (buffer[1] !== buffer.length - 2) throw new Error("DER sequence length is invalid");
		if (buffer[2] !== 2) throw new Error("Expected DER integer");
		const lenR = buffer[3];
		if (lenR === 0) throw new Error("R length is zero");
		if (5 + lenR >= buffer.length) throw new Error("R length is too long");
		if (buffer[4 + lenR] !== 2) throw new Error("Expected DER integer (2)");
		const lenS = buffer[5 + lenR];
		if (lenS === 0) throw new Error("S length is zero");
		if (6 + lenR + lenS !== buffer.length) throw new Error("S length is invalid");
		if (buffer[4] & 128) throw new Error("R value is negative");
		if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128)) throw new Error("R value excessively padded");
		if (buffer[lenR + 6] & 128) throw new Error("S value is negative");
		if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128)) throw new Error("S value excessively padded");
		return {
			r: buffer.slice(4, 4 + lenR),
			s: buffer.slice(6 + lenR)
		};
	}
	exports.decode = decode;
	function encode(r, s) {
		const lenR = r.length;
		const lenS = s.length;
		if (lenR === 0) throw new Error("R length is zero");
		if (lenS === 0) throw new Error("S length is zero");
		if (lenR > 33) throw new Error("R length is too long");
		if (lenS > 33) throw new Error("S length is too long");
		if (r[0] & 128) throw new Error("R value is negative");
		if (s[0] & 128) throw new Error("S value is negative");
		if (lenR > 1 && r[0] === 0 && !(r[1] & 128)) throw new Error("R value excessively padded");
		if (lenS > 1 && s[0] === 0 && !(s[1] & 128)) throw new Error("S value excessively padded");
		const signature = Buffer.allocUnsafe(6 + lenR + lenS);
		signature[0] = 48;
		signature[1] = signature.length - 2;
		signature[2] = 2;
		signature[3] = r.length;
		r.copy(signature, 4);
		signature[4 + lenR] = 2;
		signature[5 + lenR] = s.length;
		s.copy(signature, 6 + lenR);
		return signature;
	}
	exports.encode = encode;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/ops.js
var require_ops = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.REVERSE_OPS = exports.OPS = void 0;
	var OPS = {
		OP_FALSE: 0,
		OP_0: 0,
		OP_PUSHDATA1: 76,
		OP_PUSHDATA2: 77,
		OP_PUSHDATA4: 78,
		OP_1NEGATE: 79,
		OP_RESERVED: 80,
		OP_TRUE: 81,
		OP_1: 81,
		OP_2: 82,
		OP_3: 83,
		OP_4: 84,
		OP_5: 85,
		OP_6: 86,
		OP_7: 87,
		OP_8: 88,
		OP_9: 89,
		OP_10: 90,
		OP_11: 91,
		OP_12: 92,
		OP_13: 93,
		OP_14: 94,
		OP_15: 95,
		OP_16: 96,
		OP_NOP: 97,
		OP_VER: 98,
		OP_IF: 99,
		OP_NOTIF: 100,
		OP_VERIF: 101,
		OP_VERNOTIF: 102,
		OP_ELSE: 103,
		OP_ENDIF: 104,
		OP_VERIFY: 105,
		OP_RETURN: 106,
		OP_TOALTSTACK: 107,
		OP_FROMALTSTACK: 108,
		OP_2DROP: 109,
		OP_2DUP: 110,
		OP_3DUP: 111,
		OP_2OVER: 112,
		OP_2ROT: 113,
		OP_2SWAP: 114,
		OP_IFDUP: 115,
		OP_DEPTH: 116,
		OP_DROP: 117,
		OP_DUP: 118,
		OP_NIP: 119,
		OP_OVER: 120,
		OP_PICK: 121,
		OP_ROLL: 122,
		OP_ROT: 123,
		OP_SWAP: 124,
		OP_TUCK: 125,
		OP_CAT: 126,
		OP_SUBSTR: 127,
		OP_LEFT: 128,
		OP_RIGHT: 129,
		OP_SIZE: 130,
		OP_INVERT: 131,
		OP_AND: 132,
		OP_OR: 133,
		OP_XOR: 134,
		OP_EQUAL: 135,
		OP_EQUALVERIFY: 136,
		OP_RESERVED1: 137,
		OP_RESERVED2: 138,
		OP_1ADD: 139,
		OP_1SUB: 140,
		OP_2MUL: 141,
		OP_2DIV: 142,
		OP_NEGATE: 143,
		OP_ABS: 144,
		OP_NOT: 145,
		OP_0NOTEQUAL: 146,
		OP_ADD: 147,
		OP_SUB: 148,
		OP_MUL: 149,
		OP_DIV: 150,
		OP_MOD: 151,
		OP_LSHIFT: 152,
		OP_RSHIFT: 153,
		OP_BOOLAND: 154,
		OP_BOOLOR: 155,
		OP_NUMEQUAL: 156,
		OP_NUMEQUALVERIFY: 157,
		OP_NUMNOTEQUAL: 158,
		OP_LESSTHAN: 159,
		OP_GREATERTHAN: 160,
		OP_LESSTHANOREQUAL: 161,
		OP_GREATERTHANOREQUAL: 162,
		OP_MIN: 163,
		OP_MAX: 164,
		OP_WITHIN: 165,
		OP_RIPEMD160: 166,
		OP_SHA1: 167,
		OP_SHA256: 168,
		OP_HASH160: 169,
		OP_HASH256: 170,
		OP_CODESEPARATOR: 171,
		OP_CHECKSIG: 172,
		OP_CHECKSIGVERIFY: 173,
		OP_CHECKMULTISIG: 174,
		OP_CHECKMULTISIGVERIFY: 175,
		OP_NOP1: 176,
		OP_NOP2: 177,
		OP_CHECKLOCKTIMEVERIFY: 177,
		OP_NOP3: 178,
		OP_CHECKSEQUENCEVERIFY: 178,
		OP_NOP4: 179,
		OP_NOP5: 180,
		OP_NOP6: 181,
		OP_NOP7: 182,
		OP_NOP8: 183,
		OP_NOP9: 184,
		OP_NOP10: 185,
		OP_CHECKSIGADD: 186,
		OP_PUBKEYHASH: 253,
		OP_PUBKEY: 254,
		OP_INVALIDOPCODE: 255
	};
	exports.OPS = OPS;
	var REVERSE_OPS = {};
	exports.REVERSE_OPS = REVERSE_OPS;
	for (const op of Object.keys(OPS)) {
		const code = OPS[op];
		REVERSE_OPS[code] = op;
	}
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/push_data.js
var require_push_data = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decode = exports.encode = exports.encodingLength = void 0;
	var ops_1 = require_ops();
	/**
	* Calculates the encoding length of a number used for push data in Bitcoin transactions.
	* @param i The number to calculate the encoding length for.
	* @returns The encoding length of the number.
	*/
	function encodingLength(i) {
		return i < ops_1.OPS.OP_PUSHDATA1 ? 1 : i <= 255 ? 2 : i <= 65535 ? 3 : 5;
	}
	exports.encodingLength = encodingLength;
	/**
	* Encodes a number into a buffer using a variable-length encoding scheme.
	* The encoded buffer is written starting at the specified offset.
	* Returns the size of the encoded buffer.
	*
	* @param buffer - The buffer to write the encoded data into.
	* @param num - The number to encode.
	* @param offset - The offset at which to start writing the encoded buffer.
	* @returns The size of the encoded buffer.
	*/
	function encode(buffer, num, offset) {
		const size = encodingLength(num);
		if (size === 1) buffer.writeUInt8(num, offset);
		else if (size === 2) {
			buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA1, offset);
			buffer.writeUInt8(num, offset + 1);
		} else if (size === 3) {
			buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA2, offset);
			buffer.writeUInt16LE(num, offset + 1);
		} else {
			buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA4, offset);
			buffer.writeUInt32LE(num, offset + 1);
		}
		return size;
	}
	exports.encode = encode;
	/**
	* Decodes a buffer and returns information about the opcode, number, and size.
	* @param buffer - The buffer to decode.
	* @param offset - The offset within the buffer to start decoding.
	* @returns An object containing the opcode, number, and size, or null if decoding fails.
	*/
	function decode(buffer, offset) {
		const opcode = buffer.readUInt8(offset);
		let num;
		let size;
		if (opcode < ops_1.OPS.OP_PUSHDATA1) {
			num = opcode;
			size = 1;
		} else if (opcode === ops_1.OPS.OP_PUSHDATA1) {
			if (offset + 2 > buffer.length) return null;
			num = buffer.readUInt8(offset + 1);
			size = 2;
		} else if (opcode === ops_1.OPS.OP_PUSHDATA2) {
			if (offset + 3 > buffer.length) return null;
			num = buffer.readUInt16LE(offset + 1);
			size = 3;
		} else {
			if (offset + 5 > buffer.length) return null;
			if (opcode !== ops_1.OPS.OP_PUSHDATA4) throw new Error("Unexpected opcode");
			num = buffer.readUInt32LE(offset + 1);
			size = 5;
		}
		return {
			opcode,
			number: num,
			size
		};
	}
	exports.decode = decode;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/script_number.js
var require_script_number = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encode = exports.decode = void 0;
	/**
	* Decodes a script number from a buffer.
	*
	* @param buffer - The buffer containing the script number.
	* @param maxLength - The maximum length of the script number. Defaults to 4.
	* @param minimal - Whether the script number should be minimal. Defaults to true.
	* @returns The decoded script number.
	* @throws {TypeError} If the script number overflows the maximum length.
	* @throws {Error} If the script number is not minimally encoded when minimal is true.
	*/
	function decode(buffer, maxLength, minimal) {
		maxLength = maxLength || 4;
		minimal = minimal === void 0 ? true : minimal;
		const length = buffer.length;
		if (length === 0) return 0;
		if (length > maxLength) throw new TypeError("Script number overflow");
		if (minimal) {
			if ((buffer[length - 1] & 127) === 0) {
				if (length <= 1 || (buffer[length - 2] & 128) === 0) throw new Error("Non-minimally encoded script number");
			}
		}
		if (length === 5) {
			const a = buffer.readUInt32LE(0);
			const b = buffer.readUInt8(4);
			if (b & 128) return -((b & -129) * 4294967296 + a);
			return b * 4294967296 + a;
		}
		let result = 0;
		for (let i = 0; i < length; ++i) result |= buffer[i] << 8 * i;
		if (buffer[length - 1] & 128) return -(result & ~(128 << 8 * (length - 1)));
		return result;
	}
	exports.decode = decode;
	function scriptNumSize(i) {
		return i > 2147483647 ? 5 : i > 8388607 ? 4 : i > 32767 ? 3 : i > 127 ? 2 : i > 0 ? 1 : 0;
	}
	/**
	* Encodes a number into a Buffer using a specific format.
	*
	* @param _number - The number to encode.
	* @returns The encoded number as a Buffer.
	*/
	function encode(_number) {
		let value = Math.abs(_number);
		const size = scriptNumSize(value);
		const buffer = Buffer.allocUnsafe(size);
		const negative = _number < 0;
		for (let i = 0; i < size; ++i) {
			buffer.writeUInt8(value & 255, i);
			value >>= 8;
		}
		if (buffer[size - 1] & 128) buffer.writeUInt8(negative ? 128 : 0, size - 1);
		else if (negative) buffer[size - 1] |= 128;
		return buffer;
	}
	exports.encode = encode;
}));
//#endregion
//#region node_modules/typeforce/native.js
var require_native = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var types = {
		Array: function(value) {
			return value !== null && value !== void 0 && value.constructor === Array;
		},
		Boolean: function(value) {
			return typeof value === "boolean";
		},
		Function: function(value) {
			return typeof value === "function";
		},
		Nil: function(value) {
			return value === void 0 || value === null;
		},
		Number: function(value) {
			return typeof value === "number";
		},
		Object: function(value) {
			return typeof value === "object";
		},
		String: function(value) {
			return typeof value === "string";
		},
		"": function() {
			return true;
		}
	};
	types.Null = types.Nil;
	for (var typeName in types) types[typeName].toJSON = function(t) {
		return t;
	}.bind(null, typeName);
	module.exports = types;
}));
//#endregion
//#region node_modules/typeforce/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var native = require_native();
	function getTypeName(fn) {
		return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1];
	}
	function getValueTypeName(value) {
		return native.Nil(value) ? "" : getTypeName(value.constructor);
	}
	function getValue(value) {
		if (native.Function(value)) return "";
		if (native.String(value)) return JSON.stringify(value);
		if (value && native.Object(value)) return "";
		return value;
	}
	function captureStackTrace(e, t) {
		if (Error.captureStackTrace) Error.captureStackTrace(e, t);
	}
	function tfJSON(type) {
		if (native.Function(type)) return type.toJSON ? type.toJSON() : getTypeName(type);
		if (native.Array(type)) return "Array";
		if (type && native.Object(type)) return "Object";
		return type !== void 0 ? type : "";
	}
	function tfErrorString(type, value, valueTypeName) {
		var valueJson = getValue(value);
		return "Expected " + tfJSON(type) + ", got" + (valueTypeName !== "" ? " " + valueTypeName : "") + (valueJson !== "" ? " " + valueJson : "");
	}
	function TfTypeError(type, value, valueTypeName) {
		valueTypeName = valueTypeName || getValueTypeName(value);
		this.message = tfErrorString(type, value, valueTypeName);
		captureStackTrace(this, TfTypeError);
		this.__type = type;
		this.__value = value;
		this.__valueTypeName = valueTypeName;
	}
	TfTypeError.prototype = Object.create(Error.prototype);
	TfTypeError.prototype.constructor = TfTypeError;
	function tfPropertyErrorString(type, label, name, value, valueTypeName) {
		var description = "\" of type ";
		if (label === "key") description = "\" with key type ";
		return tfErrorString("property \"" + tfJSON(name) + description + tfJSON(type), value, valueTypeName);
	}
	function TfPropertyTypeError(type, property, label, value, valueTypeName) {
		if (type) {
			valueTypeName = valueTypeName || getValueTypeName(value);
			this.message = tfPropertyErrorString(type, label, property, value, valueTypeName);
		} else this.message = "Unexpected property \"" + property + "\"";
		captureStackTrace(this, TfTypeError);
		this.__label = label;
		this.__property = property;
		this.__type = type;
		this.__value = value;
		this.__valueTypeName = valueTypeName;
	}
	TfPropertyTypeError.prototype = Object.create(Error.prototype);
	TfPropertyTypeError.prototype.constructor = TfTypeError;
	function tfCustomError(expected, actual) {
		return new TfTypeError(expected, {}, actual);
	}
	function tfSubError(e, property, label) {
		if (e instanceof TfPropertyTypeError) {
			property = property + "." + e.__property;
			e = new TfPropertyTypeError(e.__type, property, e.__label, e.__value, e.__valueTypeName);
		} else if (e instanceof TfTypeError) e = new TfPropertyTypeError(e.__type, property, label, e.__value, e.__valueTypeName);
		captureStackTrace(e);
		return e;
	}
	module.exports = {
		TfTypeError,
		TfPropertyTypeError,
		tfCustomError,
		tfSubError,
		tfJSON,
		getValueTypeName
	};
}));
//#endregion
//#region node_modules/typeforce/extra.js
var require_extra = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var NATIVE = require_native();
	var ERRORS = require_errors();
	function _Buffer(value) {
		return Buffer.isBuffer(value);
	}
	function Hex(value) {
		return typeof value === "string" && /^([0-9a-f]{2})+$/i.test(value);
	}
	function _LengthN(type, length) {
		var name = type.toJSON();
		function Length(value) {
			if (!type(value)) return false;
			if (value.length === length) return true;
			throw ERRORS.tfCustomError(name + "(Length: " + length + ")", name + "(Length: " + value.length + ")");
		}
		Length.toJSON = function() {
			return name;
		};
		return Length;
	}
	var _ArrayN = _LengthN.bind(null, NATIVE.Array);
	var _BufferN = _LengthN.bind(null, _Buffer);
	var _HexN = _LengthN.bind(null, Hex);
	var _StringN = _LengthN.bind(null, NATIVE.String);
	function Range(a, b, f) {
		f = f || NATIVE.Number;
		function _range(value, strict) {
			return f(value, strict) && value > a && value < b;
		}
		_range.toJSON = function() {
			return `${f.toJSON()} between [${a}, ${b}]`;
		};
		return _range;
	}
	var INT53_MAX = Math.pow(2, 53) - 1;
	function Finite(value) {
		return typeof value === "number" && isFinite(value);
	}
	function Int8(value) {
		return value << 24 >> 24 === value;
	}
	function Int16(value) {
		return value << 16 >> 16 === value;
	}
	function Int32(value) {
		return (value | 0) === value;
	}
	function Int53(value) {
		return typeof value === "number" && value >= -INT53_MAX && value <= INT53_MAX && Math.floor(value) === value;
	}
	function UInt8(value) {
		return (value & 255) === value;
	}
	function UInt16(value) {
		return (value & 65535) === value;
	}
	function UInt32(value) {
		return value >>> 0 === value;
	}
	function UInt53(value) {
		return typeof value === "number" && value >= 0 && value <= INT53_MAX && Math.floor(value) === value;
	}
	var types = {
		ArrayN: _ArrayN,
		Buffer: _Buffer,
		BufferN: _BufferN,
		Finite,
		Hex,
		HexN: _HexN,
		Int8,
		Int16,
		Int32,
		Int53,
		Range,
		StringN: _StringN,
		UInt8,
		UInt16,
		UInt32,
		UInt53
	};
	for (var typeName in types) types[typeName].toJSON = function(t) {
		return t;
	}.bind(null, typeName);
	module.exports = types;
}));
//#endregion
//#region node_modules/typeforce/index.js
var require_typeforce = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ERRORS = require_errors();
	var NATIVE = require_native();
	var tfJSON = ERRORS.tfJSON;
	var TfTypeError = ERRORS.TfTypeError;
	var TfPropertyTypeError = ERRORS.TfPropertyTypeError;
	var tfSubError = ERRORS.tfSubError;
	var getValueTypeName = ERRORS.getValueTypeName;
	var TYPES = {
		arrayOf: function arrayOf(type, options) {
			type = compile(type);
			options = options || {};
			function _arrayOf(array, strict) {
				if (!NATIVE.Array(array)) return false;
				if (NATIVE.Nil(array)) return false;
				if (options.minLength !== void 0 && array.length < options.minLength) return false;
				if (options.maxLength !== void 0 && array.length > options.maxLength) return false;
				if (options.length !== void 0 && array.length !== options.length) return false;
				return array.every(function(value, i) {
					try {
						return typeforce(type, value, strict);
					} catch (e) {
						throw tfSubError(e, i);
					}
				});
			}
			_arrayOf.toJSON = function() {
				var str = "[" + tfJSON(type) + "]";
				if (options.length !== void 0) str += "{" + options.length + "}";
				else if (options.minLength !== void 0 || options.maxLength !== void 0) str += "{" + (options.minLength === void 0 ? 0 : options.minLength) + "," + (options.maxLength === void 0 ? Infinity : options.maxLength) + "}";
				return str;
			};
			return _arrayOf;
		},
		maybe: function maybe(type) {
			type = compile(type);
			function _maybe(value, strict) {
				return NATIVE.Nil(value) || type(value, strict, maybe);
			}
			_maybe.toJSON = function() {
				return "?" + tfJSON(type);
			};
			return _maybe;
		},
		map: function map(propertyType, propertyKeyType) {
			propertyType = compile(propertyType);
			if (propertyKeyType) propertyKeyType = compile(propertyKeyType);
			function _map(value, strict) {
				if (!NATIVE.Object(value)) return false;
				if (NATIVE.Nil(value)) return false;
				for (var propertyName in value) {
					try {
						if (propertyKeyType) typeforce(propertyKeyType, propertyName, strict);
					} catch (e) {
						throw tfSubError(e, propertyName, "key");
					}
					try {
						var propertyValue = value[propertyName];
						typeforce(propertyType, propertyValue, strict);
					} catch (e) {
						throw tfSubError(e, propertyName);
					}
				}
				return true;
			}
			if (propertyKeyType) _map.toJSON = function() {
				return "{" + tfJSON(propertyKeyType) + ": " + tfJSON(propertyType) + "}";
			};
			else _map.toJSON = function() {
				return "{" + tfJSON(propertyType) + "}";
			};
			return _map;
		},
		object: function object(uncompiled) {
			var type = {};
			for (var typePropertyName in uncompiled) type[typePropertyName] = compile(uncompiled[typePropertyName]);
			function _object(value, strict) {
				if (!NATIVE.Object(value)) return false;
				if (NATIVE.Nil(value)) return false;
				var propertyName;
				try {
					for (propertyName in type) {
						var propertyType = type[propertyName];
						var propertyValue = value[propertyName];
						typeforce(propertyType, propertyValue, strict);
					}
				} catch (e) {
					throw tfSubError(e, propertyName);
				}
				if (strict) for (propertyName in value) {
					if (type[propertyName]) continue;
					throw new TfPropertyTypeError(void 0, propertyName);
				}
				return true;
			}
			_object.toJSON = function() {
				return tfJSON(type);
			};
			return _object;
		},
		anyOf: function anyOf() {
			var types = [].slice.call(arguments).map(compile);
			function _anyOf(value, strict) {
				return types.some(function(type) {
					try {
						return typeforce(type, value, strict);
					} catch (e) {
						return false;
					}
				});
			}
			_anyOf.toJSON = function() {
				return types.map(tfJSON).join("|");
			};
			return _anyOf;
		},
		allOf: function allOf() {
			var types = [].slice.call(arguments).map(compile);
			function _allOf(value, strict) {
				return types.every(function(type) {
					try {
						return typeforce(type, value, strict);
					} catch (e) {
						return false;
					}
				});
			}
			_allOf.toJSON = function() {
				return types.map(tfJSON).join(" & ");
			};
			return _allOf;
		},
		quacksLike: function quacksLike(type) {
			function _quacksLike(value) {
				return type === getValueTypeName(value);
			}
			_quacksLike.toJSON = function() {
				return type;
			};
			return _quacksLike;
		},
		tuple: function tuple() {
			var types = [].slice.call(arguments).map(compile);
			function _tuple(values, strict) {
				if (NATIVE.Nil(values)) return false;
				if (NATIVE.Nil(values.length)) return false;
				if (strict && values.length !== types.length) return false;
				return types.every(function(type, i) {
					try {
						return typeforce(type, values[i], strict);
					} catch (e) {
						throw tfSubError(e, i);
					}
				});
			}
			_tuple.toJSON = function() {
				return "(" + types.map(tfJSON).join(", ") + ")";
			};
			return _tuple;
		},
		value: function value(expected) {
			function _value(actual) {
				return actual === expected;
			}
			_value.toJSON = function() {
				return expected;
			};
			return _value;
		}
	};
	TYPES.oneOf = TYPES.anyOf;
	function compile(type) {
		if (NATIVE.String(type)) {
			if (type[0] === "?") return TYPES.maybe(type.slice(1));
			return NATIVE[type] || TYPES.quacksLike(type);
		} else if (type && NATIVE.Object(type)) {
			if (NATIVE.Array(type)) {
				if (type.length !== 1) throw new TypeError("Expected compile() parameter of type Array of length 1");
				return TYPES.arrayOf(type[0]);
			}
			return TYPES.object(type);
		} else if (NATIVE.Function(type)) return type;
		return TYPES.value(type);
	}
	function typeforce(type, value, strict, surrogate) {
		if (NATIVE.Function(type)) {
			if (type(value, strict)) return true;
			throw new TfTypeError(surrogate || type, value);
		}
		return typeforce(compile(type), value, strict);
	}
	for (var typeName in NATIVE) typeforce[typeName] = NATIVE[typeName];
	for (typeName in TYPES) typeforce[typeName] = TYPES[typeName];
	var EXTRA = require_extra();
	for (typeName in EXTRA) typeforce[typeName] = EXTRA[typeName];
	typeforce.compile = compile;
	typeforce.TfTypeError = TfTypeError;
	typeforce.TfPropertyTypeError = TfPropertyTypeError;
	module.exports = typeforce;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.oneOf = exports.Null = exports.BufferN = exports.Function = exports.UInt32 = exports.UInt8 = exports.tuple = exports.maybe = exports.Hex = exports.Buffer = exports.String = exports.Boolean = exports.Array = exports.Number = exports.Hash256bit = exports.Hash160bit = exports.Buffer256bit = exports.isTaptree = exports.isTapleaf = exports.TAPLEAF_VERSION_MASK = exports.Satoshi = exports.isPoint = exports.stacksEqual = exports.typeforce = void 0;
	var buffer_1$2 = __require("buffer");
	exports.typeforce = require_typeforce();
	var ZERO32 = buffer_1$2.Buffer.alloc(32, 0);
	var EC_P = buffer_1$2.Buffer.from("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f", "hex");
	/**
	* Checks if two arrays of Buffers are equal.
	* @param a - The first array of Buffers.
	* @param b - The second array of Buffers.
	* @returns True if the arrays are equal, false otherwise.
	*/
	function stacksEqual(a, b) {
		if (a.length !== b.length) return false;
		return a.every((x, i) => {
			return x.equals(b[i]);
		});
	}
	exports.stacksEqual = stacksEqual;
	/**
	* Checks if the given value is a valid elliptic curve point.
	* @param p - The value to check.
	* @returns True if the value is a valid elliptic curve point, false otherwise.
	*/
	function isPoint(p) {
		if (!buffer_1$2.Buffer.isBuffer(p)) return false;
		if (p.length < 33) return false;
		const t = p[0];
		const x = p.slice(1, 33);
		if (x.compare(ZERO32) === 0) return false;
		if (x.compare(EC_P) >= 0) return false;
		if ((t === 2 || t === 3) && p.length === 33) return true;
		const y = p.slice(33);
		if (y.compare(ZERO32) === 0) return false;
		if (y.compare(EC_P) >= 0) return false;
		if (t === 4 && p.length === 65) return true;
		return false;
	}
	exports.isPoint = isPoint;
	var SATOSHI_MAX = 0x775f05a074000;
	function Satoshi(value) {
		return exports.typeforce.UInt53(value) && value <= SATOSHI_MAX;
	}
	exports.Satoshi = Satoshi;
	exports.TAPLEAF_VERSION_MASK = 254;
	function isTapleaf(o) {
		if (!o || !("output" in o)) return false;
		if (!buffer_1$2.Buffer.isBuffer(o.output)) return false;
		if (o.version !== void 0) return (o.version & exports.TAPLEAF_VERSION_MASK) === o.version;
		return true;
	}
	exports.isTapleaf = isTapleaf;
	function isTaptree(scriptTree) {
		if (!(0, exports.Array)(scriptTree)) return isTapleaf(scriptTree);
		if (scriptTree.length !== 2) return false;
		return scriptTree.every((t) => isTaptree(t));
	}
	exports.isTaptree = isTaptree;
	exports.Buffer256bit = exports.typeforce.BufferN(32);
	exports.Hash160bit = exports.typeforce.BufferN(20);
	exports.Hash256bit = exports.typeforce.BufferN(32);
	exports.Number = exports.typeforce.Number;
	exports.Array = exports.typeforce.Array;
	exports.Boolean = exports.typeforce.Boolean;
	exports.String = exports.typeforce.String;
	exports.Buffer = exports.typeforce.Buffer;
	exports.Hex = exports.typeforce.Hex;
	exports.maybe = exports.typeforce.maybe;
	exports.tuple = exports.typeforce.tuple;
	exports.UInt8 = exports.typeforce.UInt8;
	exports.UInt32 = exports.typeforce.UInt32;
	exports.Function = exports.typeforce.Function;
	exports.BufferN = exports.typeforce.BufferN;
	exports.Null = exports.typeforce.Null;
	exports.oneOf = exports.typeforce.oneOf;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/script_signature.js
var require_script_signature = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encode = exports.decode = void 0;
	var bip66 = require_bip66();
	var script_1 = require_script();
	var types = require_types();
	var { typeforce } = types;
	var ZERO = Buffer.alloc(1, 0);
	/**
	* Converts a buffer to a DER-encoded buffer.
	* @param x - The buffer to be converted.
	* @returns The DER-encoded buffer.
	*/
	function toDER(x) {
		let i = 0;
		while (x[i] === 0) ++i;
		if (i === x.length) return ZERO;
		x = x.slice(i);
		if (x[0] & 128) return Buffer.concat([ZERO, x], 1 + x.length);
		return x;
	}
	/**
	* Converts a DER-encoded signature to a buffer.
	* If the first byte of the input buffer is 0x00, it is skipped.
	* The resulting buffer is 32 bytes long, filled with zeros if necessary.
	* @param x - The DER-encoded signature.
	* @returns The converted buffer.
	*/
	function fromDER(x) {
		if (x[0] === 0) x = x.slice(1);
		const buffer = Buffer.alloc(32, 0);
		const bstart = Math.max(0, 32 - x.length);
		x.copy(buffer, bstart);
		return buffer;
	}
	/**
	* Decodes a buffer into a ScriptSignature object.
	* @param buffer - The buffer to decode.
	* @returns The decoded ScriptSignature object.
	* @throws Error if the hashType is invalid.
	*/
	function decode(buffer) {
		const hashType = buffer.readUInt8(buffer.length - 1);
		if (!(0, script_1.isDefinedHashType)(hashType)) throw new Error("Invalid hashType " + hashType);
		const decoded = bip66.decode(buffer.slice(0, -1));
		const r = fromDER(decoded.r);
		const s = fromDER(decoded.s);
		return {
			signature: Buffer.concat([r, s], 64),
			hashType
		};
	}
	exports.decode = decode;
	/**
	* Encodes a signature and hash type into a buffer.
	* @param signature - The signature to encode.
	* @param hashType - The hash type to encode.
	* @returns The encoded buffer.
	* @throws Error if the hashType is invalid.
	*/
	function encode(signature, hashType) {
		typeforce({
			signature: types.BufferN(64),
			hashType: types.UInt8
		}, {
			signature,
			hashType
		});
		if (!(0, script_1.isDefinedHashType)(hashType)) throw new Error("Invalid hashType " + hashType);
		const hashTypeBuffer = Buffer.allocUnsafe(1);
		hashTypeBuffer.writeUInt8(hashType, 0);
		const r = toDER(signature.slice(0, 32));
		const s = toDER(signature.slice(32, 64));
		return Buffer.concat([bip66.encode(r, s), hashTypeBuffer]);
	}
	exports.encode = encode;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/script.js
var require_script = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.signature = exports.number = exports.isCanonicalScriptSignature = exports.isDefinedHashType = exports.isCanonicalPubKey = exports.toStack = exports.fromASM = exports.toASM = exports.decompile = exports.compile = exports.countNonPushOnlyOPs = exports.isPushOnly = exports.OPS = void 0;
	/**
	* Script tools, including decompile, compile, toASM, fromASM, toStack, isCanonicalPubKey, isCanonicalScriptSignature
	* @packageDocumentation
	*/
	var bip66 = require_bip66();
	var ops_1 = require_ops();
	Object.defineProperty(exports, "OPS", {
		enumerable: true,
		get: function() {
			return ops_1.OPS;
		}
	});
	var pushdata = require_push_data();
	var scriptNumber = require_script_number();
	var scriptSignature = require_script_signature();
	var types = require_types();
	var { typeforce } = types;
	var OP_INT_BASE = ops_1.OPS.OP_RESERVED;
	function isOPInt(value) {
		return types.Number(value) && (value === ops_1.OPS.OP_0 || value >= ops_1.OPS.OP_1 && value <= ops_1.OPS.OP_16 || value === ops_1.OPS.OP_1NEGATE);
	}
	function isPushOnlyChunk(value) {
		return types.Buffer(value) || isOPInt(value);
	}
	function isPushOnly(value) {
		return types.Array(value) && value.every(isPushOnlyChunk);
	}
	exports.isPushOnly = isPushOnly;
	function countNonPushOnlyOPs(value) {
		return value.length - value.filter(isPushOnlyChunk).length;
	}
	exports.countNonPushOnlyOPs = countNonPushOnlyOPs;
	function asMinimalOP(buffer) {
		if (buffer.length === 0) return ops_1.OPS.OP_0;
		if (buffer.length !== 1) return;
		if (buffer[0] >= 1 && buffer[0] <= 16) return OP_INT_BASE + buffer[0];
		if (buffer[0] === 129) return ops_1.OPS.OP_1NEGATE;
	}
	function chunksIsBuffer(buf) {
		return Buffer.isBuffer(buf);
	}
	function chunksIsArray(buf) {
		return types.Array(buf);
	}
	function singleChunkIsBuffer(buf) {
		return Buffer.isBuffer(buf);
	}
	/**
	* Compiles an array of chunks into a Buffer.
	*
	* @param chunks - The array of chunks to compile.
	* @returns The compiled Buffer.
	* @throws Error if the compilation fails.
	*/
	function compile(chunks) {
		if (chunksIsBuffer(chunks)) return chunks;
		typeforce(types.Array, chunks);
		const bufferSize = chunks.reduce((accum, chunk) => {
			if (singleChunkIsBuffer(chunk)) {
				if (chunk.length === 1 && asMinimalOP(chunk) !== void 0) return accum + 1;
				return accum + pushdata.encodingLength(chunk.length) + chunk.length;
			}
			return accum + 1;
		}, 0);
		const buffer = Buffer.allocUnsafe(bufferSize);
		let offset = 0;
		chunks.forEach((chunk) => {
			if (singleChunkIsBuffer(chunk)) {
				const opcode = asMinimalOP(chunk);
				if (opcode !== void 0) {
					buffer.writeUInt8(opcode, offset);
					offset += 1;
					return;
				}
				offset += pushdata.encode(buffer, chunk.length, offset);
				chunk.copy(buffer, offset);
				offset += chunk.length;
			} else {
				buffer.writeUInt8(chunk, offset);
				offset += 1;
			}
		});
		if (offset !== buffer.length) throw new Error("Could not decode chunks");
		return buffer;
	}
	exports.compile = compile;
	function decompile(buffer) {
		if (chunksIsArray(buffer)) return buffer;
		typeforce(types.Buffer, buffer);
		const chunks = [];
		let i = 0;
		while (i < buffer.length) {
			const opcode = buffer[i];
			if (opcode > ops_1.OPS.OP_0 && opcode <= ops_1.OPS.OP_PUSHDATA4) {
				const d = pushdata.decode(buffer, i);
				if (d === null) return null;
				i += d.size;
				if (i + d.number > buffer.length) return null;
				const data = buffer.slice(i, i + d.number);
				i += d.number;
				const op = asMinimalOP(data);
				if (op !== void 0) chunks.push(op);
				else chunks.push(data);
			} else {
				chunks.push(opcode);
				i += 1;
			}
		}
		return chunks;
	}
	exports.decompile = decompile;
	/**
	* Converts the given chunks into an ASM (Assembly) string representation.
	* If the chunks parameter is a Buffer, it will be decompiled into a Stack before conversion.
	* @param chunks - The chunks to convert into ASM.
	* @returns The ASM string representation of the chunks.
	*/
	function toASM(chunks) {
		if (chunksIsBuffer(chunks)) chunks = decompile(chunks);
		if (!chunks) throw new Error("Could not convert invalid chunks to ASM");
		return chunks.map((chunk) => {
			if (singleChunkIsBuffer(chunk)) {
				const op = asMinimalOP(chunk);
				if (op === void 0) return chunk.toString("hex");
				chunk = op;
			}
			return ops_1.REVERSE_OPS[chunk];
		}).join(" ");
	}
	exports.toASM = toASM;
	/**
	* Converts an ASM string to a Buffer.
	* @param asm The ASM string to convert.
	* @returns The converted Buffer.
	*/
	function fromASM(asm) {
		typeforce(types.String, asm);
		return compile(asm.split(" ").map((chunkStr) => {
			if (ops_1.OPS[chunkStr] !== void 0) return ops_1.OPS[chunkStr];
			typeforce(types.Hex, chunkStr);
			return Buffer.from(chunkStr, "hex");
		}));
	}
	exports.fromASM = fromASM;
	/**
	* Converts the given chunks into a stack of buffers.
	*
	* @param chunks - The chunks to convert.
	* @returns The stack of buffers.
	*/
	function toStack(chunks) {
		chunks = decompile(chunks);
		typeforce(isPushOnly, chunks);
		return chunks.map((op) => {
			if (singleChunkIsBuffer(op)) return op;
			if (op === ops_1.OPS.OP_0) return Buffer.allocUnsafe(0);
			return scriptNumber.encode(op - OP_INT_BASE);
		});
	}
	exports.toStack = toStack;
	function isCanonicalPubKey(buffer) {
		return types.isPoint(buffer);
	}
	exports.isCanonicalPubKey = isCanonicalPubKey;
	function isDefinedHashType(hashType) {
		const hashTypeMod = hashType & -129;
		return hashTypeMod > 0 && hashTypeMod < 4;
	}
	exports.isDefinedHashType = isDefinedHashType;
	function isCanonicalScriptSignature(buffer) {
		if (!Buffer.isBuffer(buffer)) return false;
		if (!isDefinedHashType(buffer[buffer.length - 1])) return false;
		return bip66.check(buffer.slice(0, -1));
	}
	exports.isCanonicalScriptSignature = isCanonicalScriptSignature;
	exports.number = scriptNumber;
	exports.signature = scriptSignature;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/lazy.js
var require_lazy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.value = exports.prop = void 0;
	function prop(object, name, f) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: true,
			get() {
				const _value = f.call(this);
				this[name] = _value;
				return _value;
			},
			set(_value) {
				Object.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					value: _value,
					writable: true
				});
			}
		});
	}
	exports.prop = prop;
	function value(f) {
		let _value;
		return () => {
			if (_value !== void 0) return _value;
			_value = f();
			return _value;
		};
	}
	exports.value = value;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/embed.js
var require_embed = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2data = void 0;
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var lazy = require_lazy();
	var OPS = bscript.OPS;
	/**
	* Embeds data in a Bitcoin payment.
	* @param a - The payment object.
	* @param opts - Optional payment options.
	* @returns The modified payment object.
	* @throws {TypeError} If there is not enough data or if the output is invalid.
	*/
	function p2data(a, opts) {
		if (!a.data && !a.output) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		(0, types_1.typeforce)({
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
			data: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer))
		}, a);
		const o = {
			name: "embed",
			network: a.network || networks_1.bitcoin
		};
		lazy.prop(o, "output", () => {
			if (!a.data) return;
			return bscript.compile([OPS.OP_RETURN].concat(a.data));
		});
		lazy.prop(o, "data", () => {
			if (!a.output) return;
			return bscript.decompile(a.output).slice(1);
		});
		if (opts.validate) {
			if (a.output) {
				const chunks = bscript.decompile(a.output);
				if (chunks[0] !== OPS.OP_RETURN) throw new TypeError("Output is invalid");
				if (!chunks.slice(1).every(types_1.typeforce.Buffer)) throw new TypeError("Output is invalid");
				if (a.data && !(0, types_1.stacksEqual)(a.data, o.data)) throw new TypeError("Data mismatch");
			}
		}
		return Object.assign(o, a);
	}
	exports.p2data = p2data;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/p2ms.js
var require_p2ms = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2ms = void 0;
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var lazy = require_lazy();
	var OPS = bscript.OPS;
	var OP_INT_BASE = OPS.OP_RESERVED;
	/**
	* Represents a function that creates a Pay-to-Multisig (P2MS) payment object.
	* @param a - The payment object.
	* @param opts - Optional payment options.
	* @returns The created payment object.
	* @throws {TypeError} If the provided data is not valid.
	*/
	function p2ms(a, opts) {
		if (!a.input && !a.output && !(a.pubkeys && a.m !== void 0) && !a.signatures) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		function isAcceptableSignature(x) {
			return bscript.isCanonicalScriptSignature(x) || (opts.allowIncomplete && x === OPS.OP_0) !== void 0;
		}
		(0, types_1.typeforce)({
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			m: types_1.typeforce.maybe(types_1.typeforce.Number),
			n: types_1.typeforce.maybe(types_1.typeforce.Number),
			output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
			pubkeys: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.isPoint)),
			signatures: types_1.typeforce.maybe(types_1.typeforce.arrayOf(isAcceptableSignature)),
			input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
		}, a);
		const o = { network: a.network || networks_1.bitcoin };
		let chunks = [];
		let decoded = false;
		function decode(output) {
			if (decoded) return;
			decoded = true;
			chunks = bscript.decompile(output);
			o.m = chunks[0] - OP_INT_BASE;
			o.n = chunks[chunks.length - 2] - OP_INT_BASE;
			o.pubkeys = chunks.slice(1, -2);
		}
		lazy.prop(o, "output", () => {
			if (!a.m) return;
			if (!o.n) return;
			if (!a.pubkeys) return;
			return bscript.compile([].concat(OP_INT_BASE + a.m, a.pubkeys, OP_INT_BASE + o.n, OPS.OP_CHECKMULTISIG));
		});
		lazy.prop(o, "m", () => {
			if (!o.output) return;
			decode(o.output);
			return o.m;
		});
		lazy.prop(o, "n", () => {
			if (!o.pubkeys) return;
			return o.pubkeys.length;
		});
		lazy.prop(o, "pubkeys", () => {
			if (!a.output) return;
			decode(a.output);
			return o.pubkeys;
		});
		lazy.prop(o, "signatures", () => {
			if (!a.input) return;
			return bscript.decompile(a.input).slice(1);
		});
		lazy.prop(o, "input", () => {
			if (!a.signatures) return;
			return bscript.compile([OPS.OP_0].concat(a.signatures));
		});
		lazy.prop(o, "witness", () => {
			if (!o.input) return;
			return [];
		});
		lazy.prop(o, "name", () => {
			if (!o.m || !o.n) return;
			return `p2ms(${o.m} of ${o.n})`;
		});
		if (opts.validate) {
			if (a.output) {
				decode(a.output);
				if (!types_1.typeforce.Number(chunks[0])) throw new TypeError("Output is invalid");
				if (!types_1.typeforce.Number(chunks[chunks.length - 2])) throw new TypeError("Output is invalid");
				if (chunks[chunks.length - 1] !== OPS.OP_CHECKMULTISIG) throw new TypeError("Output is invalid");
				if (o.m <= 0 || o.n > 16 || o.m > o.n || o.n !== chunks.length - 3) throw new TypeError("Output is invalid");
				if (!o.pubkeys.every((x) => (0, types_1.isPoint)(x))) throw new TypeError("Output is invalid");
				if (a.m !== void 0 && a.m !== o.m) throw new TypeError("m mismatch");
				if (a.n !== void 0 && a.n !== o.n) throw new TypeError("n mismatch");
				if (a.pubkeys && !(0, types_1.stacksEqual)(a.pubkeys, o.pubkeys)) throw new TypeError("Pubkeys mismatch");
			}
			if (a.pubkeys) {
				if (a.n !== void 0 && a.n !== a.pubkeys.length) throw new TypeError("Pubkey count mismatch");
				o.n = a.pubkeys.length;
				if (o.n < o.m) throw new TypeError("Pubkey count cannot be less than m");
			}
			if (a.signatures) {
				if (a.signatures.length < o.m) throw new TypeError("Not enough signatures provided");
				if (a.signatures.length > o.m) throw new TypeError("Too many signatures provided");
			}
			if (a.input) {
				if (a.input[0] !== OPS.OP_0) throw new TypeError("Input is invalid");
				if (o.signatures.length === 0 || !o.signatures.every(isAcceptableSignature)) throw new TypeError("Input has invalid signature(s)");
				if (a.signatures && !(0, types_1.stacksEqual)(a.signatures, o.signatures)) throw new TypeError("Signature mismatch");
				if (a.m !== void 0 && a.m !== a.signatures.length) throw new TypeError("Signature count mismatch");
			}
		}
		return Object.assign(o, a);
	}
	exports.p2ms = p2ms;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/p2pk.js
var require_p2pk = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2pk = void 0;
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var lazy = require_lazy();
	var OPS = bscript.OPS;
	/**
	* Creates a pay-to-public-key (P2PK) payment object.
	*
	* @param a - The payment object containing the necessary data.
	* @param opts - Optional payment options.
	* @returns The P2PK payment object.
	* @throws {TypeError} If the required data is not provided or if the data is invalid.
	*/
	function p2pk(a, opts) {
		if (!a.input && !a.output && !a.pubkey && !a.input && !a.signature) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		(0, types_1.typeforce)({
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
			pubkey: types_1.typeforce.maybe(types_1.isPoint),
			signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
			input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
		}, a);
		const _chunks = lazy.value(() => {
			return bscript.decompile(a.input);
		});
		const o = {
			name: "p2pk",
			network: a.network || networks_1.bitcoin
		};
		lazy.prop(o, "output", () => {
			if (!a.pubkey) return;
			return bscript.compile([a.pubkey, OPS.OP_CHECKSIG]);
		});
		lazy.prop(o, "pubkey", () => {
			if (!a.output) return;
			return a.output.slice(1, -1);
		});
		lazy.prop(o, "signature", () => {
			if (!a.input) return;
			return _chunks()[0];
		});
		lazy.prop(o, "input", () => {
			if (!a.signature) return;
			return bscript.compile([a.signature]);
		});
		lazy.prop(o, "witness", () => {
			if (!o.input) return;
			return [];
		});
		if (opts.validate) {
			if (a.output) {
				if (a.output[a.output.length - 1] !== OPS.OP_CHECKSIG) throw new TypeError("Output is invalid");
				if (!(0, types_1.isPoint)(o.pubkey)) throw new TypeError("Output pubkey is invalid");
				if (a.pubkey && !a.pubkey.equals(o.pubkey)) throw new TypeError("Pubkey mismatch");
			}
			if (a.signature) {
				if (a.input && !a.input.equals(o.input)) throw new TypeError("Signature mismatch");
			}
			if (a.input) {
				if (_chunks().length !== 1) throw new TypeError("Input is invalid");
				if (!bscript.isCanonicalScriptSignature(o.signature)) throw new TypeError("Input has invalid signature");
			}
		}
		return Object.assign(o, a);
	}
	exports.p2pk = p2pk;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/crypto.js
var require_crypto = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.taggedHash = exports.TAGGED_HASH_PREFIXES = exports.TAGS = exports.hash256 = exports.hash160 = exports.sha256 = exports.sha1 = exports.ripemd160 = void 0;
	/**
	* A module for hashing functions.
	* include ripemd160、sha1、sha256、hash160、hash256、taggedHash
	*
	* @packageDocumentation
	*/
	var ripemd160_1 = require_ripemd160();
	var sha1_1 = require_sha1();
	var sha256_1 = require_sha256$1();
	function ripemd160(buffer) {
		return Buffer.from((0, ripemd160_1.ripemd160)(Uint8Array.from(buffer)));
	}
	exports.ripemd160 = ripemd160;
	function sha1(buffer) {
		return Buffer.from((0, sha1_1.sha1)(Uint8Array.from(buffer)));
	}
	exports.sha1 = sha1;
	function sha256(buffer) {
		return Buffer.from((0, sha256_1.sha256)(Uint8Array.from(buffer)));
	}
	exports.sha256 = sha256;
	function hash160(buffer) {
		return Buffer.from((0, ripemd160_1.ripemd160)((0, sha256_1.sha256)(Uint8Array.from(buffer))));
	}
	exports.hash160 = hash160;
	function hash256(buffer) {
		return Buffer.from((0, sha256_1.sha256)((0, sha256_1.sha256)(Uint8Array.from(buffer))));
	}
	exports.hash256 = hash256;
	exports.TAGS = [
		"BIP0340/challenge",
		"BIP0340/aux",
		"BIP0340/nonce",
		"TapLeaf",
		"TapBranch",
		"TapSighash",
		"TapTweak",
		"KeyAgg list",
		"KeyAgg coefficient"
	];
	/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
	/**
	* Defines the tagged hash prefixes used in the crypto module.
	*/
	exports.TAGGED_HASH_PREFIXES = {
		"BIP0340/challenge": Buffer.from([
			123,
			181,
			45,
			122,
			159,
			239,
			88,
			50,
			62,
			177,
			191,
			122,
			64,
			125,
			179,
			130,
			210,
			243,
			242,
			216,
			27,
			177,
			34,
			79,
			73,
			254,
			81,
			143,
			109,
			72,
			211,
			124,
			123,
			181,
			45,
			122,
			159,
			239,
			88,
			50,
			62,
			177,
			191,
			122,
			64,
			125,
			179,
			130,
			210,
			243,
			242,
			216,
			27,
			177,
			34,
			79,
			73,
			254,
			81,
			143,
			109,
			72,
			211,
			124
		]),
		"BIP0340/aux": Buffer.from([
			241,
			239,
			78,
			94,
			192,
			99,
			202,
			218,
			109,
			148,
			202,
			250,
			157,
			152,
			126,
			160,
			105,
			38,
			88,
			57,
			236,
			193,
			31,
			151,
			45,
			119,
			165,
			46,
			216,
			193,
			204,
			144,
			241,
			239,
			78,
			94,
			192,
			99,
			202,
			218,
			109,
			148,
			202,
			250,
			157,
			152,
			126,
			160,
			105,
			38,
			88,
			57,
			236,
			193,
			31,
			151,
			45,
			119,
			165,
			46,
			216,
			193,
			204,
			144
		]),
		"BIP0340/nonce": Buffer.from([
			7,
			73,
			119,
			52,
			167,
			155,
			203,
			53,
			91,
			155,
			140,
			125,
			3,
			79,
			18,
			28,
			244,
			52,
			215,
			62,
			247,
			45,
			218,
			25,
			135,
			0,
			97,
			251,
			82,
			191,
			235,
			47,
			7,
			73,
			119,
			52,
			167,
			155,
			203,
			53,
			91,
			155,
			140,
			125,
			3,
			79,
			18,
			28,
			244,
			52,
			215,
			62,
			247,
			45,
			218,
			25,
			135,
			0,
			97,
			251,
			82,
			191,
			235,
			47
		]),
		TapLeaf: Buffer.from([
			174,
			234,
			143,
			220,
			66,
			8,
			152,
			49,
			5,
			115,
			75,
			88,
			8,
			29,
			30,
			38,
			56,
			211,
			95,
			28,
			181,
			64,
			8,
			212,
			211,
			87,
			202,
			3,
			190,
			120,
			233,
			238,
			174,
			234,
			143,
			220,
			66,
			8,
			152,
			49,
			5,
			115,
			75,
			88,
			8,
			29,
			30,
			38,
			56,
			211,
			95,
			28,
			181,
			64,
			8,
			212,
			211,
			87,
			202,
			3,
			190,
			120,
			233,
			238
		]),
		TapBranch: Buffer.from([
			25,
			65,
			161,
			242,
			229,
			110,
			185,
			95,
			162,
			169,
			241,
			148,
			190,
			92,
			1,
			247,
			33,
			111,
			51,
			237,
			130,
			176,
			145,
			70,
			52,
			144,
			208,
			91,
			245,
			22,
			160,
			21,
			25,
			65,
			161,
			242,
			229,
			110,
			185,
			95,
			162,
			169,
			241,
			148,
			190,
			92,
			1,
			247,
			33,
			111,
			51,
			237,
			130,
			176,
			145,
			70,
			52,
			144,
			208,
			91,
			245,
			22,
			160,
			21
		]),
		TapSighash: Buffer.from([
			244,
			10,
			72,
			223,
			75,
			42,
			112,
			200,
			180,
			146,
			75,
			242,
			101,
			70,
			97,
			237,
			61,
			149,
			253,
			102,
			163,
			19,
			235,
			135,
			35,
			117,
			151,
			198,
			40,
			228,
			160,
			49,
			244,
			10,
			72,
			223,
			75,
			42,
			112,
			200,
			180,
			146,
			75,
			242,
			101,
			70,
			97,
			237,
			61,
			149,
			253,
			102,
			163,
			19,
			235,
			135,
			35,
			117,
			151,
			198,
			40,
			228,
			160,
			49
		]),
		TapTweak: Buffer.from([
			232,
			15,
			225,
			99,
			156,
			156,
			160,
			80,
			227,
			175,
			27,
			57,
			193,
			67,
			198,
			62,
			66,
			156,
			188,
			235,
			21,
			217,
			64,
			251,
			181,
			197,
			161,
			244,
			175,
			87,
			197,
			233,
			232,
			15,
			225,
			99,
			156,
			156,
			160,
			80,
			227,
			175,
			27,
			57,
			193,
			67,
			198,
			62,
			66,
			156,
			188,
			235,
			21,
			217,
			64,
			251,
			181,
			197,
			161,
			244,
			175,
			87,
			197,
			233
		]),
		"KeyAgg list": Buffer.from([
			72,
			28,
			151,
			28,
			60,
			11,
			70,
			215,
			240,
			178,
			117,
			174,
			89,
			141,
			78,
			44,
			126,
			215,
			49,
			156,
			89,
			74,
			92,
			110,
			199,
			158,
			160,
			212,
			153,
			2,
			148,
			240,
			72,
			28,
			151,
			28,
			60,
			11,
			70,
			215,
			240,
			178,
			117,
			174,
			89,
			141,
			78,
			44,
			126,
			215,
			49,
			156,
			89,
			74,
			92,
			110,
			199,
			158,
			160,
			212,
			153,
			2,
			148,
			240
		]),
		"KeyAgg coefficient": Buffer.from([
			191,
			201,
			4,
			3,
			77,
			28,
			136,
			232,
			200,
			14,
			34,
			229,
			61,
			36,
			86,
			109,
			100,
			130,
			78,
			214,
			66,
			114,
			129,
			192,
			145,
			0,
			249,
			77,
			205,
			82,
			201,
			129,
			191,
			201,
			4,
			3,
			77,
			28,
			136,
			232,
			200,
			14,
			34,
			229,
			61,
			36,
			86,
			109,
			100,
			130,
			78,
			214,
			66,
			114,
			129,
			192,
			145,
			0,
			249,
			77,
			205,
			82,
			201,
			129
		])
	};
	function taggedHash(prefix, data) {
		return sha256(Buffer.concat([exports.TAGGED_HASH_PREFIXES[prefix], data]));
	}
	exports.taggedHash = taggedHash;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/p2pkh.js
var require_p2pkh = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2pkh = void 0;
	var bcrypto = require_crypto();
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var lazy = require_lazy();
	var bs58check = require_bs58check();
	var OPS = bscript.OPS;
	/**
	* Creates a Pay-to-Public-Key-Hash (P2PKH) payment object.
	*
	* @param a - The payment object containing the necessary data.
	* @param opts - Optional payment options.
	* @returns The P2PKH payment object.
	* @throws {TypeError} If the required data is not provided or if the data is invalid.
	*/
	function p2pkh(a, opts) {
		if (!a.address && !a.hash && !a.output && !a.pubkey && !a.input) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		(0, types_1.typeforce)({
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			address: types_1.typeforce.maybe(types_1.typeforce.String),
			hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
			output: types_1.typeforce.maybe(types_1.typeforce.BufferN(25)),
			pubkey: types_1.typeforce.maybe(types_1.isPoint),
			signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
			input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
		}, a);
		const _address = lazy.value(() => {
			const payload = Buffer.from(bs58check.decode(a.address));
			return {
				version: payload.readUInt8(0),
				hash: payload.slice(1)
			};
		});
		const _chunks = lazy.value(() => {
			return bscript.decompile(a.input);
		});
		const network = a.network || networks_1.bitcoin;
		const o = {
			name: "p2pkh",
			network
		};
		lazy.prop(o, "address", () => {
			if (!o.hash) return;
			const payload = Buffer.allocUnsafe(21);
			payload.writeUInt8(network.pubKeyHash, 0);
			o.hash.copy(payload, 1);
			return bs58check.encode(payload);
		});
		lazy.prop(o, "hash", () => {
			if (a.output) return a.output.slice(3, 23);
			if (a.address) return _address().hash;
			if (a.pubkey || o.pubkey) return bcrypto.hash160(a.pubkey || o.pubkey);
		});
		lazy.prop(o, "output", () => {
			if (!o.hash) return;
			return bscript.compile([
				OPS.OP_DUP,
				OPS.OP_HASH160,
				o.hash,
				OPS.OP_EQUALVERIFY,
				OPS.OP_CHECKSIG
			]);
		});
		lazy.prop(o, "pubkey", () => {
			if (!a.input) return;
			return _chunks()[1];
		});
		lazy.prop(o, "signature", () => {
			if (!a.input) return;
			return _chunks()[0];
		});
		lazy.prop(o, "input", () => {
			if (!a.pubkey) return;
			if (!a.signature) return;
			return bscript.compile([a.signature, a.pubkey]);
		});
		lazy.prop(o, "witness", () => {
			if (!o.input) return;
			return [];
		});
		if (opts.validate) {
			let hash = Buffer.from([]);
			if (a.address) {
				if (_address().version !== network.pubKeyHash) throw new TypeError("Invalid version or Network mismatch");
				if (_address().hash.length !== 20) throw new TypeError("Invalid address");
				hash = _address().hash;
			}
			if (a.hash) {
				if (hash.length > 0 && !hash.equals(a.hash)) throw new TypeError("Hash mismatch");
				else hash = a.hash;
			}
			if (a.output) {
				if (a.output.length !== 25 || a.output[0] !== OPS.OP_DUP || a.output[1] !== OPS.OP_HASH160 || a.output[2] !== 20 || a.output[23] !== OPS.OP_EQUALVERIFY || a.output[24] !== OPS.OP_CHECKSIG) throw new TypeError("Output is invalid");
				const hash2 = a.output.slice(3, 23);
				if (hash.length > 0 && !hash.equals(hash2)) throw new TypeError("Hash mismatch");
				else hash = hash2;
			}
			if (a.pubkey) {
				const pkh = bcrypto.hash160(a.pubkey);
				if (hash.length > 0 && !hash.equals(pkh)) throw new TypeError("Hash mismatch");
				else hash = pkh;
			}
			if (a.input) {
				const chunks = _chunks();
				if (chunks.length !== 2) throw new TypeError("Input is invalid");
				if (!bscript.isCanonicalScriptSignature(chunks[0])) throw new TypeError("Input has invalid signature");
				if (!(0, types_1.isPoint)(chunks[1])) throw new TypeError("Input has invalid pubkey");
				if (a.signature && !a.signature.equals(chunks[0])) throw new TypeError("Signature mismatch");
				if (a.pubkey && !a.pubkey.equals(chunks[1])) throw new TypeError("Pubkey mismatch");
				const pkh = bcrypto.hash160(chunks[1]);
				if (hash.length > 0 && !hash.equals(pkh)) throw new TypeError("Hash mismatch");
			}
		}
		return Object.assign(o, a);
	}
	exports.p2pkh = p2pkh;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/p2sh.js
var require_p2sh = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2sh = void 0;
	var bcrypto = require_crypto();
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var lazy = require_lazy();
	var bs58check = require_bs58check();
	var OPS = bscript.OPS;
	/**
	* Creates a Pay-to-Script-Hash (P2SH) payment object.
	*
	* @param a - The payment object containing the necessary data.
	* @param opts - Optional payment options.
	* @returns The P2SH payment object.
	* @throws {TypeError} If the required data is not provided or if the data is invalid.
	*/
	function p2sh(a, opts) {
		if (!a.address && !a.hash && !a.output && !a.redeem && !a.input) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		(0, types_1.typeforce)({
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			address: types_1.typeforce.maybe(types_1.typeforce.String),
			hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
			output: types_1.typeforce.maybe(types_1.typeforce.BufferN(23)),
			redeem: types_1.typeforce.maybe({
				network: types_1.typeforce.maybe(types_1.typeforce.Object),
				output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
				input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
				witness: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer))
			}),
			input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
			witness: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer))
		}, a);
		let network = a.network;
		if (!network) network = a.redeem && a.redeem.network || networks_1.bitcoin;
		const o = { network };
		const _address = lazy.value(() => {
			const payload = Buffer.from(bs58check.decode(a.address));
			return {
				version: payload.readUInt8(0),
				hash: payload.slice(1)
			};
		});
		const _chunks = lazy.value(() => {
			return bscript.decompile(a.input);
		});
		const _redeem = lazy.value(() => {
			const chunks = _chunks();
			const lastChunk = chunks[chunks.length - 1];
			return {
				network,
				output: lastChunk === OPS.OP_FALSE ? Buffer.from([]) : lastChunk,
				input: bscript.compile(chunks.slice(0, -1)),
				witness: a.witness || []
			};
		});
		lazy.prop(o, "address", () => {
			if (!o.hash) return;
			const payload = Buffer.allocUnsafe(21);
			payload.writeUInt8(o.network.scriptHash, 0);
			o.hash.copy(payload, 1);
			return bs58check.encode(payload);
		});
		lazy.prop(o, "hash", () => {
			if (a.output) return a.output.slice(2, 22);
			if (a.address) return _address().hash;
			if (o.redeem && o.redeem.output) return bcrypto.hash160(o.redeem.output);
		});
		lazy.prop(o, "output", () => {
			if (!o.hash) return;
			return bscript.compile([
				OPS.OP_HASH160,
				o.hash,
				OPS.OP_EQUAL
			]);
		});
		lazy.prop(o, "redeem", () => {
			if (!a.input) return;
			return _redeem();
		});
		lazy.prop(o, "input", () => {
			if (!a.redeem || !a.redeem.input || !a.redeem.output) return;
			return bscript.compile([].concat(bscript.decompile(a.redeem.input), a.redeem.output));
		});
		lazy.prop(o, "witness", () => {
			if (o.redeem && o.redeem.witness) return o.redeem.witness;
			if (o.input) return [];
		});
		lazy.prop(o, "name", () => {
			const nameParts = ["p2sh"];
			if (o.redeem !== void 0 && o.redeem.name !== void 0) nameParts.push(o.redeem.name);
			return nameParts.join("-");
		});
		if (opts.validate) {
			let hash = Buffer.from([]);
			if (a.address) {
				if (_address().version !== network.scriptHash) throw new TypeError("Invalid version or Network mismatch");
				if (_address().hash.length !== 20) throw new TypeError("Invalid address");
				hash = _address().hash;
			}
			if (a.hash) {
				if (hash.length > 0 && !hash.equals(a.hash)) throw new TypeError("Hash mismatch");
				else hash = a.hash;
			}
			if (a.output) {
				if (a.output.length !== 23 || a.output[0] !== OPS.OP_HASH160 || a.output[1] !== 20 || a.output[22] !== OPS.OP_EQUAL) throw new TypeError("Output is invalid");
				const hash2 = a.output.slice(2, 22);
				if (hash.length > 0 && !hash.equals(hash2)) throw new TypeError("Hash mismatch");
				else hash = hash2;
			}
			const checkRedeem = (redeem) => {
				if (redeem.output) {
					const decompile = bscript.decompile(redeem.output);
					if (!decompile || decompile.length < 1) throw new TypeError("Redeem.output too short");
					if (redeem.output.byteLength > 520) throw new TypeError("Redeem.output unspendable if larger than 520 bytes");
					if (bscript.countNonPushOnlyOPs(decompile) > 201) throw new TypeError("Redeem.output unspendable with more than 201 non-push ops");
					const hash2 = bcrypto.hash160(redeem.output);
					if (hash.length > 0 && !hash.equals(hash2)) throw new TypeError("Hash mismatch");
					else hash = hash2;
				}
				if (redeem.input) {
					const hasInput = redeem.input.length > 0;
					const hasWitness = redeem.witness && redeem.witness.length > 0;
					if (!hasInput && !hasWitness) throw new TypeError("Empty input");
					if (hasInput && hasWitness) throw new TypeError("Input and witness provided");
					if (hasInput) {
						const richunks = bscript.decompile(redeem.input);
						if (!bscript.isPushOnly(richunks)) throw new TypeError("Non push-only scriptSig");
					}
				}
			};
			if (a.input) {
				const chunks = _chunks();
				if (!chunks || chunks.length < 1) throw new TypeError("Input too short");
				if (!Buffer.isBuffer(_redeem().output)) throw new TypeError("Input is invalid");
				checkRedeem(_redeem());
			}
			if (a.redeem) {
				if (a.redeem.network && a.redeem.network !== network) throw new TypeError("Network mismatch");
				if (a.input) {
					const redeem = _redeem();
					if (a.redeem.output && !a.redeem.output.equals(redeem.output)) throw new TypeError("Redeem.output mismatch");
					if (a.redeem.input && !a.redeem.input.equals(redeem.input)) throw new TypeError("Redeem.input mismatch");
				}
				checkRedeem(a.redeem);
			}
			if (a.witness) {
				if (a.redeem && a.redeem.witness && !(0, types_1.stacksEqual)(a.redeem.witness, a.witness)) throw new TypeError("Witness and redeem.witness mismatch");
			}
		}
		return Object.assign(o, a);
	}
	exports.p2sh = p2sh;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/p2wpkh.js
var require_p2wpkh = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2wpkh = void 0;
	var bcrypto = require_crypto();
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var lazy = require_lazy();
	var bech32_1 = require_dist();
	var OPS = bscript.OPS;
	var EMPTY_BUFFER = Buffer.alloc(0);
	/**
	* Creates a pay-to-witness-public-key-hash (p2wpkh) payment object.
	*
	* @param a - The payment object containing the necessary data.
	* @param opts - Optional payment options.
	* @returns The p2wpkh payment object.
	* @throws {TypeError} If the required data is missing or invalid.
	*/
	function p2wpkh(a, opts) {
		if (!a.address && !a.hash && !a.output && !a.pubkey && !a.witness) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		(0, types_1.typeforce)({
			address: types_1.typeforce.maybe(types_1.typeforce.String),
			hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
			input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			output: types_1.typeforce.maybe(types_1.typeforce.BufferN(22)),
			pubkey: types_1.typeforce.maybe(types_1.isPoint),
			signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
			witness: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer))
		}, a);
		const _address = lazy.value(() => {
			const result = bech32_1.bech32.decode(a.address);
			const version = result.words.shift();
			const data = bech32_1.bech32.fromWords(result.words);
			return {
				version,
				prefix: result.prefix,
				data: Buffer.from(data)
			};
		});
		const network = a.network || networks_1.bitcoin;
		const o = {
			name: "p2wpkh",
			network
		};
		lazy.prop(o, "address", () => {
			if (!o.hash) return;
			const words = bech32_1.bech32.toWords(o.hash);
			words.unshift(0);
			return bech32_1.bech32.encode(network.bech32, words);
		});
		lazy.prop(o, "hash", () => {
			if (a.output) return a.output.slice(2, 22);
			if (a.address) return _address().data;
			if (a.pubkey || o.pubkey) return bcrypto.hash160(a.pubkey || o.pubkey);
		});
		lazy.prop(o, "output", () => {
			if (!o.hash) return;
			return bscript.compile([OPS.OP_0, o.hash]);
		});
		lazy.prop(o, "pubkey", () => {
			if (a.pubkey) return a.pubkey;
			if (!a.witness) return;
			return a.witness[1];
		});
		lazy.prop(o, "signature", () => {
			if (!a.witness) return;
			return a.witness[0];
		});
		lazy.prop(o, "input", () => {
			if (!o.witness) return;
			return EMPTY_BUFFER;
		});
		lazy.prop(o, "witness", () => {
			if (!a.pubkey) return;
			if (!a.signature) return;
			return [a.signature, a.pubkey];
		});
		if (opts.validate) {
			let hash = Buffer.from([]);
			if (a.address) {
				if (network && network.bech32 !== _address().prefix) throw new TypeError("Invalid prefix or Network mismatch");
				if (_address().version !== 0) throw new TypeError("Invalid address version");
				if (_address().data.length !== 20) throw new TypeError("Invalid address data");
				hash = _address().data;
			}
			if (a.hash) {
				if (hash.length > 0 && !hash.equals(a.hash)) throw new TypeError("Hash mismatch");
				else hash = a.hash;
			}
			if (a.output) {
				if (a.output.length !== 22 || a.output[0] !== OPS.OP_0 || a.output[1] !== 20) throw new TypeError("Output is invalid");
				if (hash.length > 0 && !hash.equals(a.output.slice(2))) throw new TypeError("Hash mismatch");
				else hash = a.output.slice(2);
			}
			if (a.pubkey) {
				const pkh = bcrypto.hash160(a.pubkey);
				if (hash.length > 0 && !hash.equals(pkh)) throw new TypeError("Hash mismatch");
				else hash = pkh;
				if (!(0, types_1.isPoint)(a.pubkey) || a.pubkey.length !== 33) throw new TypeError("Invalid pubkey for p2wpkh");
			}
			if (a.witness) {
				if (a.witness.length !== 2) throw new TypeError("Witness is invalid");
				if (!bscript.isCanonicalScriptSignature(a.witness[0])) throw new TypeError("Witness has invalid signature");
				if (!(0, types_1.isPoint)(a.witness[1]) || a.witness[1].length !== 33) throw new TypeError("Witness has invalid pubkey");
				if (a.signature && !a.signature.equals(a.witness[0])) throw new TypeError("Signature mismatch");
				if (a.pubkey && !a.pubkey.equals(a.witness[1])) throw new TypeError("Pubkey mismatch");
				const pkh = bcrypto.hash160(a.witness[1]);
				if (hash.length > 0 && !hash.equals(pkh)) throw new TypeError("Hash mismatch");
			}
		}
		return Object.assign(o, a);
	}
	exports.p2wpkh = p2wpkh;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/p2wsh.js
var require_p2wsh = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2wsh = void 0;
	var bcrypto = require_crypto();
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var lazy = require_lazy();
	var bech32_1 = require_dist();
	var OPS = bscript.OPS;
	var EMPTY_BUFFER = Buffer.alloc(0);
	function chunkHasUncompressedPubkey(chunk) {
		if (Buffer.isBuffer(chunk) && chunk.length === 65 && chunk[0] === 4 && (0, types_1.isPoint)(chunk)) return true;
		else return false;
	}
	/**
	* Creates a Pay-to-Witness-Script-Hash (P2WSH) payment object.
	*
	* @param a - The payment object containing the necessary data.
	* @param opts - Optional payment options.
	* @returns The P2WSH payment object.
	* @throws {TypeError} If the required data is missing or invalid.
	*/
	function p2wsh(a, opts) {
		if (!a.address && !a.hash && !a.output && !a.redeem && !a.witness) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		(0, types_1.typeforce)({
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			address: types_1.typeforce.maybe(types_1.typeforce.String),
			hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
			output: types_1.typeforce.maybe(types_1.typeforce.BufferN(34)),
			redeem: types_1.typeforce.maybe({
				input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
				network: types_1.typeforce.maybe(types_1.typeforce.Object),
				output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
				witness: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer))
			}),
			input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
			witness: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer))
		}, a);
		const _address = lazy.value(() => {
			const result = bech32_1.bech32.decode(a.address);
			const version = result.words.shift();
			const data = bech32_1.bech32.fromWords(result.words);
			return {
				version,
				prefix: result.prefix,
				data: Buffer.from(data)
			};
		});
		const _rchunks = lazy.value(() => {
			return bscript.decompile(a.redeem.input);
		});
		let network = a.network;
		if (!network) network = a.redeem && a.redeem.network || networks_1.bitcoin;
		const o = { network };
		lazy.prop(o, "address", () => {
			if (!o.hash) return;
			const words = bech32_1.bech32.toWords(o.hash);
			words.unshift(0);
			return bech32_1.bech32.encode(network.bech32, words);
		});
		lazy.prop(o, "hash", () => {
			if (a.output) return a.output.slice(2);
			if (a.address) return _address().data;
			if (o.redeem && o.redeem.output) return bcrypto.sha256(o.redeem.output);
		});
		lazy.prop(o, "output", () => {
			if (!o.hash) return;
			return bscript.compile([OPS.OP_0, o.hash]);
		});
		lazy.prop(o, "redeem", () => {
			if (!a.witness) return;
			return {
				output: a.witness[a.witness.length - 1],
				input: EMPTY_BUFFER,
				witness: a.witness.slice(0, -1)
			};
		});
		lazy.prop(o, "input", () => {
			if (!o.witness) return;
			return EMPTY_BUFFER;
		});
		lazy.prop(o, "witness", () => {
			if (a.redeem && a.redeem.input && a.redeem.input.length > 0 && a.redeem.output && a.redeem.output.length > 0) {
				const stack = bscript.toStack(_rchunks());
				o.redeem = Object.assign({ witness: stack }, a.redeem);
				o.redeem.input = EMPTY_BUFFER;
				return [].concat(stack, a.redeem.output);
			}
			if (!a.redeem) return;
			if (!a.redeem.output) return;
			if (!a.redeem.witness) return;
			return [].concat(a.redeem.witness, a.redeem.output);
		});
		lazy.prop(o, "name", () => {
			const nameParts = ["p2wsh"];
			if (o.redeem !== void 0 && o.redeem.name !== void 0) nameParts.push(o.redeem.name);
			return nameParts.join("-");
		});
		if (opts.validate) {
			let hash = Buffer.from([]);
			if (a.address) {
				if (_address().prefix !== network.bech32) throw new TypeError("Invalid prefix or Network mismatch");
				if (_address().version !== 0) throw new TypeError("Invalid address version");
				if (_address().data.length !== 32) throw new TypeError("Invalid address data");
				hash = _address().data;
			}
			if (a.hash) {
				if (hash.length > 0 && !hash.equals(a.hash)) throw new TypeError("Hash mismatch");
				else hash = a.hash;
			}
			if (a.output) {
				if (a.output.length !== 34 || a.output[0] !== OPS.OP_0 || a.output[1] !== 32) throw new TypeError("Output is invalid");
				const hash2 = a.output.slice(2);
				if (hash.length > 0 && !hash.equals(hash2)) throw new TypeError("Hash mismatch");
				else hash = hash2;
			}
			if (a.redeem) {
				if (a.redeem.network && a.redeem.network !== network) throw new TypeError("Network mismatch");
				if (a.redeem.input && a.redeem.input.length > 0 && a.redeem.witness && a.redeem.witness.length > 0) throw new TypeError("Ambiguous witness source");
				if (a.redeem.output) {
					const decompile = bscript.decompile(a.redeem.output);
					if (!decompile || decompile.length < 1) throw new TypeError("Redeem.output is invalid");
					if (a.redeem.output.byteLength > 3600) throw new TypeError("Redeem.output unspendable if larger than 3600 bytes");
					if (bscript.countNonPushOnlyOPs(decompile) > 201) throw new TypeError("Redeem.output unspendable with more than 201 non-push ops");
					const hash2 = bcrypto.sha256(a.redeem.output);
					if (hash.length > 0 && !hash.equals(hash2)) throw new TypeError("Hash mismatch");
					else hash = hash2;
				}
				if (a.redeem.input && !bscript.isPushOnly(_rchunks())) throw new TypeError("Non push-only scriptSig");
				if (a.witness && a.redeem.witness && !(0, types_1.stacksEqual)(a.witness, a.redeem.witness)) throw new TypeError("Witness and redeem.witness mismatch");
				if (a.redeem.input && _rchunks().some(chunkHasUncompressedPubkey) || a.redeem.output && (bscript.decompile(a.redeem.output) || []).some(chunkHasUncompressedPubkey)) throw new TypeError("redeem.input or redeem.output contains uncompressed pubkey");
			}
			if (a.witness && a.witness.length > 0) {
				const wScript = a.witness[a.witness.length - 1];
				if (a.redeem && a.redeem.output && !a.redeem.output.equals(wScript)) throw new TypeError("Witness and redeem.output mismatch");
				if (a.witness.some(chunkHasUncompressedPubkey) || (bscript.decompile(wScript) || []).some(chunkHasUncompressedPubkey)) throw new TypeError("Witness contains uncompressed pubkey");
			}
		}
		return Object.assign(o, a);
	}
	exports.p2wsh = p2wsh;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/ecc_lib.js
var require_ecc_lib = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getEccLib = exports.initEccLib = void 0;
	var _ECCLIB_CACHE = {};
	/**
	* Initializes the ECC library with the provided instance.
	* If `eccLib` is `undefined`, the library will be cleared.
	* If `eccLib` is a new instance, it will be verified before setting it as the active library.
	*
	* @param eccLib The instance of the ECC library to initialize.
	* @param opts Extra initialization options. Use {DANGER_DO_NOT_VERIFY_ECCLIB:true} if ecc verification should not be executed. Not recommended!
	*/
	function initEccLib(eccLib, opts) {
		if (!eccLib) _ECCLIB_CACHE.eccLib = eccLib;
		else if (eccLib !== _ECCLIB_CACHE.eccLib) {
			if (!opts?.DANGER_DO_NOT_VERIFY_ECCLIB) verifyEcc(eccLib);
			_ECCLIB_CACHE.eccLib = eccLib;
		}
	}
	exports.initEccLib = initEccLib;
	/**
	* Retrieves the ECC Library instance.
	* Throws an error if the ECC Library is not provided.
	* You must call initEccLib() with a valid TinySecp256k1Interface instance before calling this function.
	* @returns The ECC Library instance.
	* @throws Error if the ECC Library is not provided.
	*/
	function getEccLib() {
		if (!_ECCLIB_CACHE.eccLib) throw new Error("No ECC Library provided. You must call initEccLib() with a valid TinySecp256k1Interface instance");
		return _ECCLIB_CACHE.eccLib;
	}
	exports.getEccLib = getEccLib;
	var h = (hex) => Buffer.from(hex, "hex");
	/**
	* Verifies the ECC functionality.
	*
	* @param ecc - The TinySecp256k1Interface object.
	*/
	function verifyEcc(ecc) {
		assert(typeof ecc.isXOnlyPoint === "function");
		assert(ecc.isXOnlyPoint(h("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798")));
		assert(ecc.isXOnlyPoint(h("fffffffffffffffffffffffffffffffffffffffffffffffffffffffeeffffc2e")));
		assert(ecc.isXOnlyPoint(h("f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9")));
		assert(ecc.isXOnlyPoint(h("0000000000000000000000000000000000000000000000000000000000000001")));
		assert(!ecc.isXOnlyPoint(h("0000000000000000000000000000000000000000000000000000000000000000")));
		assert(!ecc.isXOnlyPoint(h("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f")));
		assert(typeof ecc.xOnlyPointAddTweak === "function");
		tweakAddVectors.forEach((t) => {
			const r = ecc.xOnlyPointAddTweak(h(t.pubkey), h(t.tweak));
			if (t.result === null) assert(r === null);
			else {
				assert(r !== null);
				assert(r.parity === t.parity);
				assert(Buffer.from(r.xOnlyPubkey).equals(h(t.result)));
			}
		});
	}
	function assert(bool) {
		if (!bool) throw new Error("ecc library invalid");
	}
	var tweakAddVectors = [
		{
			pubkey: "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
			tweak: "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140",
			parity: -1,
			result: null
		},
		{
			pubkey: "1617d38ed8d8657da4d4761e8057bc396ea9e4b9d29776d4be096016dbd2509b",
			tweak: "a8397a935f0dfceba6ba9618f6451ef4d80637abf4e6af2669fbc9de6a8fd2ac",
			parity: 1,
			result: "e478f99dab91052ab39a33ea35fd5e6e4933f4d28023cd597c9a1f6760346adf"
		},
		{
			pubkey: "2c0b7cf95324a07d05398b240174dc0c2be444d96b159aa6c7f7b1e668680991",
			tweak: "823c3cd2142744b075a87eade7e1b8678ba308d566226a0056ca2b7a76f86b47",
			parity: 0,
			result: "9534f8dc8c6deda2dc007655981c78b49c5d96c778fbf363462a11ec9dfd948c"
		}
	];
}));
//#endregion
//#region node_modules/safe-buffer/index.js
var require_safe_buffer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
	var buffer = __require("buffer");
	var Buffer = buffer.Buffer;
	function copyProps(src, dst) {
		for (var key in src) dst[key] = src[key];
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) module.exports = buffer;
	else {
		copyProps(buffer, exports);
		exports.Buffer = SafeBuffer;
	}
	function SafeBuffer(arg, encodingOrOffset, length) {
		return Buffer(arg, encodingOrOffset, length);
	}
	SafeBuffer.prototype = Object.create(Buffer.prototype);
	copyProps(Buffer, SafeBuffer);
	SafeBuffer.from = function(arg, encodingOrOffset, length) {
		if (typeof arg === "number") throw new TypeError("Argument must not be a number");
		return Buffer(arg, encodingOrOffset, length);
	};
	SafeBuffer.alloc = function(size, fill, encoding) {
		if (typeof size !== "number") throw new TypeError("Argument must be a number");
		var buf = Buffer(size);
		if (fill !== void 0) {
			if (typeof encoding === "string") buf.fill(fill, encoding);
			else buf.fill(fill);
		} else buf.fill(0);
		return buf;
	};
	SafeBuffer.allocUnsafe = function(size) {
		if (typeof size !== "number") throw new TypeError("Argument must be a number");
		return Buffer(size);
	};
	SafeBuffer.allocUnsafeSlow = function(size) {
		if (typeof size !== "number") throw new TypeError("Argument must be a number");
		return buffer.SlowBuffer(size);
	};
}));
//#endregion
//#region node_modules/varuint-bitcoin/index.js
var require_varuint_bitcoin = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Buffer = require_safe_buffer().Buffer;
	var MAX_SAFE_INTEGER = 9007199254740991;
	function checkUInt53(n) {
		if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError("value out of range");
	}
	function encode(number, buffer, offset) {
		checkUInt53(number);
		if (!buffer) buffer = Buffer.allocUnsafe(encodingLength(number));
		if (!Buffer.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
		if (!offset) offset = 0;
		if (number < 253) {
			buffer.writeUInt8(number, offset);
			encode.bytes = 1;
		} else if (number <= 65535) {
			buffer.writeUInt8(253, offset);
			buffer.writeUInt16LE(number, offset + 1);
			encode.bytes = 3;
		} else if (number <= 4294967295) {
			buffer.writeUInt8(254, offset);
			buffer.writeUInt32LE(number, offset + 1);
			encode.bytes = 5;
		} else {
			buffer.writeUInt8(255, offset);
			buffer.writeUInt32LE(number >>> 0, offset + 1);
			buffer.writeUInt32LE(number / 4294967296 | 0, offset + 5);
			encode.bytes = 9;
		}
		return buffer;
	}
	function decode(buffer, offset) {
		if (!Buffer.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
		if (!offset) offset = 0;
		var first = buffer.readUInt8(offset);
		if (first < 253) {
			decode.bytes = 1;
			return first;
		} else if (first === 253) {
			decode.bytes = 3;
			return buffer.readUInt16LE(offset + 1);
		} else if (first === 254) {
			decode.bytes = 5;
			return buffer.readUInt32LE(offset + 1);
		} else {
			decode.bytes = 9;
			var lo = buffer.readUInt32LE(offset + 1);
			var number = buffer.readUInt32LE(offset + 5) * 4294967296 + lo;
			checkUInt53(number);
			return number;
		}
	}
	function encodingLength(number) {
		checkUInt53(number);
		return number < 253 ? 1 : number <= 65535 ? 3 : number <= 4294967295 ? 5 : 9;
	}
	module.exports = {
		encode,
		decode,
		encodingLength
	};
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/bufferutils.js
var require_bufferutils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BufferReader = exports.BufferWriter = exports.cloneBuffer = exports.reverseBuffer = exports.writeUInt64LE = exports.readUInt64LE = exports.varuint = void 0;
	var types = require_types();
	var { typeforce } = types;
	var varuint = require_varuint_bitcoin();
	exports.varuint = varuint;
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
	/**
	* Writes a 64-bit unsigned integer in little-endian format to the specified buffer at the given offset.
	*
	* @param buffer - The buffer to write the value to.
	* @param value - The 64-bit unsigned integer value to write.
	* @param offset - The offset in the buffer where the value should be written.
	* @returns The new offset after writing the value.
	*/
	function writeUInt64LE(buffer, value, offset) {
		verifuint(value, 9007199254740991);
		buffer.writeInt32LE(value & -1, offset);
		buffer.writeUInt32LE(Math.floor(value / 4294967296), offset + 4);
		return offset + 8;
	}
	exports.writeUInt64LE = writeUInt64LE;
	/**
	* Reverses the order of bytes in a buffer.
	* @param buffer - The buffer to reverse.
	* @returns A new buffer with the bytes reversed.
	*/
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
	function cloneBuffer(buffer) {
		const clone = Buffer.allocUnsafe(buffer.length);
		buffer.copy(clone);
		return clone;
	}
	exports.cloneBuffer = cloneBuffer;
	exports.BufferWriter = class BufferWriter {
		static withCapacity(size) {
			return new BufferWriter(Buffer.alloc(size));
		}
		constructor(buffer, offset = 0) {
			this.buffer = buffer;
			this.offset = offset;
			typeforce(types.tuple(types.Buffer, types.UInt32), [buffer, offset]);
		}
		writeUInt8(i) {
			this.offset = this.buffer.writeUInt8(i, this.offset);
		}
		writeInt32(i) {
			this.offset = this.buffer.writeInt32LE(i, this.offset);
		}
		writeUInt32(i) {
			this.offset = this.buffer.writeUInt32LE(i, this.offset);
		}
		writeUInt64(i) {
			this.offset = writeUInt64LE(this.buffer, i, this.offset);
		}
		writeVarInt(i) {
			varuint.encode(i, this.buffer, this.offset);
			this.offset += varuint.encode.bytes;
		}
		writeSlice(slice) {
			if (this.buffer.length < this.offset + slice.length) throw new Error("Cannot write slice out of bounds");
			this.offset += slice.copy(this.buffer, this.offset);
		}
		writeVarSlice(slice) {
			this.writeVarInt(slice.length);
			this.writeSlice(slice);
		}
		writeVector(vector) {
			this.writeVarInt(vector.length);
			vector.forEach((buf) => this.writeVarSlice(buf));
		}
		end() {
			if (this.buffer.length === this.offset) return this.buffer;
			throw new Error(`buffer size ${this.buffer.length}, offset ${this.offset}`);
		}
	};
	/**
	* Helper class for reading of bitcoin data types from a buffer.
	*/
	var BufferReader = class {
		constructor(buffer, offset = 0) {
			this.buffer = buffer;
			this.offset = offset;
			typeforce(types.tuple(types.Buffer, types.UInt32), [buffer, offset]);
		}
		readUInt8() {
			const result = this.buffer.readUInt8(this.offset);
			this.offset++;
			return result;
		}
		readInt32() {
			const result = this.buffer.readInt32LE(this.offset);
			this.offset += 4;
			return result;
		}
		readUInt32() {
			const result = this.buffer.readUInt32LE(this.offset);
			this.offset += 4;
			return result;
		}
		readUInt64() {
			const result = readUInt64LE(this.buffer, this.offset);
			this.offset += 8;
			return result;
		}
		readVarInt() {
			const vi = varuint.decode(this.buffer, this.offset);
			this.offset += varuint.decode.bytes;
			return vi;
		}
		readSlice(n) {
			if (this.buffer.length < this.offset + n) throw new Error("Cannot read slice out of bounds");
			const result = this.buffer.slice(this.offset, this.offset + n);
			this.offset += n;
			return result;
		}
		readVarSlice() {
			return this.readSlice(this.readVarInt());
		}
		readVector() {
			const count = this.readVarInt();
			const vector = [];
			for (let i = 0; i < count; i++) vector.push(this.readVarSlice());
			return vector;
		}
	};
	exports.BufferReader = BufferReader;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/bip341.js
var require_bip341 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.tweakKey = exports.tapTweakHash = exports.tapleafHash = exports.findScriptPath = exports.toHashTree = exports.rootHashFromPath = exports.MAX_TAPTREE_DEPTH = exports.LEAF_VERSION_TAPSCRIPT = void 0;
	var buffer_1$1 = __require("buffer");
	var ecc_lib_1 = require_ecc_lib();
	var bcrypto = require_crypto();
	var bufferutils_1 = require_bufferutils();
	var types_1 = require_types();
	exports.LEAF_VERSION_TAPSCRIPT = 192;
	exports.MAX_TAPTREE_DEPTH = 128;
	var isHashBranch = (ht) => "left" in ht && "right" in ht;
	/**
	* Calculates the root hash from a given control block and leaf hash.
	* @param controlBlock - The control block buffer.
	* @param leafHash - The leaf hash buffer.
	* @returns The root hash buffer.
	* @throws {TypeError} If the control block length is less than 33.
	*/
	function rootHashFromPath(controlBlock, leafHash) {
		if (controlBlock.length < 33) throw new TypeError(`The control-block length is too small. Got ${controlBlock.length}, expected min 33.`);
		const m = (controlBlock.length - 33) / 32;
		let kj = leafHash;
		for (let j = 0; j < m; j++) {
			const ej = controlBlock.slice(33 + 32 * j, 65 + 32 * j);
			if (kj.compare(ej) < 0) kj = tapBranchHash(kj, ej);
			else kj = tapBranchHash(ej, kj);
		}
		return kj;
	}
	exports.rootHashFromPath = rootHashFromPath;
	/**
	* Build a hash tree of merkle nodes from the scripts binary tree.
	* @param scriptTree - the tree of scripts to pairwise hash.
	*/
	function toHashTree(scriptTree) {
		if ((0, types_1.isTapleaf)(scriptTree)) return { hash: tapleafHash(scriptTree) };
		const hashes = [toHashTree(scriptTree[0]), toHashTree(scriptTree[1])];
		hashes.sort((a, b) => a.hash.compare(b.hash));
		const [left, right] = hashes;
		return {
			hash: tapBranchHash(left.hash, right.hash),
			left,
			right
		};
	}
	exports.toHashTree = toHashTree;
	/**
	* Given a HashTree, finds the path from a particular hash to the root.
	* @param node - the root of the tree
	* @param hash - the hash to search for
	* @returns - array of sibling hashes, from leaf (inclusive) to root
	* (exclusive) needed to prove inclusion of the specified hash. undefined if no
	* path is found
	*/
	function findScriptPath(node, hash) {
		if (isHashBranch(node)) {
			const leftPath = findScriptPath(node.left, hash);
			if (leftPath !== void 0) return [...leftPath, node.right.hash];
			const rightPath = findScriptPath(node.right, hash);
			if (rightPath !== void 0) return [...rightPath, node.left.hash];
		} else if (node.hash.equals(hash)) return [];
	}
	exports.findScriptPath = findScriptPath;
	function tapleafHash(leaf) {
		const version = leaf.version || exports.LEAF_VERSION_TAPSCRIPT;
		return bcrypto.taggedHash("TapLeaf", buffer_1$1.Buffer.concat([buffer_1$1.Buffer.from([version]), serializeScript(leaf.output)]));
	}
	exports.tapleafHash = tapleafHash;
	function tapTweakHash(pubKey, h) {
		return bcrypto.taggedHash("TapTweak", buffer_1$1.Buffer.concat(h ? [pubKey, h] : [pubKey]));
	}
	exports.tapTweakHash = tapTweakHash;
	function tweakKey(pubKey, h) {
		if (!buffer_1$1.Buffer.isBuffer(pubKey)) return null;
		if (pubKey.length !== 32) return null;
		if (h && h.length !== 32) return null;
		const tweakHash = tapTweakHash(pubKey, h);
		const res = (0, ecc_lib_1.getEccLib)().xOnlyPointAddTweak(pubKey, tweakHash);
		if (!res || res.xOnlyPubkey === null) return null;
		return {
			parity: res.parity,
			x: buffer_1$1.Buffer.from(res.xOnlyPubkey)
		};
	}
	exports.tweakKey = tweakKey;
	function tapBranchHash(a, b) {
		return bcrypto.taggedHash("TapBranch", buffer_1$1.Buffer.concat([a, b]));
	}
	function serializeScript(s) {
		const varintLen = bufferutils_1.varuint.encodingLength(s.length);
		const buffer = buffer_1$1.Buffer.allocUnsafe(varintLen);
		bufferutils_1.varuint.encode(s.length, buffer);
		return buffer_1$1.Buffer.concat([buffer, s]);
	}
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/p2tr.js
var require_p2tr = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2tr = void 0;
	var buffer_1 = __require("buffer");
	var networks_1 = require_networks();
	var bscript = require_script();
	var types_1 = require_types();
	var ecc_lib_1 = require_ecc_lib();
	var bip341_1 = require_bip341();
	var lazy = require_lazy();
	var bech32_1 = require_dist();
	var address_1 = require_address();
	var OPS = bscript.OPS;
	var TAPROOT_WITNESS_VERSION = 1;
	var ANNEX_PREFIX = 80;
	/**
	* Creates a Pay-to-Taproot (P2TR) payment object.
	*
	* @param a - The payment object containing the necessary data for P2TR.
	* @param opts - Optional payment options.
	* @returns The P2TR payment object.
	* @throws {TypeError} If the provided data is invalid or insufficient.
	*/
	function p2tr(a, opts) {
		if (!a.address && !a.output && !a.pubkey && !a.internalPubkey && !(a.witness && a.witness.length > 1)) throw new TypeError("Not enough data");
		opts = Object.assign({ validate: true }, opts || {});
		(0, types_1.typeforce)({
			address: types_1.typeforce.maybe(types_1.typeforce.String),
			input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
			network: types_1.typeforce.maybe(types_1.typeforce.Object),
			output: types_1.typeforce.maybe(types_1.typeforce.BufferN(34)),
			internalPubkey: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
			hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
			pubkey: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
			signature: types_1.typeforce.maybe(types_1.typeforce.anyOf(types_1.typeforce.BufferN(64), types_1.typeforce.BufferN(65))),
			witness: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer)),
			scriptTree: types_1.typeforce.maybe(types_1.isTaptree),
			redeem: types_1.typeforce.maybe({
				output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
				redeemVersion: types_1.typeforce.maybe(types_1.typeforce.Number),
				witness: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer))
			}),
			redeemVersion: types_1.typeforce.maybe(types_1.typeforce.Number)
		}, a);
		const _address = lazy.value(() => {
			return (0, address_1.fromBech32)(a.address);
		});
		const _witness = lazy.value(() => {
			if (!a.witness || !a.witness.length) return;
			if (a.witness.length >= 2 && a.witness[a.witness.length - 1][0] === ANNEX_PREFIX) return a.witness.slice(0, -1);
			return a.witness.slice();
		});
		const _hashTree = lazy.value(() => {
			if (a.scriptTree) return (0, bip341_1.toHashTree)(a.scriptTree);
			if (a.hash) return { hash: a.hash };
		});
		const network = a.network || networks_1.bitcoin;
		const o = {
			name: "p2tr",
			network
		};
		lazy.prop(o, "address", () => {
			if (!o.pubkey) return;
			const words = bech32_1.bech32m.toWords(o.pubkey);
			words.unshift(TAPROOT_WITNESS_VERSION);
			return bech32_1.bech32m.encode(network.bech32, words);
		});
		lazy.prop(o, "hash", () => {
			const hashTree = _hashTree();
			if (hashTree) return hashTree.hash;
			const w = _witness();
			if (w && w.length > 1) {
				const controlBlock = w[w.length - 1];
				const leafVersion = controlBlock[0] & types_1.TAPLEAF_VERSION_MASK;
				const script = w[w.length - 2];
				const leafHash = (0, bip341_1.tapleafHash)({
					output: script,
					version: leafVersion
				});
				return (0, bip341_1.rootHashFromPath)(controlBlock, leafHash);
			}
			return null;
		});
		lazy.prop(o, "output", () => {
			if (!o.pubkey) return;
			return bscript.compile([OPS.OP_1, o.pubkey]);
		});
		lazy.prop(o, "redeemVersion", () => {
			if (a.redeemVersion) return a.redeemVersion;
			if (a.redeem && a.redeem.redeemVersion !== void 0 && a.redeem.redeemVersion !== null) return a.redeem.redeemVersion;
			return bip341_1.LEAF_VERSION_TAPSCRIPT;
		});
		lazy.prop(o, "redeem", () => {
			const witness = _witness();
			if (!witness || witness.length < 2) return;
			return {
				output: witness[witness.length - 2],
				witness: witness.slice(0, -2),
				redeemVersion: witness[witness.length - 1][0] & types_1.TAPLEAF_VERSION_MASK
			};
		});
		lazy.prop(o, "pubkey", () => {
			if (a.pubkey) return a.pubkey;
			if (a.output) return a.output.slice(2);
			if (a.address) return _address().data;
			if (o.internalPubkey) {
				const tweakedKey = (0, bip341_1.tweakKey)(o.internalPubkey, o.hash);
				if (tweakedKey) return tweakedKey.x;
			}
		});
		lazy.prop(o, "internalPubkey", () => {
			if (a.internalPubkey) return a.internalPubkey;
			const witness = _witness();
			if (witness && witness.length > 1) return witness[witness.length - 1].slice(1, 33);
		});
		lazy.prop(o, "signature", () => {
			if (a.signature) return a.signature;
			const witness = _witness();
			if (!witness || witness.length !== 1) return;
			return witness[0];
		});
		lazy.prop(o, "witness", () => {
			if (a.witness) return a.witness;
			const hashTree = _hashTree();
			if (hashTree && a.redeem && a.redeem.output && a.internalPubkey) {
				const leafHash = (0, bip341_1.tapleafHash)({
					output: a.redeem.output,
					version: o.redeemVersion
				});
				const path = (0, bip341_1.findScriptPath)(hashTree, leafHash);
				if (!path) return;
				const outputKey = (0, bip341_1.tweakKey)(a.internalPubkey, hashTree.hash);
				if (!outputKey) return;
				const controlBock = buffer_1.Buffer.concat([buffer_1.Buffer.from([o.redeemVersion | outputKey.parity]), a.internalPubkey].concat(path));
				return [a.redeem.output, controlBock];
			}
			if (a.signature) return [a.signature];
		});
		if (opts.validate) {
			let pubkey = buffer_1.Buffer.from([]);
			if (a.address) {
				if (network && network.bech32 !== _address().prefix) throw new TypeError("Invalid prefix or Network mismatch");
				if (_address().version !== TAPROOT_WITNESS_VERSION) throw new TypeError("Invalid address version");
				if (_address().data.length !== 32) throw new TypeError("Invalid address data");
				pubkey = _address().data;
			}
			if (a.pubkey) {
				if (pubkey.length > 0 && !pubkey.equals(a.pubkey)) throw new TypeError("Pubkey mismatch");
				else pubkey = a.pubkey;
			}
			if (a.output) {
				if (a.output.length !== 34 || a.output[0] !== OPS.OP_1 || a.output[1] !== 32) throw new TypeError("Output is invalid");
				if (pubkey.length > 0 && !pubkey.equals(a.output.slice(2))) throw new TypeError("Pubkey mismatch");
				else pubkey = a.output.slice(2);
			}
			if (a.internalPubkey) {
				const tweakedKey = (0, bip341_1.tweakKey)(a.internalPubkey, o.hash);
				if (pubkey.length > 0 && !pubkey.equals(tweakedKey.x)) throw new TypeError("Pubkey mismatch");
				else pubkey = tweakedKey.x;
			}
			if (pubkey && pubkey.length) {
				if (!(0, ecc_lib_1.getEccLib)().isXOnlyPoint(pubkey)) throw new TypeError("Invalid pubkey for p2tr");
			}
			const hashTree = _hashTree();
			if (a.hash && hashTree) {
				if (!a.hash.equals(hashTree.hash)) throw new TypeError("Hash mismatch");
			}
			if (a.redeem && a.redeem.output && hashTree) {
				const leafHash = (0, bip341_1.tapleafHash)({
					output: a.redeem.output,
					version: o.redeemVersion
				});
				if (!(0, bip341_1.findScriptPath)(hashTree, leafHash)) throw new TypeError("Redeem script not in tree");
			}
			const witness = _witness();
			if (a.redeem && o.redeem) {
				if (a.redeem.redeemVersion) {
					if (a.redeem.redeemVersion !== o.redeem.redeemVersion) throw new TypeError("Redeem.redeemVersion and witness mismatch");
				}
				if (a.redeem.output) {
					if (bscript.decompile(a.redeem.output).length === 0) throw new TypeError("Redeem.output is invalid");
					if (o.redeem.output && !a.redeem.output.equals(o.redeem.output)) throw new TypeError("Redeem.output and witness mismatch");
				}
				if (a.redeem.witness) {
					if (o.redeem.witness && !(0, types_1.stacksEqual)(a.redeem.witness, o.redeem.witness)) throw new TypeError("Redeem.witness and witness mismatch");
				}
			}
			if (witness && witness.length) {
				if (witness.length === 1) {
					if (a.signature && !a.signature.equals(witness[0])) throw new TypeError("Signature mismatch");
				} else {
					const controlBlock = witness[witness.length - 1];
					if (controlBlock.length < 33) throw new TypeError(`The control-block length is too small. Got ${controlBlock.length}, expected min 33.`);
					if ((controlBlock.length - 33) % 32 !== 0) throw new TypeError(`The control-block length of ${controlBlock.length} is incorrect!`);
					const m = (controlBlock.length - 33) / 32;
					if (m > 128) throw new TypeError(`The script path is too long. Got ${m}, expected max 128.`);
					const internalPubkey = controlBlock.slice(1, 33);
					if (a.internalPubkey && !a.internalPubkey.equals(internalPubkey)) throw new TypeError("Internal pubkey mismatch");
					if (!(0, ecc_lib_1.getEccLib)().isXOnlyPoint(internalPubkey)) throw new TypeError("Invalid internalPubkey for p2tr witness");
					const leafVersion = controlBlock[0] & types_1.TAPLEAF_VERSION_MASK;
					const script = witness[witness.length - 2];
					const leafHash = (0, bip341_1.tapleafHash)({
						output: script,
						version: leafVersion
					});
					const hash = (0, bip341_1.rootHashFromPath)(controlBlock, leafHash);
					const outputKey = (0, bip341_1.tweakKey)(internalPubkey, hash);
					if (!outputKey) throw new TypeError("Invalid outputKey for p2tr witness");
					if (pubkey.length && !pubkey.equals(outputKey.x)) throw new TypeError("Pubkey mismatch for p2tr witness");
					if (outputKey.parity !== (controlBlock[0] & 1)) throw new Error("Incorrect parity");
				}
			}
		}
		return Object.assign(o, a);
	}
	exports.p2tr = p2tr;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/payments/index.js
var require_payments = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.p2tr = exports.p2wsh = exports.p2wpkh = exports.p2sh = exports.p2pkh = exports.p2pk = exports.p2ms = exports.embed = void 0;
	var embed_1 = require_embed();
	Object.defineProperty(exports, "embed", {
		enumerable: true,
		get: function() {
			return embed_1.p2data;
		}
	});
	var p2ms_1 = require_p2ms();
	Object.defineProperty(exports, "p2ms", {
		enumerable: true,
		get: function() {
			return p2ms_1.p2ms;
		}
	});
	var p2pk_1 = require_p2pk();
	Object.defineProperty(exports, "p2pk", {
		enumerable: true,
		get: function() {
			return p2pk_1.p2pk;
		}
	});
	var p2pkh_1 = require_p2pkh();
	Object.defineProperty(exports, "p2pkh", {
		enumerable: true,
		get: function() {
			return p2pkh_1.p2pkh;
		}
	});
	var p2sh_1 = require_p2sh();
	Object.defineProperty(exports, "p2sh", {
		enumerable: true,
		get: function() {
			return p2sh_1.p2sh;
		}
	});
	var p2wpkh_1 = require_p2wpkh();
	Object.defineProperty(exports, "p2wpkh", {
		enumerable: true,
		get: function() {
			return p2wpkh_1.p2wpkh;
		}
	});
	var p2wsh_1 = require_p2wsh();
	Object.defineProperty(exports, "p2wsh", {
		enumerable: true,
		get: function() {
			return p2wsh_1.p2wsh;
		}
	});
	var p2tr_1 = require_p2tr();
	Object.defineProperty(exports, "p2tr", {
		enumerable: true,
		get: function() {
			return p2tr_1.p2tr;
		}
	});
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/address.js
var require_address = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toOutputScript = exports.fromOutputScript = exports.toBech32 = exports.toBase58Check = exports.fromBech32 = exports.fromBase58Check = void 0;
	var networks = require_networks();
	var payments = require_payments();
	var bscript = require_script();
	var types_1 = require_types();
	var bech32_1 = require_dist();
	var bs58check = require_bs58check();
	var FUTURE_SEGWIT_MAX_SIZE = 40;
	var FUTURE_SEGWIT_MIN_SIZE = 2;
	var FUTURE_SEGWIT_MAX_VERSION = 16;
	var FUTURE_SEGWIT_MIN_VERSION = 2;
	var FUTURE_SEGWIT_VERSION_DIFF = 80;
	var FUTURE_SEGWIT_VERSION_WARNING = "WARNING: Sending to a future segwit version address can lead to loss of funds. End users MUST be warned carefully in the GUI and asked if they wish to proceed with caution. Wallets should verify the segwit version from the output of fromBech32, then decide when it is safe to use which version of segwit.";
	function _toFutureSegwitAddress(output, network) {
		const data = output.slice(2);
		if (data.length < FUTURE_SEGWIT_MIN_SIZE || data.length > FUTURE_SEGWIT_MAX_SIZE) throw new TypeError("Invalid program length for segwit address");
		const version = output[0] - FUTURE_SEGWIT_VERSION_DIFF;
		if (version < FUTURE_SEGWIT_MIN_VERSION || version > FUTURE_SEGWIT_MAX_VERSION) throw new TypeError("Invalid version for segwit address");
		if (output[1] !== data.length) throw new TypeError("Invalid script for segwit address");
		console.warn(FUTURE_SEGWIT_VERSION_WARNING);
		return toBech32(data, version, network.bech32);
	}
	/**
	* decode address with base58 specification,  return address version and address hash if valid
	*/
	function fromBase58Check(address) {
		const payload = Buffer.from(bs58check.decode(address));
		if (payload.length < 21) throw new TypeError(address + " is too short");
		if (payload.length > 21) throw new TypeError(address + " is too long");
		return {
			version: payload.readUInt8(0),
			hash: payload.slice(1)
		};
	}
	exports.fromBase58Check = fromBase58Check;
	/**
	* decode address with bech32 specification,  return address version、address prefix and address data if valid
	*/
	function fromBech32(address) {
		let result;
		let version;
		try {
			result = bech32_1.bech32.decode(address);
		} catch (e) {}
		if (result) {
			version = result.words[0];
			if (version !== 0) throw new TypeError(address + " uses wrong encoding");
		} else {
			result = bech32_1.bech32m.decode(address);
			version = result.words[0];
			if (version === 0) throw new TypeError(address + " uses wrong encoding");
		}
		const data = bech32_1.bech32.fromWords(result.words.slice(1));
		return {
			version,
			prefix: result.prefix,
			data: Buffer.from(data)
		};
	}
	exports.fromBech32 = fromBech32;
	/**
	* encode address hash to base58 address with version
	*/
	function toBase58Check(hash, version) {
		(0, types_1.typeforce)((0, types_1.tuple)(types_1.Hash160bit, types_1.UInt8), arguments);
		const payload = Buffer.allocUnsafe(21);
		payload.writeUInt8(version, 0);
		hash.copy(payload, 1);
		return bs58check.encode(payload);
	}
	exports.toBase58Check = toBase58Check;
	/**
	* encode address hash to bech32 address with version and prefix
	*/
	function toBech32(data, version, prefix) {
		const words = bech32_1.bech32.toWords(data);
		words.unshift(version);
		return version === 0 ? bech32_1.bech32.encode(prefix, words) : bech32_1.bech32m.encode(prefix, words);
	}
	exports.toBech32 = toBech32;
	/**
	* decode address from output script with network, return address if matched
	*/
	function fromOutputScript(output, network) {
		network = network || networks.bitcoin;
		try {
			return payments.p2pkh({
				output,
				network
			}).address;
		} catch (e) {}
		try {
			return payments.p2sh({
				output,
				network
			}).address;
		} catch (e) {}
		try {
			return payments.p2wpkh({
				output,
				network
			}).address;
		} catch (e) {}
		try {
			return payments.p2wsh({
				output,
				network
			}).address;
		} catch (e) {}
		try {
			return payments.p2tr({
				output,
				network
			}).address;
		} catch (e) {}
		try {
			return _toFutureSegwitAddress(output, network);
		} catch (e) {}
		throw new Error(bscript.toASM(output) + " has no matching Address");
	}
	exports.fromOutputScript = fromOutputScript;
	/**
	* encodes address to output script with network, return output script if address matched
	*/
	function toOutputScript(address, network) {
		network = network || networks.bitcoin;
		let decodeBase58;
		let decodeBech32;
		try {
			decodeBase58 = fromBase58Check(address);
		} catch (e) {}
		if (decodeBase58) {
			if (decodeBase58.version === network.pubKeyHash) return payments.p2pkh({ hash: decodeBase58.hash }).output;
			if (decodeBase58.version === network.scriptHash) return payments.p2sh({ hash: decodeBase58.hash }).output;
		} else {
			try {
				decodeBech32 = fromBech32(address);
			} catch (e) {}
			if (decodeBech32) {
				if (decodeBech32.prefix !== network.bech32) throw new Error(address + " has an invalid prefix");
				if (decodeBech32.version === 0) {
					if (decodeBech32.data.length === 20) return payments.p2wpkh({ hash: decodeBech32.data }).output;
					if (decodeBech32.data.length === 32) return payments.p2wsh({ hash: decodeBech32.data }).output;
				} else if (decodeBech32.version === 1) {
					if (decodeBech32.data.length === 32) return payments.p2tr({ pubkey: decodeBech32.data }).output;
				} else if (decodeBech32.version >= FUTURE_SEGWIT_MIN_VERSION && decodeBech32.version <= FUTURE_SEGWIT_MAX_VERSION && decodeBech32.data.length >= FUTURE_SEGWIT_MIN_SIZE && decodeBech32.data.length <= FUTURE_SEGWIT_MAX_SIZE) {
					console.warn(FUTURE_SEGWIT_VERSION_WARNING);
					return bscript.compile([decodeBech32.version + FUTURE_SEGWIT_VERSION_DIFF, decodeBech32.data]);
				}
			}
		}
		throw new Error(address + " has no matching Script");
	}
	exports.toOutputScript = toOutputScript;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/merkle.js
var require_merkle = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fastMerkleRoot = void 0;
	/**
	* Calculates the Merkle root of an array of buffers using a specified digest function.
	*
	* @param values - The array of buffers.
	* @param digestFn - The digest function used to calculate the hash of the concatenated buffers.
	* @returns The Merkle root as a buffer.
	* @throws {TypeError} If the values parameter is not an array or the digestFn parameter is not a function.
	*/
	function fastMerkleRoot(values, digestFn) {
		if (!Array.isArray(values)) throw TypeError("Expected values Array");
		if (typeof digestFn !== "function") throw TypeError("Expected digest Function");
		let length = values.length;
		const results = values.concat();
		while (length > 1) {
			let j = 0;
			for (let i = 0; i < length; i += 2, ++j) {
				const left = results[i];
				const right = i + 1 === length ? left : results[i + 1];
				const data = Buffer.concat([left, right]);
				results[j] = digestFn(data);
			}
			length = j;
		}
		return results[0];
	}
	exports.fastMerkleRoot = fastMerkleRoot;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/transaction.js
var require_transaction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Transaction = void 0;
	var bufferutils_1 = require_bufferutils();
	var bcrypto = require_crypto();
	var bscript = require_script();
	var script_1 = require_script();
	var types = require_types();
	var { typeforce } = types;
	function varSliceSize(someScript) {
		const length = someScript.length;
		return bufferutils_1.varuint.encodingLength(length) + length;
	}
	function vectorSize(someVector) {
		const length = someVector.length;
		return bufferutils_1.varuint.encodingLength(length) + someVector.reduce((sum, witness) => {
			return sum + varSliceSize(witness);
		}, 0);
	}
	var EMPTY_BUFFER = Buffer.allocUnsafe(0);
	var EMPTY_WITNESS = [];
	var ZERO = Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex");
	var ONE = Buffer.from("0000000000000000000000000000000000000000000000000000000000000001", "hex");
	var BLANK_OUTPUT = {
		script: EMPTY_BUFFER,
		valueBuffer: Buffer.from("ffffffffffffffff", "hex")
	};
	function isOutput(out) {
		return out.value !== void 0;
	}
	/**
	* Represents a Bitcoin transaction.
	*/
	var Transaction = class Transaction {
		constructor() {
			this.version = 1;
			this.locktime = 0;
			this.ins = [];
			this.outs = [];
		}
		static fromBuffer(buffer, _NO_STRICT) {
			const bufferReader = new bufferutils_1.BufferReader(buffer);
			const tx = new Transaction();
			tx.version = bufferReader.readInt32();
			const marker = bufferReader.readUInt8();
			const flag = bufferReader.readUInt8();
			let hasWitnesses = false;
			if (marker === Transaction.ADVANCED_TRANSACTION_MARKER && flag === Transaction.ADVANCED_TRANSACTION_FLAG) hasWitnesses = true;
			else bufferReader.offset -= 2;
			const vinLen = bufferReader.readVarInt();
			for (let i = 0; i < vinLen; ++i) tx.ins.push({
				hash: bufferReader.readSlice(32),
				index: bufferReader.readUInt32(),
				script: bufferReader.readVarSlice(),
				sequence: bufferReader.readUInt32(),
				witness: EMPTY_WITNESS
			});
			const voutLen = bufferReader.readVarInt();
			for (let i = 0; i < voutLen; ++i) tx.outs.push({
				value: bufferReader.readUInt64(),
				script: bufferReader.readVarSlice()
			});
			if (hasWitnesses) {
				for (let i = 0; i < vinLen; ++i) tx.ins[i].witness = bufferReader.readVector();
				if (!tx.hasWitnesses()) throw new Error("Transaction has superfluous witness data");
			}
			tx.locktime = bufferReader.readUInt32();
			if (_NO_STRICT) return tx;
			if (bufferReader.offset !== buffer.length) throw new Error("Transaction has unexpected data");
			return tx;
		}
		static fromHex(hex) {
			return Transaction.fromBuffer(Buffer.from(hex, "hex"), false);
		}
		static isCoinbaseHash(buffer) {
			typeforce(types.Hash256bit, buffer);
			for (let i = 0; i < 32; ++i) if (buffer[i] !== 0) return false;
			return true;
		}
		isCoinbase() {
			return this.ins.length === 1 && Transaction.isCoinbaseHash(this.ins[0].hash);
		}
		addInput(hash, index, sequence, scriptSig) {
			typeforce(types.tuple(types.Hash256bit, types.UInt32, types.maybe(types.UInt32), types.maybe(types.Buffer)), arguments);
			if (types.Null(sequence)) sequence = Transaction.DEFAULT_SEQUENCE;
			return this.ins.push({
				hash,
				index,
				script: scriptSig || EMPTY_BUFFER,
				sequence,
				witness: EMPTY_WITNESS
			}) - 1;
		}
		addOutput(scriptPubKey, value) {
			typeforce(types.tuple(types.Buffer, types.Satoshi), arguments);
			return this.outs.push({
				script: scriptPubKey,
				value
			}) - 1;
		}
		hasWitnesses() {
			return this.ins.some((x) => {
				return x.witness.length !== 0;
			});
		}
		stripWitnesses() {
			this.ins.forEach((input) => {
				input.witness = EMPTY_WITNESS;
			});
		}
		weight() {
			const base = this.byteLength(false);
			const total = this.byteLength(true);
			return base * 3 + total;
		}
		virtualSize() {
			return Math.ceil(this.weight() / 4);
		}
		byteLength(_ALLOW_WITNESS = true) {
			const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
			return (hasWitnesses ? 10 : 8) + bufferutils_1.varuint.encodingLength(this.ins.length) + bufferutils_1.varuint.encodingLength(this.outs.length) + this.ins.reduce((sum, input) => {
				return sum + 40 + varSliceSize(input.script);
			}, 0) + this.outs.reduce((sum, output) => {
				return sum + 8 + varSliceSize(output.script);
			}, 0) + (hasWitnesses ? this.ins.reduce((sum, input) => {
				return sum + vectorSize(input.witness);
			}, 0) : 0);
		}
		clone() {
			const newTx = new Transaction();
			newTx.version = this.version;
			newTx.locktime = this.locktime;
			newTx.ins = this.ins.map((txIn) => {
				return {
					hash: txIn.hash,
					index: txIn.index,
					script: txIn.script,
					sequence: txIn.sequence,
					witness: txIn.witness
				};
			});
			newTx.outs = this.outs.map((txOut) => {
				return {
					script: txOut.script,
					value: txOut.value
				};
			});
			return newTx;
		}
		/**
		* Hash transaction for signing a specific input.
		*
		* Bitcoin uses a different hash for each signed transaction input.
		* This method copies the transaction, makes the necessary changes based on the
		* hashType, and then hashes the result.
		* This hash can then be used to sign the provided transaction input.
		*/
		hashForSignature(inIndex, prevOutScript, hashType) {
			typeforce(types.tuple(types.UInt32, types.Buffer, types.Number), arguments);
			if (inIndex >= this.ins.length) return ONE;
			const ourScript = bscript.compile(bscript.decompile(prevOutScript).filter((x) => {
				return x !== script_1.OPS.OP_CODESEPARATOR;
			}));
			const txTmp = this.clone();
			if ((hashType & 31) === Transaction.SIGHASH_NONE) {
				txTmp.outs = [];
				txTmp.ins.forEach((input, i) => {
					if (i === inIndex) return;
					input.sequence = 0;
				});
			} else if ((hashType & 31) === Transaction.SIGHASH_SINGLE) {
				if (inIndex >= this.outs.length) return ONE;
				txTmp.outs.length = inIndex + 1;
				for (let i = 0; i < inIndex; i++) txTmp.outs[i] = BLANK_OUTPUT;
				txTmp.ins.forEach((input, y) => {
					if (y === inIndex) return;
					input.sequence = 0;
				});
			}
			if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
				txTmp.ins = [txTmp.ins[inIndex]];
				txTmp.ins[0].script = ourScript;
			} else {
				txTmp.ins.forEach((input) => {
					input.script = EMPTY_BUFFER;
				});
				txTmp.ins[inIndex].script = ourScript;
			}
			const buffer = Buffer.allocUnsafe(txTmp.byteLength(false) + 4);
			buffer.writeInt32LE(hashType, buffer.length - 4);
			txTmp.__toBuffer(buffer, 0, false);
			return bcrypto.hash256(buffer);
		}
		hashForWitnessV1(inIndex, prevOutScripts, values, hashType, leafHash, annex) {
			typeforce(types.tuple(types.UInt32, typeforce.arrayOf(types.Buffer), typeforce.arrayOf(types.Satoshi), types.UInt32), arguments);
			if (values.length !== this.ins.length || prevOutScripts.length !== this.ins.length) throw new Error("Must supply prevout script and value for all inputs");
			const outputType = hashType === Transaction.SIGHASH_DEFAULT ? Transaction.SIGHASH_ALL : hashType & Transaction.SIGHASH_OUTPUT_MASK;
			const isAnyoneCanPay = (hashType & Transaction.SIGHASH_INPUT_MASK) === Transaction.SIGHASH_ANYONECANPAY;
			const isNone = outputType === Transaction.SIGHASH_NONE;
			const isSingle = outputType === Transaction.SIGHASH_SINGLE;
			let hashPrevouts = EMPTY_BUFFER;
			let hashAmounts = EMPTY_BUFFER;
			let hashScriptPubKeys = EMPTY_BUFFER;
			let hashSequences = EMPTY_BUFFER;
			let hashOutputs = EMPTY_BUFFER;
			if (!isAnyoneCanPay) {
				let bufferWriter = bufferutils_1.BufferWriter.withCapacity(36 * this.ins.length);
				this.ins.forEach((txIn) => {
					bufferWriter.writeSlice(txIn.hash);
					bufferWriter.writeUInt32(txIn.index);
				});
				hashPrevouts = bcrypto.sha256(bufferWriter.end());
				bufferWriter = bufferutils_1.BufferWriter.withCapacity(8 * this.ins.length);
				values.forEach((value) => bufferWriter.writeUInt64(value));
				hashAmounts = bcrypto.sha256(bufferWriter.end());
				bufferWriter = bufferutils_1.BufferWriter.withCapacity(prevOutScripts.map(varSliceSize).reduce((a, b) => a + b));
				prevOutScripts.forEach((prevOutScript) => bufferWriter.writeVarSlice(prevOutScript));
				hashScriptPubKeys = bcrypto.sha256(bufferWriter.end());
				bufferWriter = bufferutils_1.BufferWriter.withCapacity(4 * this.ins.length);
				this.ins.forEach((txIn) => bufferWriter.writeUInt32(txIn.sequence));
				hashSequences = bcrypto.sha256(bufferWriter.end());
			}
			if (!(isNone || isSingle)) {
				const txOutsSize = this.outs.map((output) => 8 + varSliceSize(output.script)).reduce((a, b) => a + b);
				const bufferWriter = bufferutils_1.BufferWriter.withCapacity(txOutsSize);
				this.outs.forEach((out) => {
					bufferWriter.writeUInt64(out.value);
					bufferWriter.writeVarSlice(out.script);
				});
				hashOutputs = bcrypto.sha256(bufferWriter.end());
			} else if (isSingle && inIndex < this.outs.length) {
				const output = this.outs[inIndex];
				const bufferWriter = bufferutils_1.BufferWriter.withCapacity(8 + varSliceSize(output.script));
				bufferWriter.writeUInt64(output.value);
				bufferWriter.writeVarSlice(output.script);
				hashOutputs = bcrypto.sha256(bufferWriter.end());
			}
			const spendType = (leafHash ? 2 : 0) + (annex ? 1 : 0);
			const sigMsgSize = 174 - (isAnyoneCanPay ? 49 : 0) - (isNone ? 32 : 0) + (annex ? 32 : 0) + (leafHash ? 37 : 0);
			const sigMsgWriter = bufferutils_1.BufferWriter.withCapacity(sigMsgSize);
			sigMsgWriter.writeUInt8(hashType);
			sigMsgWriter.writeInt32(this.version);
			sigMsgWriter.writeUInt32(this.locktime);
			sigMsgWriter.writeSlice(hashPrevouts);
			sigMsgWriter.writeSlice(hashAmounts);
			sigMsgWriter.writeSlice(hashScriptPubKeys);
			sigMsgWriter.writeSlice(hashSequences);
			if (!(isNone || isSingle)) sigMsgWriter.writeSlice(hashOutputs);
			sigMsgWriter.writeUInt8(spendType);
			if (isAnyoneCanPay) {
				const input = this.ins[inIndex];
				sigMsgWriter.writeSlice(input.hash);
				sigMsgWriter.writeUInt32(input.index);
				sigMsgWriter.writeUInt64(values[inIndex]);
				sigMsgWriter.writeVarSlice(prevOutScripts[inIndex]);
				sigMsgWriter.writeUInt32(input.sequence);
			} else sigMsgWriter.writeUInt32(inIndex);
			if (annex) {
				const bufferWriter = bufferutils_1.BufferWriter.withCapacity(varSliceSize(annex));
				bufferWriter.writeVarSlice(annex);
				sigMsgWriter.writeSlice(bcrypto.sha256(bufferWriter.end()));
			}
			if (isSingle) sigMsgWriter.writeSlice(hashOutputs);
			if (leafHash) {
				sigMsgWriter.writeSlice(leafHash);
				sigMsgWriter.writeUInt8(0);
				sigMsgWriter.writeUInt32(4294967295);
			}
			return bcrypto.taggedHash("TapSighash", Buffer.concat([Buffer.from([0]), sigMsgWriter.end()]));
		}
		hashForWitnessV0(inIndex, prevOutScript, value, hashType) {
			typeforce(types.tuple(types.UInt32, types.Buffer, types.Satoshi, types.UInt32), arguments);
			let tbuffer = Buffer.from([]);
			let bufferWriter;
			let hashOutputs = ZERO;
			let hashPrevouts = ZERO;
			let hashSequence = ZERO;
			if (!(hashType & Transaction.SIGHASH_ANYONECANPAY)) {
				tbuffer = Buffer.allocUnsafe(36 * this.ins.length);
				bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
				this.ins.forEach((txIn) => {
					bufferWriter.writeSlice(txIn.hash);
					bufferWriter.writeUInt32(txIn.index);
				});
				hashPrevouts = bcrypto.hash256(tbuffer);
			}
			if (!(hashType & Transaction.SIGHASH_ANYONECANPAY) && (hashType & 31) !== Transaction.SIGHASH_SINGLE && (hashType & 31) !== Transaction.SIGHASH_NONE) {
				tbuffer = Buffer.allocUnsafe(4 * this.ins.length);
				bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
				this.ins.forEach((txIn) => {
					bufferWriter.writeUInt32(txIn.sequence);
				});
				hashSequence = bcrypto.hash256(tbuffer);
			}
			if ((hashType & 31) !== Transaction.SIGHASH_SINGLE && (hashType & 31) !== Transaction.SIGHASH_NONE) {
				const txOutsSize = this.outs.reduce((sum, output) => {
					return sum + 8 + varSliceSize(output.script);
				}, 0);
				tbuffer = Buffer.allocUnsafe(txOutsSize);
				bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
				this.outs.forEach((out) => {
					bufferWriter.writeUInt64(out.value);
					bufferWriter.writeVarSlice(out.script);
				});
				hashOutputs = bcrypto.hash256(tbuffer);
			} else if ((hashType & 31) === Transaction.SIGHASH_SINGLE && inIndex < this.outs.length) {
				const output = this.outs[inIndex];
				tbuffer = Buffer.allocUnsafe(8 + varSliceSize(output.script));
				bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
				bufferWriter.writeUInt64(output.value);
				bufferWriter.writeVarSlice(output.script);
				hashOutputs = bcrypto.hash256(tbuffer);
			}
			tbuffer = Buffer.allocUnsafe(156 + varSliceSize(prevOutScript));
			bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
			const input = this.ins[inIndex];
			bufferWriter.writeInt32(this.version);
			bufferWriter.writeSlice(hashPrevouts);
			bufferWriter.writeSlice(hashSequence);
			bufferWriter.writeSlice(input.hash);
			bufferWriter.writeUInt32(input.index);
			bufferWriter.writeVarSlice(prevOutScript);
			bufferWriter.writeUInt64(value);
			bufferWriter.writeUInt32(input.sequence);
			bufferWriter.writeSlice(hashOutputs);
			bufferWriter.writeUInt32(this.locktime);
			bufferWriter.writeUInt32(hashType);
			return bcrypto.hash256(tbuffer);
		}
		getHash(forWitness) {
			if (forWitness && this.isCoinbase()) return Buffer.alloc(32, 0);
			return bcrypto.hash256(this.__toBuffer(void 0, void 0, forWitness));
		}
		getId() {
			return (0, bufferutils_1.reverseBuffer)(this.getHash(false)).toString("hex");
		}
		toBuffer(buffer, initialOffset) {
			return this.__toBuffer(buffer, initialOffset, true);
		}
		toHex() {
			return this.toBuffer(void 0, void 0).toString("hex");
		}
		setInputScript(index, scriptSig) {
			typeforce(types.tuple(types.Number, types.Buffer), arguments);
			this.ins[index].script = scriptSig;
		}
		setWitness(index, witness) {
			typeforce(types.tuple(types.Number, [types.Buffer]), arguments);
			this.ins[index].witness = witness;
		}
		__toBuffer(buffer, initialOffset, _ALLOW_WITNESS = false) {
			if (!buffer) buffer = Buffer.allocUnsafe(this.byteLength(_ALLOW_WITNESS));
			const bufferWriter = new bufferutils_1.BufferWriter(buffer, initialOffset || 0);
			bufferWriter.writeInt32(this.version);
			const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
			if (hasWitnesses) {
				bufferWriter.writeUInt8(Transaction.ADVANCED_TRANSACTION_MARKER);
				bufferWriter.writeUInt8(Transaction.ADVANCED_TRANSACTION_FLAG);
			}
			bufferWriter.writeVarInt(this.ins.length);
			this.ins.forEach((txIn) => {
				bufferWriter.writeSlice(txIn.hash);
				bufferWriter.writeUInt32(txIn.index);
				bufferWriter.writeVarSlice(txIn.script);
				bufferWriter.writeUInt32(txIn.sequence);
			});
			bufferWriter.writeVarInt(this.outs.length);
			this.outs.forEach((txOut) => {
				if (isOutput(txOut)) bufferWriter.writeUInt64(txOut.value);
				else bufferWriter.writeSlice(txOut.valueBuffer);
				bufferWriter.writeVarSlice(txOut.script);
			});
			if (hasWitnesses) this.ins.forEach((input) => {
				bufferWriter.writeVector(input.witness);
			});
			bufferWriter.writeUInt32(this.locktime);
			if (initialOffset !== void 0) return buffer.slice(initialOffset, bufferWriter.offset);
			return buffer;
		}
	};
	exports.Transaction = Transaction;
	Transaction.DEFAULT_SEQUENCE = 4294967295;
	Transaction.SIGHASH_DEFAULT = 0;
	Transaction.SIGHASH_ALL = 1;
	Transaction.SIGHASH_NONE = 2;
	Transaction.SIGHASH_SINGLE = 3;
	Transaction.SIGHASH_ANYONECANPAY = 128;
	Transaction.SIGHASH_OUTPUT_MASK = 3;
	Transaction.SIGHASH_INPUT_MASK = 128;
	Transaction.ADVANCED_TRANSACTION_MARKER = 0;
	Transaction.ADVANCED_TRANSACTION_FLAG = 1;
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/block.js
var require_block = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Block = void 0;
	var bufferutils_1 = require_bufferutils();
	var bcrypto = require_crypto();
	var merkle_1 = require_merkle();
	var transaction_1 = require_transaction();
	var types = require_types();
	var { typeforce } = types;
	var errorMerkleNoTxes = /* @__PURE__ */ new TypeError("Cannot compute merkle root for zero transactions");
	var errorWitnessNotSegwit = /* @__PURE__ */ new TypeError("Cannot compute witness commit for non-segwit block");
	exports.Block = class Block {
		constructor() {
			this.version = 1;
			this.prevHash = void 0;
			this.merkleRoot = void 0;
			this.timestamp = 0;
			this.witnessCommit = void 0;
			this.bits = 0;
			this.nonce = 0;
			this.transactions = void 0;
		}
		static fromBuffer(buffer) {
			if (buffer.length < 80) throw new Error("Buffer too small (< 80 bytes)");
			const bufferReader = new bufferutils_1.BufferReader(buffer);
			const block = new Block();
			block.version = bufferReader.readInt32();
			block.prevHash = bufferReader.readSlice(32);
			block.merkleRoot = bufferReader.readSlice(32);
			block.timestamp = bufferReader.readUInt32();
			block.bits = bufferReader.readUInt32();
			block.nonce = bufferReader.readUInt32();
			if (buffer.length === 80) return block;
			const readTransaction = () => {
				const tx = transaction_1.Transaction.fromBuffer(bufferReader.buffer.slice(bufferReader.offset), true);
				bufferReader.offset += tx.byteLength();
				return tx;
			};
			const nTransactions = bufferReader.readVarInt();
			block.transactions = [];
			for (let i = 0; i < nTransactions; ++i) {
				const tx = readTransaction();
				block.transactions.push(tx);
			}
			const witnessCommit = block.getWitnessCommit();
			if (witnessCommit) block.witnessCommit = witnessCommit;
			return block;
		}
		static fromHex(hex) {
			return Block.fromBuffer(Buffer.from(hex, "hex"));
		}
		static calculateTarget(bits) {
			const exponent = ((bits & 4278190080) >> 24) - 3;
			const mantissa = bits & 8388607;
			const target = Buffer.alloc(32, 0);
			target.writeUIntBE(mantissa, 29 - exponent, 3);
			return target;
		}
		static calculateMerkleRoot(transactions, forWitness) {
			typeforce([{ getHash: types.Function }], transactions);
			if (transactions.length === 0) throw errorMerkleNoTxes;
			if (forWitness && !txesHaveWitnessCommit(transactions)) throw errorWitnessNotSegwit;
			const hashes = transactions.map((transaction) => transaction.getHash(forWitness));
			const rootHash = (0, merkle_1.fastMerkleRoot)(hashes, bcrypto.hash256);
			return forWitness ? bcrypto.hash256(Buffer.concat([rootHash, transactions[0].ins[0].witness[0]])) : rootHash;
		}
		getWitnessCommit() {
			if (!txesHaveWitnessCommit(this.transactions)) return null;
			const witnessCommits = this.transactions[0].outs.filter((out) => out.script.slice(0, 6).equals(Buffer.from("6a24aa21a9ed", "hex"))).map((out) => out.script.slice(6, 38));
			if (witnessCommits.length === 0) return null;
			const result = witnessCommits[witnessCommits.length - 1];
			if (!(result instanceof Buffer && result.length === 32)) return null;
			return result;
		}
		hasWitnessCommit() {
			if (this.witnessCommit instanceof Buffer && this.witnessCommit.length === 32) return true;
			if (this.getWitnessCommit() !== null) return true;
			return false;
		}
		hasWitness() {
			return anyTxHasWitness(this.transactions);
		}
		weight() {
			const base = this.byteLength(false, false);
			const total = this.byteLength(false, true);
			return base * 3 + total;
		}
		byteLength(headersOnly, allowWitness = true) {
			if (headersOnly || !this.transactions) return 80;
			return 80 + bufferutils_1.varuint.encodingLength(this.transactions.length) + this.transactions.reduce((a, x) => a + x.byteLength(allowWitness), 0);
		}
		getHash() {
			return bcrypto.hash256(this.toBuffer(true));
		}
		getId() {
			return (0, bufferutils_1.reverseBuffer)(this.getHash()).toString("hex");
		}
		getUTCDate() {
			const date = /* @__PURE__ */ new Date(0);
			date.setUTCSeconds(this.timestamp);
			return date;
		}
		toBuffer(headersOnly) {
			const buffer = Buffer.allocUnsafe(this.byteLength(headersOnly));
			const bufferWriter = new bufferutils_1.BufferWriter(buffer);
			bufferWriter.writeInt32(this.version);
			bufferWriter.writeSlice(this.prevHash);
			bufferWriter.writeSlice(this.merkleRoot);
			bufferWriter.writeUInt32(this.timestamp);
			bufferWriter.writeUInt32(this.bits);
			bufferWriter.writeUInt32(this.nonce);
			if (headersOnly || !this.transactions) return buffer;
			bufferutils_1.varuint.encode(this.transactions.length, buffer, bufferWriter.offset);
			bufferWriter.offset += bufferutils_1.varuint.encode.bytes;
			this.transactions.forEach((tx) => {
				const txSize = tx.byteLength();
				tx.toBuffer(buffer, bufferWriter.offset);
				bufferWriter.offset += txSize;
			});
			return buffer;
		}
		toHex(headersOnly) {
			return this.toBuffer(headersOnly).toString("hex");
		}
		checkTxRoots() {
			const hasWitnessCommit = this.hasWitnessCommit();
			if (!hasWitnessCommit && this.hasWitness()) return false;
			return this.__checkMerkleRoot() && (hasWitnessCommit ? this.__checkWitnessCommit() : true);
		}
		checkProofOfWork() {
			const hash = (0, bufferutils_1.reverseBuffer)(this.getHash());
			const target = Block.calculateTarget(this.bits);
			return hash.compare(target) <= 0;
		}
		__checkMerkleRoot() {
			if (!this.transactions) throw errorMerkleNoTxes;
			const actualMerkleRoot = Block.calculateMerkleRoot(this.transactions);
			return this.merkleRoot.compare(actualMerkleRoot) === 0;
		}
		__checkWitnessCommit() {
			if (!this.transactions) throw errorMerkleNoTxes;
			if (!this.hasWitnessCommit()) throw errorWitnessNotSegwit;
			const actualWitnessCommit = Block.calculateMerkleRoot(this.transactions, true);
			return this.witnessCommit.compare(actualWitnessCommit) === 0;
		}
	};
	function txesHaveWitnessCommit(transactions) {
		return transactions instanceof Array && transactions[0] && transactions[0].ins && transactions[0].ins instanceof Array && transactions[0].ins[0] && transactions[0].ins[0].witness && transactions[0].ins[0].witness instanceof Array && transactions[0].ins[0].witness.length > 0;
	}
	function anyTxHasWitness(transactions) {
		return transactions instanceof Array && transactions.some((tx) => typeof tx === "object" && tx.ins instanceof Array && tx.ins.some((input) => typeof input === "object" && input.witness instanceof Array && input.witness.length > 0));
	}
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/psbt/psbtutils.js
var require_psbtutils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.signatureBlocksAction = exports.checkInputForSig = exports.pubkeyInScript = exports.pubkeyPositionInScript = exports.witnessStackToScriptWitness = exports.isP2TR = exports.isP2SHScript = exports.isP2WSHScript = exports.isP2WPKH = exports.isP2PKH = exports.isP2PK = exports.isP2MS = void 0;
	var varuint = require_varint();
	var bscript = require_script();
	var transaction_1 = require_transaction();
	var crypto_1 = require_crypto();
	var payments = require_payments();
	function isPaymentFactory(payment) {
		return (script) => {
			try {
				payment({ output: script });
				return true;
			} catch (err) {
				return false;
			}
		};
	}
	exports.isP2MS = isPaymentFactory(payments.p2ms);
	exports.isP2PK = isPaymentFactory(payments.p2pk);
	exports.isP2PKH = isPaymentFactory(payments.p2pkh);
	exports.isP2WPKH = isPaymentFactory(payments.p2wpkh);
	exports.isP2WSHScript = isPaymentFactory(payments.p2wsh);
	exports.isP2SHScript = isPaymentFactory(payments.p2sh);
	exports.isP2TR = isPaymentFactory(payments.p2tr);
	/**
	* Converts a witness stack to a script witness.
	* @param witness The witness stack to convert.
	* @returns The script witness as a Buffer.
	*/
	/**
	* Converts a witness stack to a script witness.
	* @param witness The witness stack to convert.
	* @returns The converted script witness.
	*/
	function witnessStackToScriptWitness(witness) {
		let buffer = Buffer.allocUnsafe(0);
		function writeSlice(slice) {
			buffer = Buffer.concat([buffer, Buffer.from(slice)]);
		}
		function writeVarInt(i) {
			const currentLen = buffer.length;
			const varintLen = varuint.encodingLength(i);
			buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
			varuint.encode(i, buffer, currentLen);
		}
		function writeVarSlice(slice) {
			writeVarInt(slice.length);
			writeSlice(slice);
		}
		function writeVector(vector) {
			writeVarInt(vector.length);
			vector.forEach(writeVarSlice);
		}
		writeVector(witness);
		return buffer;
	}
	exports.witnessStackToScriptWitness = witnessStackToScriptWitness;
	/**
	* Finds the position of a public key in a script.
	* @param pubkey The public key to search for.
	* @param script The script to search in.
	* @returns The index of the public key in the script, or -1 if not found.
	* @throws {Error} If there is an unknown script error.
	*/
	function pubkeyPositionInScript(pubkey, script) {
		const pubkeyHash = (0, crypto_1.hash160)(pubkey);
		const pubkeyXOnly = pubkey.slice(1, 33);
		const decompiled = bscript.decompile(script);
		if (decompiled === null) throw new Error("Unknown script error");
		return decompiled.findIndex((element) => {
			if (typeof element === "number") return false;
			return element.equals(pubkey) || element.equals(pubkeyHash) || element.equals(pubkeyXOnly);
		});
	}
	exports.pubkeyPositionInScript = pubkeyPositionInScript;
	/**
	* Checks if a public key is present in a script.
	* @param pubkey The public key to check.
	* @param script The script to search in.
	* @returns A boolean indicating whether the public key is present in the script.
	*/
	function pubkeyInScript(pubkey, script) {
		return pubkeyPositionInScript(pubkey, script) !== -1;
	}
	exports.pubkeyInScript = pubkeyInScript;
	/**
	* Checks if an input contains a signature for a specific action.
	* @param input - The input to check.
	* @param action - The action to check for.
	* @returns A boolean indicating whether the input contains a signature for the specified action.
	*/
	function checkInputForSig(input, action) {
		return extractPartialSigs(input).some((pSig) => signatureBlocksAction(pSig, bscript.signature.decode, action));
	}
	exports.checkInputForSig = checkInputForSig;
	/**
	* Determines if a given action is allowed for a signature block.
	* @param signature - The signature block.
	* @param signatureDecodeFn - The function used to decode the signature.
	* @param action - The action to be checked.
	* @returns True if the action is allowed, false otherwise.
	*/
	function signatureBlocksAction(signature, signatureDecodeFn, action) {
		const { hashType } = signatureDecodeFn(signature);
		const whitelist = [];
		if (hashType & transaction_1.Transaction.SIGHASH_ANYONECANPAY) whitelist.push("addInput");
		switch (hashType & 31) {
			case transaction_1.Transaction.SIGHASH_ALL: break;
			case transaction_1.Transaction.SIGHASH_SINGLE:
			case transaction_1.Transaction.SIGHASH_NONE:
				whitelist.push("addOutput");
				whitelist.push("setInputSequence");
		}
		if (whitelist.indexOf(action) === -1) return true;
		return false;
	}
	exports.signatureBlocksAction = signatureBlocksAction;
	/**
	* Extracts the signatures from a PsbtInput object.
	* If the input has partial signatures, it returns an array of the signatures.
	* If the input does not have partial signatures, it checks if it has a finalScriptSig or finalScriptWitness.
	* If it does, it extracts the signatures from the final scripts and returns them.
	* If none of the above conditions are met, it returns an empty array.
	*
	* @param input - The PsbtInput object from which to extract the signatures.
	* @returns An array of signatures extracted from the PsbtInput object.
	*/
	function extractPartialSigs(input) {
		let pSigs = [];
		if ((input.partialSig || []).length === 0) {
			if (!input.finalScriptSig && !input.finalScriptWitness) return [];
			pSigs = getPsigsFromInputFinalScripts(input);
		} else pSigs = input.partialSig;
		return pSigs.map((p) => p.signature);
	}
	/**
	* Retrieves the partial signatures (Psigs) from the input's final scripts.
	* Psigs are extracted from both the final scriptSig and final scriptWitness of the input.
	* Only canonical script signatures are considered.
	*
	* @param input - The PsbtInput object representing the input.
	* @returns An array of PartialSig objects containing the extracted Psigs.
	*/
	function getPsigsFromInputFinalScripts(input) {
		const scriptItems = !input.finalScriptSig ? [] : bscript.decompile(input.finalScriptSig) || [];
		const witnessItems = !input.finalScriptWitness ? [] : bscript.decompile(input.finalScriptWitness) || [];
		return scriptItems.concat(witnessItems).filter((item) => {
			return Buffer.isBuffer(item) && bscript.isCanonicalScriptSignature(item);
		}).map((sig) => ({ signature: sig }));
	}
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/psbt/bip371.js
var require_bip371 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.checkTaprootInputForSigs = exports.tapTreeFromList = exports.tapTreeToList = exports.tweakInternalPubKey = exports.checkTaprootOutputFields = exports.checkTaprootInputFields = exports.isTaprootOutput = exports.isTaprootInput = exports.serializeTaprootSignature = exports.tapScriptFinalizer = exports.toXOnly = void 0;
	var types_1 = require_types();
	var transaction_1 = require_transaction();
	var psbtutils_1 = require_psbtutils();
	var bip341_1 = require_bip341();
	var payments_1 = require_payments();
	var psbtutils_2 = require_psbtutils();
	var toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
	exports.toXOnly = toXOnly;
	/**
	* Default tapscript finalizer. It searches for the `tapLeafHashToFinalize` if provided.
	* Otherwise it will search for the tapleaf that has at least one signature and has the shortest path.
	* @param inputIndex the position of the PSBT input.
	* @param input the PSBT input.
	* @param tapLeafHashToFinalize optional, if provided the finalizer will search for a tapleaf that has this hash
	*                              and will try to build the finalScriptWitness.
	* @returns the finalScriptWitness or throws an exception if no tapleaf found.
	*/
	function tapScriptFinalizer(inputIndex, input, tapLeafHashToFinalize) {
		const tapLeaf = findTapLeafToFinalize(input, inputIndex, tapLeafHashToFinalize);
		try {
			const witness = sortSignatures(input, tapLeaf).concat(tapLeaf.script).concat(tapLeaf.controlBlock);
			return { finalScriptWitness: (0, psbtutils_1.witnessStackToScriptWitness)(witness) };
		} catch (err) {
			throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
		}
	}
	exports.tapScriptFinalizer = tapScriptFinalizer;
	function serializeTaprootSignature(sig, sighashType) {
		const sighashTypeByte = sighashType ? Buffer.from([sighashType]) : Buffer.from([]);
		return Buffer.concat([sig, sighashTypeByte]);
	}
	exports.serializeTaprootSignature = serializeTaprootSignature;
	function isTaprootInput(input) {
		return input && !!(input.tapInternalKey || input.tapMerkleRoot || input.tapLeafScript && input.tapLeafScript.length || input.tapBip32Derivation && input.tapBip32Derivation.length || input.witnessUtxo && (0, psbtutils_1.isP2TR)(input.witnessUtxo.script));
	}
	exports.isTaprootInput = isTaprootInput;
	function isTaprootOutput(output, script) {
		return output && !!(output.tapInternalKey || output.tapTree || output.tapBip32Derivation && output.tapBip32Derivation.length || script && (0, psbtutils_1.isP2TR)(script));
	}
	exports.isTaprootOutput = isTaprootOutput;
	function checkTaprootInputFields(inputData, newInputData, action) {
		checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action);
		checkIfTapLeafInTree(inputData, newInputData, action);
	}
	exports.checkTaprootInputFields = checkTaprootInputFields;
	function checkTaprootOutputFields(outputData, newOutputData, action) {
		checkMixedTaprootAndNonTaprootOutputFields(outputData, newOutputData, action);
		checkTaprootScriptPubkey(outputData, newOutputData);
	}
	exports.checkTaprootOutputFields = checkTaprootOutputFields;
	function checkTaprootScriptPubkey(outputData, newOutputData) {
		if (!newOutputData.tapTree && !newOutputData.tapInternalKey) return;
		const tapInternalKey = newOutputData.tapInternalKey || outputData.tapInternalKey;
		const tapTree = newOutputData.tapTree || outputData.tapTree;
		if (tapInternalKey) {
			const { script: scriptPubkey } = outputData;
			const script = getTaprootScripPubkey(tapInternalKey, tapTree);
			if (scriptPubkey && !scriptPubkey.equals(script)) throw new Error("Error adding output. Script or address missmatch.");
		}
	}
	function getTaprootScripPubkey(tapInternalKey, tapTree) {
		const scriptTree = tapTree && tapTreeFromList(tapTree.leaves);
		const { output } = (0, payments_1.p2tr)({
			internalPubkey: tapInternalKey,
			scriptTree
		});
		return output;
	}
	function tweakInternalPubKey(inputIndex, input) {
		const tapInternalKey = input.tapInternalKey;
		const outputKey = tapInternalKey && (0, bip341_1.tweakKey)(tapInternalKey, input.tapMerkleRoot);
		if (!outputKey) throw new Error(`Cannot tweak tap internal key for input #${inputIndex}. Public key: ${tapInternalKey && tapInternalKey.toString("hex")}`);
		return outputKey.x;
	}
	exports.tweakInternalPubKey = tweakInternalPubKey;
	/**
	* Convert a binary tree to a BIP371 type list. Each element of the list is (according to BIP371):
	* One or more tuples representing the depth, leaf version, and script for a leaf in the Taproot tree,
	* allowing the entire tree to be reconstructed. The tuples must be in depth first search order so that
	* the tree is correctly reconstructed.
	* @param tree the binary tap tree
	* @returns a list of BIP 371 tapleaves
	*/
	function tapTreeToList(tree) {
		if (!(0, types_1.isTaptree)(tree)) throw new Error("Cannot convert taptree to tapleaf list. Expecting a tapree structure.");
		return _tapTreeToList(tree);
	}
	exports.tapTreeToList = tapTreeToList;
	/**
	* Convert a BIP371 TapLeaf list to a TapTree (binary).
	* @param leaves a list of tapleaves where each element of the list is (according to BIP371):
	* One or more tuples representing the depth, leaf version, and script for a leaf in the Taproot tree,
	* allowing the entire tree to be reconstructed. The tuples must be in depth first search order so that
	* the tree is correctly reconstructed.
	* @returns the corresponding taptree, or throws an exception if the tree cannot be reconstructed
	*/
	function tapTreeFromList(leaves = []) {
		if (leaves.length === 1 && leaves[0].depth === 0) return {
			output: leaves[0].script,
			version: leaves[0].leafVersion
		};
		return instertLeavesInTree(leaves);
	}
	exports.tapTreeFromList = tapTreeFromList;
	function checkTaprootInputForSigs(input, action) {
		return extractTaprootSigs(input).some((sig) => (0, psbtutils_2.signatureBlocksAction)(sig, decodeSchnorrSignature, action));
	}
	exports.checkTaprootInputForSigs = checkTaprootInputForSigs;
	function decodeSchnorrSignature(signature) {
		return {
			signature: signature.slice(0, 64),
			hashType: signature.slice(64)[0] || transaction_1.Transaction.SIGHASH_DEFAULT
		};
	}
	function extractTaprootSigs(input) {
		const sigs = [];
		if (input.tapKeySig) sigs.push(input.tapKeySig);
		if (input.tapScriptSig) sigs.push(...input.tapScriptSig.map((s) => s.signature));
		if (!sigs.length) {
			const finalTapKeySig = getTapKeySigFromWithness(input.finalScriptWitness);
			if (finalTapKeySig) sigs.push(finalTapKeySig);
		}
		return sigs;
	}
	function getTapKeySigFromWithness(finalScriptWitness) {
		if (!finalScriptWitness) return;
		const witness = finalScriptWitness.slice(2);
		if (witness.length === 64 || witness.length === 65) return witness;
	}
	function _tapTreeToList(tree, leaves = [], depth = 0) {
		if (depth > bip341_1.MAX_TAPTREE_DEPTH) throw new Error("Max taptree depth exceeded.");
		if (!tree) return [];
		if ((0, types_1.isTapleaf)(tree)) {
			leaves.push({
				depth,
				leafVersion: tree.version || bip341_1.LEAF_VERSION_TAPSCRIPT,
				script: tree.output
			});
			return leaves;
		}
		if (tree[0]) _tapTreeToList(tree[0], leaves, depth + 1);
		if (tree[1]) _tapTreeToList(tree[1], leaves, depth + 1);
		return leaves;
	}
	function instertLeavesInTree(leaves) {
		let tree;
		for (const leaf of leaves) {
			tree = instertLeafInTree(leaf, tree);
			if (!tree) throw new Error(`No room left to insert tapleaf in tree`);
		}
		return tree;
	}
	function instertLeafInTree(leaf, tree, depth = 0) {
		if (depth > bip341_1.MAX_TAPTREE_DEPTH) throw new Error("Max taptree depth exceeded.");
		if (leaf.depth === depth) {
			if (!tree) return {
				output: leaf.script,
				version: leaf.leafVersion
			};
			return;
		}
		if ((0, types_1.isTapleaf)(tree)) return;
		const leftSide = instertLeafInTree(leaf, tree && tree[0], depth + 1);
		if (leftSide) return [leftSide, tree && tree[1]];
		const rightSide = instertLeafInTree(leaf, tree && tree[1], depth + 1);
		if (rightSide) return [tree && tree[0], rightSide];
	}
	function checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action) {
		const isBadTaprootUpdate = isTaprootInput(inputData) && hasNonTaprootFields(newInputData);
		const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootInput(newInputData);
		const hasMixedFields = inputData === newInputData && isTaprootInput(newInputData) && hasNonTaprootFields(newInputData);
		if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields) throw new Error(`Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`);
	}
	function checkMixedTaprootAndNonTaprootOutputFields(inputData, newInputData, action) {
		const isBadTaprootUpdate = isTaprootOutput(inputData) && hasNonTaprootFields(newInputData);
		const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootOutput(newInputData);
		const hasMixedFields = inputData === newInputData && isTaprootOutput(newInputData) && hasNonTaprootFields(newInputData);
		if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields) throw new Error(`Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`);
	}
	/**
	* Checks if the tap leaf is part of the tap tree for the given input data.
	* Throws an error if the tap leaf is not part of the tap tree.
	* @param inputData - The original PsbtInput data.
	* @param newInputData - The new PsbtInput data.
	* @param action - The action being performed.
	* @throws {Error} - If the tap leaf is not part of the tap tree.
	*/
	function checkIfTapLeafInTree(inputData, newInputData, action) {
		if (newInputData.tapMerkleRoot) {
			const newLeafsInTree = (newInputData.tapLeafScript || []).every((l) => isTapLeafInTree(l, newInputData.tapMerkleRoot));
			const oldLeafsInTree = (inputData.tapLeafScript || []).every((l) => isTapLeafInTree(l, newInputData.tapMerkleRoot));
			if (!newLeafsInTree || !oldLeafsInTree) throw new Error(`Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`);
		} else if (inputData.tapMerkleRoot) {
			if (!(newInputData.tapLeafScript || []).every((l) => isTapLeafInTree(l, inputData.tapMerkleRoot))) throw new Error(`Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`);
		}
	}
	/**
	* Checks if a TapLeafScript is present in a Merkle tree.
	* @param tapLeaf The TapLeafScript to check.
	* @param merkleRoot The Merkle root of the tree. If not provided, the function assumes the TapLeafScript is present.
	* @returns A boolean indicating whether the TapLeafScript is present in the tree.
	*/
	function isTapLeafInTree(tapLeaf, merkleRoot) {
		if (!merkleRoot) return true;
		const leafHash = (0, bip341_1.tapleafHash)({
			output: tapLeaf.script,
			version: tapLeaf.leafVersion
		});
		return (0, bip341_1.rootHashFromPath)(tapLeaf.controlBlock, leafHash).equals(merkleRoot);
	}
	/**
	* Sorts the signatures in the input's tapScriptSig array based on their position in the tapLeaf script.
	*
	* @param input - The PsbtInput object.
	* @param tapLeaf - The TapLeafScript object.
	* @returns An array of sorted signatures as Buffers.
	*/
	function sortSignatures(input, tapLeaf) {
		const leafHash = (0, bip341_1.tapleafHash)({
			output: tapLeaf.script,
			version: tapLeaf.leafVersion
		});
		return (input.tapScriptSig || []).filter((tss) => tss.leafHash.equals(leafHash)).map((tss) => addPubkeyPositionInScript(tapLeaf.script, tss)).sort((t1, t2) => t2.positionInScript - t1.positionInScript).map((t) => t.signature);
	}
	/**
	* Adds the position of a public key in a script to a TapScriptSig object.
	* @param script The script in which to find the position of the public key.
	* @param tss The TapScriptSig object to add the position to.
	* @returns A TapScriptSigWitPosition object with the added position.
	*/
	function addPubkeyPositionInScript(script, tss) {
		return Object.assign({ positionInScript: (0, psbtutils_1.pubkeyPositionInScript)(tss.pubkey, script) }, tss);
	}
	/**
	* Find tapleaf by hash, or get the signed tapleaf with the shortest path.
	*/
	function findTapLeafToFinalize(input, inputIndex, leafHashToFinalize) {
		if (!input.tapScriptSig || !input.tapScriptSig.length) throw new Error(`Can not finalize taproot input #${inputIndex}. No tapleaf script signature provided.`);
		const tapLeaf = (input.tapLeafScript || []).sort((a, b) => a.controlBlock.length - b.controlBlock.length).find((leaf) => canFinalizeLeaf(leaf, input.tapScriptSig, leafHashToFinalize));
		if (!tapLeaf) throw new Error(`Can not finalize taproot input #${inputIndex}. Signature for tapleaf script not found.`);
		return tapLeaf;
	}
	/**
	* Determines whether a TapLeafScript can be finalized.
	*
	* @param leaf - The TapLeafScript to check.
	* @param tapScriptSig - The array of TapScriptSig objects.
	* @param hash - The optional hash to compare with the leaf hash.
	* @returns A boolean indicating whether the TapLeafScript can be finalized.
	*/
	function canFinalizeLeaf(leaf, tapScriptSig, hash) {
		const leafHash = (0, bip341_1.tapleafHash)({
			output: leaf.script,
			version: leaf.leafVersion
		});
		return (!hash || hash.equals(leafHash)) && tapScriptSig.find((tss) => tss.leafHash.equals(leafHash)) !== void 0;
	}
	/**
	* Checks if the given PsbtInput or PsbtOutput has non-taproot fields.
	* Non-taproot fields include redeemScript, witnessScript, and bip32Derivation.
	* @param io The PsbtInput or PsbtOutput to check.
	* @returns A boolean indicating whether the given input or output has non-taproot fields.
	*/
	function hasNonTaprootFields(io) {
		return io && !!(io.redeemScript || io.witnessScript || io.bip32Derivation && io.bip32Derivation.length);
	}
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/psbt.js
var require_psbt = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Psbt = void 0;
	var bip174_1 = require_psbt$1();
	var varuint = require_varint();
	var utils_1 = require_utils();
	var address_1 = require_address();
	var bufferutils_1 = require_bufferutils();
	var networks_1 = require_networks();
	var payments = require_payments();
	var bip341_1 = require_bip341();
	var bscript = require_script();
	var transaction_1 = require_transaction();
	var bip371_1 = require_bip371();
	var psbtutils_1 = require_psbtutils();
	/**
	* These are the default arguments for a Psbt instance.
	*/
	var DEFAULT_OPTS = {
		/**
		* A bitcoinjs Network object. This is only used if you pass an `address`
		* parameter to addOutput. Otherwise it is not needed and can be left default.
		*/
		network: networks_1.bitcoin,
		/**
		* When extractTransaction is called, the fee rate is checked.
		* THIS IS NOT TO BE RELIED ON.
		* It is only here as a last ditch effort to prevent sending a 500 BTC fee etc.
		*/
		maximumFeeRate: 5e3
	};
	exports.Psbt = class Psbt {
		static fromBase64(data, opts = {}) {
			const buffer = Buffer.from(data, "base64");
			return this.fromBuffer(buffer, opts);
		}
		static fromHex(data, opts = {}) {
			const buffer = Buffer.from(data, "hex");
			return this.fromBuffer(buffer, opts);
		}
		static fromBuffer(buffer, opts = {}) {
			const psbtBase = bip174_1.Psbt.fromBuffer(buffer, transactionFromBuffer);
			const psbt = new Psbt(opts, psbtBase);
			checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE);
			return psbt;
		}
		constructor(opts = {}, data = new bip174_1.Psbt(new PsbtTransaction())) {
			this.data = data;
			this.opts = Object.assign({}, DEFAULT_OPTS, opts);
			this.__CACHE = {
				__NON_WITNESS_UTXO_TX_CACHE: [],
				__NON_WITNESS_UTXO_BUF_CACHE: [],
				__TX_IN_CACHE: {},
				__TX: this.data.globalMap.unsignedTx.tx,
				__UNSAFE_SIGN_NONSEGWIT: false
			};
			if (this.data.inputs.length === 0) this.setVersion(2);
			const dpew = (obj, attr, enumerable, writable) => Object.defineProperty(obj, attr, {
				enumerable,
				writable
			});
			dpew(this, "__CACHE", false, true);
			dpew(this, "opts", false, true);
		}
		get inputCount() {
			return this.data.inputs.length;
		}
		get version() {
			return this.__CACHE.__TX.version;
		}
		set version(version) {
			this.setVersion(version);
		}
		get locktime() {
			return this.__CACHE.__TX.locktime;
		}
		set locktime(locktime) {
			this.setLocktime(locktime);
		}
		get txInputs() {
			return this.__CACHE.__TX.ins.map((input) => ({
				hash: (0, bufferutils_1.cloneBuffer)(input.hash),
				index: input.index,
				sequence: input.sequence
			}));
		}
		get txOutputs() {
			return this.__CACHE.__TX.outs.map((output) => {
				let address;
				try {
					address = (0, address_1.fromOutputScript)(output.script, this.opts.network);
				} catch (_) {}
				return {
					script: (0, bufferutils_1.cloneBuffer)(output.script),
					value: output.value,
					address
				};
			});
		}
		combine(...those) {
			this.data.combine(...those.map((o) => o.data));
			return this;
		}
		clone() {
			const res = Psbt.fromBuffer(this.data.toBuffer());
			res.opts = JSON.parse(JSON.stringify(this.opts));
			return res;
		}
		setMaximumFeeRate(satoshiPerByte) {
			check32Bit(satoshiPerByte);
			this.opts.maximumFeeRate = satoshiPerByte;
		}
		setVersion(version) {
			check32Bit(version);
			checkInputsForPartialSig(this.data.inputs, "setVersion");
			const c = this.__CACHE;
			c.__TX.version = version;
			c.__EXTRACTED_TX = void 0;
			return this;
		}
		setLocktime(locktime) {
			check32Bit(locktime);
			checkInputsForPartialSig(this.data.inputs, "setLocktime");
			const c = this.__CACHE;
			c.__TX.locktime = locktime;
			c.__EXTRACTED_TX = void 0;
			return this;
		}
		setInputSequence(inputIndex, sequence) {
			check32Bit(sequence);
			checkInputsForPartialSig(this.data.inputs, "setInputSequence");
			const c = this.__CACHE;
			if (c.__TX.ins.length <= inputIndex) throw new Error("Input index too high");
			c.__TX.ins[inputIndex].sequence = sequence;
			c.__EXTRACTED_TX = void 0;
			return this;
		}
		addInputs(inputDatas) {
			inputDatas.forEach((inputData) => this.addInput(inputData));
			return this;
		}
		addInput(inputData) {
			if (arguments.length > 1 || !inputData || inputData.hash === void 0 || inputData.index === void 0) throw new Error("Invalid arguments for Psbt.addInput. Requires single object with at least [hash] and [index]");
			(0, bip371_1.checkTaprootInputFields)(inputData, inputData, "addInput");
			checkInputsForPartialSig(this.data.inputs, "addInput");
			if (inputData.witnessScript) checkInvalidP2WSH(inputData.witnessScript);
			const c = this.__CACHE;
			this.data.addInput(inputData);
			const txIn = c.__TX.ins[c.__TX.ins.length - 1];
			checkTxInputCache(c, txIn);
			const inputIndex = this.data.inputs.length - 1;
			const input = this.data.inputs[inputIndex];
			if (input.nonWitnessUtxo) addNonWitnessTxCache(this.__CACHE, input, inputIndex);
			c.__FEE = void 0;
			c.__FEE_RATE = void 0;
			c.__EXTRACTED_TX = void 0;
			return this;
		}
		addOutputs(outputDatas) {
			outputDatas.forEach((outputData) => this.addOutput(outputData));
			return this;
		}
		addOutput(outputData) {
			if (arguments.length > 1 || !outputData || outputData.value === void 0 || outputData.address === void 0 && outputData.script === void 0) throw new Error("Invalid arguments for Psbt.addOutput. Requires single object with at least [script or address] and [value]");
			checkInputsForPartialSig(this.data.inputs, "addOutput");
			const { address } = outputData;
			if (typeof address === "string") {
				const { network } = this.opts;
				const script = (0, address_1.toOutputScript)(address, network);
				outputData = Object.assign({}, outputData, { script });
			}
			(0, bip371_1.checkTaprootOutputFields)(outputData, outputData, "addOutput");
			const c = this.__CACHE;
			this.data.addOutput(outputData);
			c.__FEE = void 0;
			c.__FEE_RATE = void 0;
			c.__EXTRACTED_TX = void 0;
			return this;
		}
		extractTransaction(disableFeeCheck) {
			if (!this.data.inputs.every(isFinalized)) throw new Error("Not finalized");
			const c = this.__CACHE;
			if (!disableFeeCheck) checkFees(this, c, this.opts);
			if (c.__EXTRACTED_TX) return c.__EXTRACTED_TX;
			const tx = c.__TX.clone();
			inputFinalizeGetAmts(this.data.inputs, tx, c, true);
			return tx;
		}
		getFeeRate() {
			return getTxCacheValue("__FEE_RATE", "fee rate", this.data.inputs, this.__CACHE);
		}
		getFee() {
			return getTxCacheValue("__FEE", "fee", this.data.inputs, this.__CACHE);
		}
		finalizeAllInputs() {
			(0, utils_1.checkForInput)(this.data.inputs, 0);
			range(this.data.inputs.length).forEach((idx) => this.finalizeInput(idx));
			return this;
		}
		finalizeInput(inputIndex, finalScriptsFunc) {
			const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
			if ((0, bip371_1.isTaprootInput)(input)) return this._finalizeTaprootInput(inputIndex, input, void 0, finalScriptsFunc);
			return this._finalizeInput(inputIndex, input, finalScriptsFunc);
		}
		finalizeTaprootInput(inputIndex, tapLeafHashToFinalize, finalScriptsFunc = bip371_1.tapScriptFinalizer) {
			const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
			if ((0, bip371_1.isTaprootInput)(input)) return this._finalizeTaprootInput(inputIndex, input, tapLeafHashToFinalize, finalScriptsFunc);
			throw new Error(`Cannot finalize input #${inputIndex}. Not Taproot.`);
		}
		_finalizeInput(inputIndex, input, finalScriptsFunc = getFinalScripts) {
			const { script, isP2SH, isP2WSH, isSegwit } = getScriptFromInput(inputIndex, input, this.__CACHE);
			if (!script) throw new Error(`No script found for input #${inputIndex}`);
			checkPartialSigSighashes(input);
			const { finalScriptSig, finalScriptWitness } = finalScriptsFunc(inputIndex, input, script, isSegwit, isP2SH, isP2WSH);
			if (finalScriptSig) this.data.updateInput(inputIndex, { finalScriptSig });
			if (finalScriptWitness) this.data.updateInput(inputIndex, { finalScriptWitness });
			if (!finalScriptSig && !finalScriptWitness) throw new Error(`Unknown error finalizing input #${inputIndex}`);
			this.data.clearFinalizedInput(inputIndex);
			return this;
		}
		_finalizeTaprootInput(inputIndex, input, tapLeafHashToFinalize, finalScriptsFunc = bip371_1.tapScriptFinalizer) {
			if (!input.witnessUtxo) throw new Error(`Cannot finalize input #${inputIndex}. Missing withness utxo.`);
			if (input.tapKeySig) {
				const payment = payments.p2tr({
					output: input.witnessUtxo.script,
					signature: input.tapKeySig
				});
				const finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(payment.witness);
				this.data.updateInput(inputIndex, { finalScriptWitness });
			} else {
				const { finalScriptWitness } = finalScriptsFunc(inputIndex, input, tapLeafHashToFinalize);
				this.data.updateInput(inputIndex, { finalScriptWitness });
			}
			this.data.clearFinalizedInput(inputIndex);
			return this;
		}
		getInputType(inputIndex) {
			const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
			const result = getMeaningfulScript(getScriptFromUtxo(inputIndex, input, this.__CACHE), inputIndex, "input", input.redeemScript || redeemFromFinalScriptSig(input.finalScriptSig), input.witnessScript || redeemFromFinalWitnessScript(input.finalScriptWitness));
			return (result.type === "raw" ? "" : result.type + "-") + classifyScript(result.meaningfulScript);
		}
		inputHasPubkey(inputIndex, pubkey) {
			return pubkeyInInput(pubkey, (0, utils_1.checkForInput)(this.data.inputs, inputIndex), inputIndex, this.__CACHE);
		}
		inputHasHDKey(inputIndex, root) {
			const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
			const derivationIsMine = bip32DerivationIsMine(root);
			return !!input.bip32Derivation && input.bip32Derivation.some(derivationIsMine);
		}
		outputHasPubkey(outputIndex, pubkey) {
			return pubkeyInOutput(pubkey, (0, utils_1.checkForOutput)(this.data.outputs, outputIndex), outputIndex, this.__CACHE);
		}
		outputHasHDKey(outputIndex, root) {
			const output = (0, utils_1.checkForOutput)(this.data.outputs, outputIndex);
			const derivationIsMine = bip32DerivationIsMine(root);
			return !!output.bip32Derivation && output.bip32Derivation.some(derivationIsMine);
		}
		validateSignaturesOfAllInputs(validator) {
			(0, utils_1.checkForInput)(this.data.inputs, 0);
			return range(this.data.inputs.length).map((idx) => this.validateSignaturesOfInput(idx, validator)).reduce((final, res) => res === true && final, true);
		}
		validateSignaturesOfInput(inputIndex, validator, pubkey) {
			const input = this.data.inputs[inputIndex];
			if ((0, bip371_1.isTaprootInput)(input)) return this.validateSignaturesOfTaprootInput(inputIndex, validator, pubkey);
			return this._validateSignaturesOfInput(inputIndex, validator, pubkey);
		}
		_validateSignaturesOfInput(inputIndex, validator, pubkey) {
			const input = this.data.inputs[inputIndex];
			const partialSig = (input || {}).partialSig;
			if (!input || !partialSig || partialSig.length < 1) throw new Error("No signatures to validate");
			if (typeof validator !== "function") throw new Error("Need validator function to validate signatures");
			const mySigs = pubkey ? partialSig.filter((sig) => sig.pubkey.equals(pubkey)) : partialSig;
			if (mySigs.length < 1) throw new Error("No signatures for this pubkey");
			const results = [];
			let hashCache;
			let scriptCache;
			let sighashCache;
			for (const pSig of mySigs) {
				const sig = bscript.signature.decode(pSig.signature);
				const { hash, script } = sighashCache !== sig.hashType ? getHashForSig(inputIndex, Object.assign({}, input, { sighashType: sig.hashType }), this.__CACHE, true) : {
					hash: hashCache,
					script: scriptCache
				};
				sighashCache = sig.hashType;
				hashCache = hash;
				scriptCache = script;
				checkScriptForPubkey(pSig.pubkey, script, "verify");
				results.push(validator(pSig.pubkey, hash, sig.signature));
			}
			return results.every((res) => res === true);
		}
		validateSignaturesOfTaprootInput(inputIndex, validator, pubkey) {
			const input = this.data.inputs[inputIndex];
			const tapKeySig = (input || {}).tapKeySig;
			const tapScriptSig = (input || {}).tapScriptSig;
			if (!input && !tapKeySig && !(tapScriptSig && !tapScriptSig.length)) throw new Error("No signatures to validate");
			if (typeof validator !== "function") throw new Error("Need validator function to validate signatures");
			pubkey = pubkey && (0, bip371_1.toXOnly)(pubkey);
			const allHashses = pubkey ? getTaprootHashesForSig(inputIndex, input, this.data.inputs, pubkey, this.__CACHE) : getAllTaprootHashesForSig(inputIndex, input, this.data.inputs, this.__CACHE);
			if (!allHashses.length) throw new Error("No signatures for this pubkey");
			const tapKeyHash = allHashses.find((h) => !h.leafHash);
			let validationResultCount = 0;
			if (tapKeySig && tapKeyHash) {
				if (!validator(tapKeyHash.pubkey, tapKeyHash.hash, trimTaprootSig(tapKeySig))) return false;
				validationResultCount++;
			}
			if (tapScriptSig) for (const tapSig of tapScriptSig) {
				const tapSigHash = allHashses.find((h) => tapSig.pubkey.equals(h.pubkey));
				if (tapSigHash) {
					if (!validator(tapSig.pubkey, tapSigHash.hash, trimTaprootSig(tapSig.signature))) return false;
					validationResultCount++;
				}
			}
			return validationResultCount > 0;
		}
		signAllInputsHD(hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
			if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) throw new Error("Need HDSigner to sign input");
			const results = [];
			for (const i of range(this.data.inputs.length)) try {
				this.signInputHD(i, hdKeyPair, sighashTypes);
				results.push(true);
			} catch (err) {
				results.push(false);
			}
			if (results.every((v) => v === false)) throw new Error("No inputs were signed");
			return this;
		}
		signAllInputsHDAsync(hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
			return new Promise((resolve, reject) => {
				if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) return reject(/* @__PURE__ */ new Error("Need HDSigner to sign input"));
				const results = [];
				const promises = [];
				for (const i of range(this.data.inputs.length)) promises.push(this.signInputHDAsync(i, hdKeyPair, sighashTypes).then(() => {
					results.push(true);
				}, () => {
					results.push(false);
				}));
				return Promise.all(promises).then(() => {
					if (results.every((v) => v === false)) return reject(/* @__PURE__ */ new Error("No inputs were signed"));
					resolve();
				});
			});
		}
		signInputHD(inputIndex, hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
			if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) throw new Error("Need HDSigner to sign input");
			getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair).forEach((signer) => this.signInput(inputIndex, signer, sighashTypes));
			return this;
		}
		signInputHDAsync(inputIndex, hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
			return new Promise((resolve, reject) => {
				if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) return reject(/* @__PURE__ */ new Error("Need HDSigner to sign input"));
				const promises = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair).map((signer) => this.signInputAsync(inputIndex, signer, sighashTypes));
				return Promise.all(promises).then(() => {
					resolve();
				}).catch(reject);
			});
		}
		signAllInputs(keyPair, sighashTypes) {
			if (!keyPair || !keyPair.publicKey) throw new Error("Need Signer to sign input");
			const results = [];
			for (const i of range(this.data.inputs.length)) try {
				this.signInput(i, keyPair, sighashTypes);
				results.push(true);
			} catch (err) {
				results.push(false);
			}
			if (results.every((v) => v === false)) throw new Error("No inputs were signed");
			return this;
		}
		signAllInputsAsync(keyPair, sighashTypes) {
			return new Promise((resolve, reject) => {
				if (!keyPair || !keyPair.publicKey) return reject(/* @__PURE__ */ new Error("Need Signer to sign input"));
				const results = [];
				const promises = [];
				for (const [i] of this.data.inputs.entries()) promises.push(this.signInputAsync(i, keyPair, sighashTypes).then(() => {
					results.push(true);
				}, () => {
					results.push(false);
				}));
				return Promise.all(promises).then(() => {
					if (results.every((v) => v === false)) return reject(/* @__PURE__ */ new Error("No inputs were signed"));
					resolve();
				});
			});
		}
		signInput(inputIndex, keyPair, sighashTypes) {
			if (!keyPair || !keyPair.publicKey) throw new Error("Need Signer to sign input");
			const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
			if ((0, bip371_1.isTaprootInput)(input)) return this._signTaprootInput(inputIndex, input, keyPair, void 0, sighashTypes);
			return this._signInput(inputIndex, keyPair, sighashTypes);
		}
		signTaprootInput(inputIndex, keyPair, tapLeafHashToSign, sighashTypes) {
			if (!keyPair || !keyPair.publicKey) throw new Error("Need Signer to sign input");
			const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
			if ((0, bip371_1.isTaprootInput)(input)) return this._signTaprootInput(inputIndex, input, keyPair, tapLeafHashToSign, sighashTypes);
			throw new Error(`Input #${inputIndex} is not of type Taproot.`);
		}
		_signInput(inputIndex, keyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
			const { hash, sighashType } = getHashAndSighashType(this.data.inputs, inputIndex, keyPair.publicKey, this.__CACHE, sighashTypes);
			const partialSig = [{
				pubkey: keyPair.publicKey,
				signature: bscript.signature.encode(keyPair.sign(hash), sighashType)
			}];
			this.data.updateInput(inputIndex, { partialSig });
			return this;
		}
		_signTaprootInput(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes = [transaction_1.Transaction.SIGHASH_DEFAULT]) {
			const hashesForSig = this.checkTaprootHashesForSig(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes);
			const tapKeySig = hashesForSig.filter((h) => !h.leafHash).map((h) => (0, bip371_1.serializeTaprootSignature)(keyPair.signSchnorr(h.hash), input.sighashType))[0];
			const tapScriptSig = hashesForSig.filter((h) => !!h.leafHash).map((h) => ({
				pubkey: (0, bip371_1.toXOnly)(keyPair.publicKey),
				signature: (0, bip371_1.serializeTaprootSignature)(keyPair.signSchnorr(h.hash), input.sighashType),
				leafHash: h.leafHash
			}));
			if (tapKeySig) this.data.updateInput(inputIndex, { tapKeySig });
			if (tapScriptSig.length) this.data.updateInput(inputIndex, { tapScriptSig });
			return this;
		}
		signInputAsync(inputIndex, keyPair, sighashTypes) {
			return Promise.resolve().then(() => {
				if (!keyPair || !keyPair.publicKey) throw new Error("Need Signer to sign input");
				const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
				if ((0, bip371_1.isTaprootInput)(input)) return this._signTaprootInputAsync(inputIndex, input, keyPair, void 0, sighashTypes);
				return this._signInputAsync(inputIndex, keyPair, sighashTypes);
			});
		}
		signTaprootInputAsync(inputIndex, keyPair, tapLeafHash, sighashTypes) {
			return Promise.resolve().then(() => {
				if (!keyPair || !keyPair.publicKey) throw new Error("Need Signer to sign input");
				const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
				if ((0, bip371_1.isTaprootInput)(input)) return this._signTaprootInputAsync(inputIndex, input, keyPair, tapLeafHash, sighashTypes);
				throw new Error(`Input #${inputIndex} is not of type Taproot.`);
			});
		}
		_signInputAsync(inputIndex, keyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
			const { hash, sighashType } = getHashAndSighashType(this.data.inputs, inputIndex, keyPair.publicKey, this.__CACHE, sighashTypes);
			return Promise.resolve(keyPair.sign(hash)).then((signature) => {
				const partialSig = [{
					pubkey: keyPair.publicKey,
					signature: bscript.signature.encode(signature, sighashType)
				}];
				this.data.updateInput(inputIndex, { partialSig });
			});
		}
		async _signTaprootInputAsync(inputIndex, input, keyPair, tapLeafHash, sighashTypes = [transaction_1.Transaction.SIGHASH_DEFAULT]) {
			const hashesForSig = this.checkTaprootHashesForSig(inputIndex, input, keyPair, tapLeafHash, sighashTypes);
			const signaturePromises = [];
			const tapKeyHash = hashesForSig.filter((h) => !h.leafHash)[0];
			if (tapKeyHash) {
				const tapKeySigPromise = Promise.resolve(keyPair.signSchnorr(tapKeyHash.hash)).then((sig) => {
					return { tapKeySig: (0, bip371_1.serializeTaprootSignature)(sig, input.sighashType) };
				});
				signaturePromises.push(tapKeySigPromise);
			}
			const tapScriptHashes = hashesForSig.filter((h) => !!h.leafHash);
			if (tapScriptHashes.length) {
				const tapScriptSigPromises = tapScriptHashes.map((tsh) => {
					return Promise.resolve(keyPair.signSchnorr(tsh.hash)).then((signature) => {
						return { tapScriptSig: [{
							pubkey: (0, bip371_1.toXOnly)(keyPair.publicKey),
							signature: (0, bip371_1.serializeTaprootSignature)(signature, input.sighashType),
							leafHash: tsh.leafHash
						}] };
					});
				});
				signaturePromises.push(...tapScriptSigPromises);
			}
			return Promise.all(signaturePromises).then((results) => {
				results.forEach((v) => this.data.updateInput(inputIndex, v));
			});
		}
		checkTaprootHashesForSig(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes) {
			if (typeof keyPair.signSchnorr !== "function") throw new Error(`Need Schnorr Signer to sign taproot input #${inputIndex}.`);
			const hashesForSig = getTaprootHashesForSig(inputIndex, input, this.data.inputs, keyPair.publicKey, this.__CACHE, tapLeafHashToSign, allowedSighashTypes);
			if (!hashesForSig || !hashesForSig.length) throw new Error(`Can not sign for input #${inputIndex} with the key ${keyPair.publicKey.toString("hex")}`);
			return hashesForSig;
		}
		toBuffer() {
			checkCache(this.__CACHE);
			return this.data.toBuffer();
		}
		toHex() {
			checkCache(this.__CACHE);
			return this.data.toHex();
		}
		toBase64() {
			checkCache(this.__CACHE);
			return this.data.toBase64();
		}
		updateGlobal(updateData) {
			this.data.updateGlobal(updateData);
			return this;
		}
		updateInput(inputIndex, updateData) {
			if (updateData.witnessScript) checkInvalidP2WSH(updateData.witnessScript);
			(0, bip371_1.checkTaprootInputFields)(this.data.inputs[inputIndex], updateData, "updateInput");
			this.data.updateInput(inputIndex, updateData);
			if (updateData.nonWitnessUtxo) addNonWitnessTxCache(this.__CACHE, this.data.inputs[inputIndex], inputIndex);
			return this;
		}
		updateOutput(outputIndex, updateData) {
			const outputData = this.data.outputs[outputIndex];
			(0, bip371_1.checkTaprootOutputFields)(outputData, updateData, "updateOutput");
			this.data.updateOutput(outputIndex, updateData);
			return this;
		}
		addUnknownKeyValToGlobal(keyVal) {
			this.data.addUnknownKeyValToGlobal(keyVal);
			return this;
		}
		addUnknownKeyValToInput(inputIndex, keyVal) {
			this.data.addUnknownKeyValToInput(inputIndex, keyVal);
			return this;
		}
		addUnknownKeyValToOutput(outputIndex, keyVal) {
			this.data.addUnknownKeyValToOutput(outputIndex, keyVal);
			return this;
		}
		clearFinalizedInput(inputIndex) {
			this.data.clearFinalizedInput(inputIndex);
			return this;
		}
	};
	/**
	* This function is needed to pass to the bip174 base class's fromBuffer.
	* It takes the "transaction buffer" portion of the psbt buffer and returns a
	* Transaction (From the bip174 library) interface.
	*/
	var transactionFromBuffer = (buffer) => new PsbtTransaction(buffer);
	/**
	* This class implements the Transaction interface from bip174 library.
	* It contains a bitcoinjs-lib Transaction object.
	*/
	var PsbtTransaction = class {
		constructor(buffer = Buffer.from([
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		])) {
			this.tx = transaction_1.Transaction.fromBuffer(buffer);
			checkTxEmpty(this.tx);
			Object.defineProperty(this, "tx", {
				enumerable: false,
				writable: true
			});
		}
		getInputOutputCounts() {
			return {
				inputCount: this.tx.ins.length,
				outputCount: this.tx.outs.length
			};
		}
		addInput(input) {
			if (input.hash === void 0 || input.index === void 0 || !Buffer.isBuffer(input.hash) && typeof input.hash !== "string" || typeof input.index !== "number") throw new Error("Error adding input.");
			const hash = typeof input.hash === "string" ? (0, bufferutils_1.reverseBuffer)(Buffer.from(input.hash, "hex")) : input.hash;
			this.tx.addInput(hash, input.index, input.sequence);
		}
		addOutput(output) {
			if (output.script === void 0 || output.value === void 0 || !Buffer.isBuffer(output.script) || typeof output.value !== "number") throw new Error("Error adding output.");
			this.tx.addOutput(output.script, output.value);
		}
		toBuffer() {
			return this.tx.toBuffer();
		}
	};
	function canFinalize(input, script, scriptType) {
		switch (scriptType) {
			case "pubkey":
			case "pubkeyhash":
			case "witnesspubkeyhash": return hasSigs(1, input.partialSig);
			case "multisig":
				const p2ms = payments.p2ms({ output: script });
				return hasSigs(p2ms.m, input.partialSig, p2ms.pubkeys);
			default: return false;
		}
	}
	function checkCache(cache) {
		if (cache.__UNSAFE_SIGN_NONSEGWIT !== false) throw new Error("Not BIP174 compliant, can not export");
	}
	function hasSigs(neededSigs, partialSig, pubkeys) {
		if (!partialSig) return false;
		let sigs;
		if (pubkeys) sigs = pubkeys.map((pkey) => {
			const pubkey = compressPubkey(pkey);
			return partialSig.find((pSig) => pSig.pubkey.equals(pubkey));
		}).filter((v) => !!v);
		else sigs = partialSig;
		if (sigs.length > neededSigs) throw new Error("Too many signatures");
		return sigs.length === neededSigs;
	}
	function isFinalized(input) {
		return !!input.finalScriptSig || !!input.finalScriptWitness;
	}
	function bip32DerivationIsMine(root) {
		return (d) => {
			if (!d.masterFingerprint.equals(root.fingerprint)) return false;
			if (!root.derivePath(d.path).publicKey.equals(d.pubkey)) return false;
			return true;
		};
	}
	function check32Bit(num) {
		if (typeof num !== "number" || num !== Math.floor(num) || num > 4294967295 || num < 0) throw new Error("Invalid 32 bit integer");
	}
	function checkFees(psbt, cache, opts) {
		const feeRate = cache.__FEE_RATE || psbt.getFeeRate();
		const vsize = cache.__EXTRACTED_TX.virtualSize();
		const satoshis = feeRate * vsize;
		if (feeRate >= opts.maximumFeeRate) throw new Error(`Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in fees, which is ${feeRate} satoshi per byte for a transaction with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per byte). Use setMaximumFeeRate method to raise your threshold, or pass true to the first arg of extractTransaction.`);
	}
	function checkInputsForPartialSig(inputs, action) {
		inputs.forEach((input) => {
			if ((0, bip371_1.isTaprootInput)(input) ? (0, bip371_1.checkTaprootInputForSigs)(input, action) : (0, psbtutils_1.checkInputForSig)(input, action)) throw new Error("Can not modify transaction, signatures exist.");
		});
	}
	function checkPartialSigSighashes(input) {
		if (!input.sighashType || !input.partialSig) return;
		const { partialSig, sighashType } = input;
		partialSig.forEach((pSig) => {
			const { hashType } = bscript.signature.decode(pSig.signature);
			if (sighashType !== hashType) throw new Error("Signature sighash does not match input sighash type");
		});
	}
	function checkScriptForPubkey(pubkey, script, action) {
		if (!(0, psbtutils_1.pubkeyInScript)(pubkey, script)) throw new Error(`Can not ${action} for this input with the key ${pubkey.toString("hex")}`);
	}
	function checkTxEmpty(tx) {
		if (!tx.ins.every((input) => input.script && input.script.length === 0 && input.witness && input.witness.length === 0)) throw new Error("Format Error: Transaction ScriptSigs are not empty");
	}
	function checkTxForDupeIns(tx, cache) {
		tx.ins.forEach((input) => {
			checkTxInputCache(cache, input);
		});
	}
	function checkTxInputCache(cache, input) {
		const key = (0, bufferutils_1.reverseBuffer)(Buffer.from(input.hash)).toString("hex") + ":" + input.index;
		if (cache.__TX_IN_CACHE[key]) throw new Error("Duplicate input detected.");
		cache.__TX_IN_CACHE[key] = 1;
	}
	function scriptCheckerFactory(payment, paymentScriptName) {
		return (inputIndex, scriptPubKey, redeemScript, ioType) => {
			const redeemScriptOutput = payment({ redeem: { output: redeemScript } }).output;
			if (!scriptPubKey.equals(redeemScriptOutput)) throw new Error(`${paymentScriptName} for ${ioType} #${inputIndex} doesn't match the scriptPubKey in the prevout`);
		};
	}
	var checkRedeemScript = scriptCheckerFactory(payments.p2sh, "Redeem script");
	var checkWitnessScript = scriptCheckerFactory(payments.p2wsh, "Witness script");
	function getTxCacheValue(key, name, inputs, c) {
		if (!inputs.every(isFinalized)) throw new Error(`PSBT must be finalized to calculate ${name}`);
		if (key === "__FEE_RATE" && c.__FEE_RATE) return c.__FEE_RATE;
		if (key === "__FEE" && c.__FEE) return c.__FEE;
		let tx;
		let mustFinalize = true;
		if (c.__EXTRACTED_TX) {
			tx = c.__EXTRACTED_TX;
			mustFinalize = false;
		} else tx = c.__TX.clone();
		inputFinalizeGetAmts(inputs, tx, c, mustFinalize);
		if (key === "__FEE_RATE") return c.__FEE_RATE;
		else if (key === "__FEE") return c.__FEE;
	}
	function getFinalScripts(inputIndex, input, script, isSegwit, isP2SH, isP2WSH) {
		const scriptType = classifyScript(script);
		if (!canFinalize(input, script, scriptType)) throw new Error(`Can not finalize input #${inputIndex}`);
		return prepareFinalScripts(script, scriptType, input.partialSig, isSegwit, isP2SH, isP2WSH);
	}
	function prepareFinalScripts(script, scriptType, partialSig, isSegwit, isP2SH, isP2WSH) {
		let finalScriptSig;
		let finalScriptWitness;
		const payment = getPayment(script, scriptType, partialSig);
		const p2wsh = !isP2WSH ? null : payments.p2wsh({ redeem: payment });
		const p2sh = !isP2SH ? null : payments.p2sh({ redeem: p2wsh || payment });
		if (isSegwit) {
			if (p2wsh) finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(p2wsh.witness);
			else finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(payment.witness);
			if (p2sh) finalScriptSig = p2sh.input;
		} else if (p2sh) finalScriptSig = p2sh.input;
		else finalScriptSig = payment.input;
		return {
			finalScriptSig,
			finalScriptWitness
		};
	}
	function getHashAndSighashType(inputs, inputIndex, pubkey, cache, sighashTypes) {
		const { hash, sighashType, script } = getHashForSig(inputIndex, (0, utils_1.checkForInput)(inputs, inputIndex), cache, false, sighashTypes);
		checkScriptForPubkey(pubkey, script, "sign");
		return {
			hash,
			sighashType
		};
	}
	function getHashForSig(inputIndex, input, cache, forValidate, sighashTypes) {
		const unsignedTx = cache.__TX;
		const sighashType = input.sighashType || transaction_1.Transaction.SIGHASH_ALL;
		checkSighashTypeAllowed(sighashType, sighashTypes);
		let hash;
		let prevout;
		if (input.nonWitnessUtxo) {
			const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(cache, input, inputIndex);
			const prevoutHash = unsignedTx.ins[inputIndex].hash;
			const utxoHash = nonWitnessUtxoTx.getHash();
			if (!prevoutHash.equals(utxoHash)) throw new Error(`Non-witness UTXO hash for input #${inputIndex} doesn't match the hash specified in the prevout`);
			const prevoutIndex = unsignedTx.ins[inputIndex].index;
			prevout = nonWitnessUtxoTx.outs[prevoutIndex];
		} else if (input.witnessUtxo) prevout = input.witnessUtxo;
		else throw new Error("Need a Utxo input item for signing");
		const { meaningfulScript, type } = getMeaningfulScript(prevout.script, inputIndex, "input", input.redeemScript, input.witnessScript);
		if (["p2sh-p2wsh", "p2wsh"].indexOf(type) >= 0) hash = unsignedTx.hashForWitnessV0(inputIndex, meaningfulScript, prevout.value, sighashType);
		else if ((0, psbtutils_1.isP2WPKH)(meaningfulScript)) {
			const signingScript = payments.p2pkh({ hash: meaningfulScript.slice(2) }).output;
			hash = unsignedTx.hashForWitnessV0(inputIndex, signingScript, prevout.value, sighashType);
		} else {
			if (input.nonWitnessUtxo === void 0 && cache.__UNSAFE_SIGN_NONSEGWIT === false) throw new Error(`Input #${inputIndex} has witnessUtxo but non-segwit script: ${meaningfulScript.toString("hex")}`);
			if (!forValidate && cache.__UNSAFE_SIGN_NONSEGWIT !== false) console.warn("Warning: Signing non-segwit inputs without the full parent transaction means there is a chance that a miner could feed you incorrect information to trick you into paying large fees. This behavior is the same as Psbt's predecessor (TransactionBuilder - now removed) when signing non-segwit scripts. You are not able to export this Psbt with toBuffer|toBase64|toHex since it is not BIP174 compliant.\n*********************\nPROCEED WITH CAUTION!\n*********************");
			hash = unsignedTx.hashForSignature(inputIndex, meaningfulScript, sighashType);
		}
		return {
			script: meaningfulScript,
			sighashType,
			hash
		};
	}
	function getAllTaprootHashesForSig(inputIndex, input, inputs, cache) {
		const allPublicKeys = [];
		if (input.tapInternalKey) {
			const key = getPrevoutTaprootKey(inputIndex, input, cache);
			if (key) allPublicKeys.push(key);
		}
		if (input.tapScriptSig) {
			const tapScriptPubkeys = input.tapScriptSig.map((tss) => tss.pubkey);
			allPublicKeys.push(...tapScriptPubkeys);
		}
		return allPublicKeys.map((pubicKey) => getTaprootHashesForSig(inputIndex, input, inputs, pubicKey, cache)).flat();
	}
	function getPrevoutTaprootKey(inputIndex, input, cache) {
		const { script } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
		return (0, psbtutils_1.isP2TR)(script) ? script.subarray(2, 34) : null;
	}
	function trimTaprootSig(signature) {
		return signature.length === 64 ? signature : signature.subarray(0, 64);
	}
	function getTaprootHashesForSig(inputIndex, input, inputs, pubkey, cache, tapLeafHashToSign, allowedSighashTypes) {
		const unsignedTx = cache.__TX;
		const sighashType = input.sighashType || transaction_1.Transaction.SIGHASH_DEFAULT;
		checkSighashTypeAllowed(sighashType, allowedSighashTypes);
		const prevOuts = inputs.map((i, index) => getScriptAndAmountFromUtxo(index, i, cache));
		const signingScripts = prevOuts.map((o) => o.script);
		const values = prevOuts.map((o) => o.value);
		const hashes = [];
		if (input.tapInternalKey && !tapLeafHashToSign) {
			const outputKey = getPrevoutTaprootKey(inputIndex, input, cache) || Buffer.from([]);
			if ((0, bip371_1.toXOnly)(pubkey).equals(outputKey)) {
				const tapKeyHash = unsignedTx.hashForWitnessV1(inputIndex, signingScripts, values, sighashType);
				hashes.push({
					pubkey,
					hash: tapKeyHash
				});
			}
		}
		const tapLeafHashes = (input.tapLeafScript || []).filter((tapLeaf) => (0, psbtutils_1.pubkeyInScript)(pubkey, tapLeaf.script)).map((tapLeaf) => {
			const hash = (0, bip341_1.tapleafHash)({
				output: tapLeaf.script,
				version: tapLeaf.leafVersion
			});
			return Object.assign({ hash }, tapLeaf);
		}).filter((tapLeaf) => !tapLeafHashToSign || tapLeafHashToSign.equals(tapLeaf.hash)).map((tapLeaf) => {
			return {
				pubkey,
				hash: unsignedTx.hashForWitnessV1(inputIndex, signingScripts, values, sighashType, tapLeaf.hash),
				leafHash: tapLeaf.hash
			};
		});
		return hashes.concat(tapLeafHashes);
	}
	function checkSighashTypeAllowed(sighashType, sighashTypes) {
		if (sighashTypes && sighashTypes.indexOf(sighashType) < 0) {
			const str = sighashTypeToString(sighashType);
			throw new Error(`Sighash type is not allowed. Retry the sign method passing the sighashTypes array of whitelisted types. Sighash type: ${str}`);
		}
	}
	function getPayment(script, scriptType, partialSig) {
		let payment;
		switch (scriptType) {
			case "multisig":
				const sigs = getSortedSigs(script, partialSig);
				payment = payments.p2ms({
					output: script,
					signatures: sigs
				});
				break;
			case "pubkey":
				payment = payments.p2pk({
					output: script,
					signature: partialSig[0].signature
				});
				break;
			case "pubkeyhash":
				payment = payments.p2pkh({
					output: script,
					pubkey: partialSig[0].pubkey,
					signature: partialSig[0].signature
				});
				break;
			case "witnesspubkeyhash": payment = payments.p2wpkh({
				output: script,
				pubkey: partialSig[0].pubkey,
				signature: partialSig[0].signature
			});
		}
		return payment;
	}
	function getScriptFromInput(inputIndex, input, cache) {
		const unsignedTx = cache.__TX;
		const res = {
			script: null,
			isSegwit: false,
			isP2SH: false,
			isP2WSH: false
		};
		res.isP2SH = !!input.redeemScript;
		res.isP2WSH = !!input.witnessScript;
		if (input.witnessScript) res.script = input.witnessScript;
		else if (input.redeemScript) res.script = input.redeemScript;
		else if (input.nonWitnessUtxo) {
			const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(cache, input, inputIndex);
			const prevoutIndex = unsignedTx.ins[inputIndex].index;
			res.script = nonWitnessUtxoTx.outs[prevoutIndex].script;
		} else if (input.witnessUtxo) res.script = input.witnessUtxo.script;
		if (input.witnessScript || (0, psbtutils_1.isP2WPKH)(res.script)) res.isSegwit = true;
		return res;
	}
	function getSignersFromHD(inputIndex, inputs, hdKeyPair) {
		const input = (0, utils_1.checkForInput)(inputs, inputIndex);
		if (!input.bip32Derivation || input.bip32Derivation.length === 0) throw new Error("Need bip32Derivation to sign with HD");
		const myDerivations = input.bip32Derivation.map((bipDv) => {
			if (bipDv.masterFingerprint.equals(hdKeyPair.fingerprint)) return bipDv;
			else return;
		}).filter((v) => !!v);
		if (myDerivations.length === 0) throw new Error("Need one bip32Derivation masterFingerprint to match the HDSigner fingerprint");
		return myDerivations.map((bipDv) => {
			const node = hdKeyPair.derivePath(bipDv.path);
			if (!bipDv.pubkey.equals(node.publicKey)) throw new Error("pubkey did not match bip32Derivation");
			return node;
		});
	}
	function getSortedSigs(script, partialSig) {
		return payments.p2ms({ output: script }).pubkeys.map((pk) => {
			return (partialSig.filter((ps) => {
				return ps.pubkey.equals(pk);
			})[0] || {}).signature;
		}).filter((v) => !!v);
	}
	function scriptWitnessToWitnessStack(buffer) {
		let offset = 0;
		function readSlice(n) {
			offset += n;
			return buffer.slice(offset - n, offset);
		}
		function readVarInt() {
			const vi = varuint.decode(buffer, offset);
			offset += varuint.decode.bytes;
			return vi;
		}
		function readVarSlice() {
			return readSlice(readVarInt());
		}
		function readVector() {
			const count = readVarInt();
			const vector = [];
			for (let i = 0; i < count; i++) vector.push(readVarSlice());
			return vector;
		}
		return readVector();
	}
	function sighashTypeToString(sighashType) {
		let text = sighashType & transaction_1.Transaction.SIGHASH_ANYONECANPAY ? "SIGHASH_ANYONECANPAY | " : "";
		switch (sighashType & 31) {
			case transaction_1.Transaction.SIGHASH_ALL:
				text += "SIGHASH_ALL";
				break;
			case transaction_1.Transaction.SIGHASH_SINGLE:
				text += "SIGHASH_SINGLE";
				break;
			case transaction_1.Transaction.SIGHASH_NONE: text += "SIGHASH_NONE";
		}
		return text;
	}
	function addNonWitnessTxCache(cache, input, inputIndex) {
		cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo;
		const tx = transaction_1.Transaction.fromBuffer(input.nonWitnessUtxo);
		cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx;
		const self = cache;
		const selfIndex = inputIndex;
		delete input.nonWitnessUtxo;
		Object.defineProperty(input, "nonWitnessUtxo", {
			enumerable: true,
			get() {
				const buf = self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex];
				const txCache = self.__NON_WITNESS_UTXO_TX_CACHE[selfIndex];
				if (buf !== void 0) return buf;
				else {
					const newBuf = txCache.toBuffer();
					self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf;
					return newBuf;
				}
			},
			set(data) {
				self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data;
			}
		});
	}
	function inputFinalizeGetAmts(inputs, tx, cache, mustFinalize) {
		let inputAmount = 0;
		inputs.forEach((input, idx) => {
			if (mustFinalize && input.finalScriptSig) tx.ins[idx].script = input.finalScriptSig;
			if (mustFinalize && input.finalScriptWitness) tx.ins[idx].witness = scriptWitnessToWitnessStack(input.finalScriptWitness);
			if (input.witnessUtxo) inputAmount += input.witnessUtxo.value;
			else if (input.nonWitnessUtxo) {
				const nwTx = nonWitnessUtxoTxFromCache(cache, input, idx);
				const vout = tx.ins[idx].index;
				const out = nwTx.outs[vout];
				inputAmount += out.value;
			}
		});
		const outputAmount = tx.outs.reduce((total, o) => total + o.value, 0);
		const fee = inputAmount - outputAmount;
		if (fee < 0) throw new Error("Outputs are spending more than Inputs");
		const bytes = tx.virtualSize();
		cache.__FEE = fee;
		cache.__EXTRACTED_TX = tx;
		cache.__FEE_RATE = Math.floor(fee / bytes);
	}
	function nonWitnessUtxoTxFromCache(cache, input, inputIndex) {
		const c = cache.__NON_WITNESS_UTXO_TX_CACHE;
		if (!c[inputIndex]) addNonWitnessTxCache(cache, input, inputIndex);
		return c[inputIndex];
	}
	function getScriptFromUtxo(inputIndex, input, cache) {
		const { script } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
		return script;
	}
	function getScriptAndAmountFromUtxo(inputIndex, input, cache) {
		if (input.witnessUtxo !== void 0) return {
			script: input.witnessUtxo.script,
			value: input.witnessUtxo.value
		};
		else if (input.nonWitnessUtxo !== void 0) {
			const o = nonWitnessUtxoTxFromCache(cache, input, inputIndex).outs[cache.__TX.ins[inputIndex].index];
			return {
				script: o.script,
				value: o.value
			};
		} else throw new Error("Can't find pubkey in input without Utxo data");
	}
	function pubkeyInInput(pubkey, input, inputIndex, cache) {
		const { meaningfulScript } = getMeaningfulScript(getScriptFromUtxo(inputIndex, input, cache), inputIndex, "input", input.redeemScript, input.witnessScript);
		return (0, psbtutils_1.pubkeyInScript)(pubkey, meaningfulScript);
	}
	function pubkeyInOutput(pubkey, output, outputIndex, cache) {
		const script = cache.__TX.outs[outputIndex].script;
		const { meaningfulScript } = getMeaningfulScript(script, outputIndex, "output", output.redeemScript, output.witnessScript);
		return (0, psbtutils_1.pubkeyInScript)(pubkey, meaningfulScript);
	}
	function redeemFromFinalScriptSig(finalScript) {
		if (!finalScript) return;
		const decomp = bscript.decompile(finalScript);
		if (!decomp) return;
		const lastItem = decomp[decomp.length - 1];
		if (!Buffer.isBuffer(lastItem) || isPubkeyLike(lastItem) || isSigLike(lastItem)) return;
		if (!bscript.decompile(lastItem)) return;
		return lastItem;
	}
	function redeemFromFinalWitnessScript(finalScript) {
		if (!finalScript) return;
		const decomp = scriptWitnessToWitnessStack(finalScript);
		const lastItem = decomp[decomp.length - 1];
		if (isPubkeyLike(lastItem)) return;
		if (!bscript.decompile(lastItem)) return;
		return lastItem;
	}
	function compressPubkey(pubkey) {
		if (pubkey.length === 65) {
			const parity = pubkey[64] & 1;
			const newKey = pubkey.slice(0, 33);
			newKey[0] = 2 | parity;
			return newKey;
		}
		return pubkey.slice();
	}
	function isPubkeyLike(buf) {
		return buf.length === 33 && bscript.isCanonicalPubKey(buf);
	}
	function isSigLike(buf) {
		return bscript.isCanonicalScriptSignature(buf);
	}
	function getMeaningfulScript(script, index, ioType, redeemScript, witnessScript) {
		const isP2SH = (0, psbtutils_1.isP2SHScript)(script);
		const isP2SHP2WSH = isP2SH && redeemScript && (0, psbtutils_1.isP2WSHScript)(redeemScript);
		const isP2WSH = (0, psbtutils_1.isP2WSHScript)(script);
		if (isP2SH && redeemScript === void 0) throw new Error("scriptPubkey is P2SH but redeemScript missing");
		if ((isP2WSH || isP2SHP2WSH) && witnessScript === void 0) throw new Error("scriptPubkey or redeemScript is P2WSH but witnessScript missing");
		let meaningfulScript;
		if (isP2SHP2WSH) {
			meaningfulScript = witnessScript;
			checkRedeemScript(index, script, redeemScript, ioType);
			checkWitnessScript(index, redeemScript, witnessScript, ioType);
			checkInvalidP2WSH(meaningfulScript);
		} else if (isP2WSH) {
			meaningfulScript = witnessScript;
			checkWitnessScript(index, script, witnessScript, ioType);
			checkInvalidP2WSH(meaningfulScript);
		} else if (isP2SH) {
			meaningfulScript = redeemScript;
			checkRedeemScript(index, script, redeemScript, ioType);
		} else meaningfulScript = script;
		return {
			meaningfulScript,
			type: isP2SHP2WSH ? "p2sh-p2wsh" : isP2SH ? "p2sh" : isP2WSH ? "p2wsh" : "raw"
		};
	}
	function checkInvalidP2WSH(script) {
		if ((0, psbtutils_1.isP2WPKH)(script) || (0, psbtutils_1.isP2SHScript)(script)) throw new Error("P2WPKH or P2SH can not be contained within P2WSH");
	}
	function classifyScript(script) {
		if ((0, psbtutils_1.isP2WPKH)(script)) return "witnesspubkeyhash";
		if ((0, psbtutils_1.isP2PKH)(script)) return "pubkeyhash";
		if ((0, psbtutils_1.isP2MS)(script)) return "multisig";
		if ((0, psbtutils_1.isP2PK)(script)) return "pubkey";
		return "nonstandard";
	}
	function range(n) {
		return [...Array(n).keys()];
	}
}));
//#endregion
//#region node_modules/bitcoinjs-lib/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.initEccLib = exports.Transaction = exports.opcodes = exports.Psbt = exports.Block = exports.script = exports.payments = exports.networks = exports.crypto = exports.address = void 0;
	exports.address = require_address();
	exports.crypto = require_crypto();
	exports.networks = require_networks();
	exports.payments = require_payments();
	exports.script = require_script();
	var block_1 = require_block();
	Object.defineProperty(exports, "Block", {
		enumerable: true,
		get: function() {
			return block_1.Block;
		}
	});
	var psbt_1 = require_psbt();
	Object.defineProperty(exports, "Psbt", {
		enumerable: true,
		get: function() {
			return psbt_1.Psbt;
		}
	});
	/** @hidden */
	var ops_1 = require_ops();
	Object.defineProperty(exports, "opcodes", {
		enumerable: true,
		get: function() {
			return ops_1.OPS;
		}
	});
	var transaction_1 = require_transaction();
	Object.defineProperty(exports, "Transaction", {
		enumerable: true,
		get: function() {
			return transaction_1.Transaction;
		}
	});
	var ecc_lib_1 = require_ecc_lib();
	Object.defineProperty(exports, "initEccLib", {
		enumerable: true,
		get: function() {
			return ecc_lib_1.initEccLib;
		}
	});
}));
//#endregion
export { require_bs58check as n, require_src as t };
