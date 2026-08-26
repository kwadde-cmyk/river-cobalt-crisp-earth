import { t as __commonJSMin } from "../_runtime.mjs";
import { t as require_bip32_path } from "./bip32-path.mjs";
import { n as require_bs58check, t as require_src } from "./bitcoinjs-lib+[...].mjs";
//#region node_modules/ledger-bitcoin/build/main/lib/bip32.js
var require_bip32 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hardenedPathOf = exports.getXpubComponents = exports.pubkeyFromXpub = exports.pathStringToArray = exports.pathArrayToString = exports.bip32asBuffer = exports.pathElementsToBuffer = void 0;
	var bip32_path_1 = __importDefault(require_bip32_path());
	var bs58check_1 = __importDefault(require_bs58check());
	function pathElementsToBuffer(paths) {
		const buffer = Buffer.alloc(1 + paths.length * 4);
		buffer[0] = paths.length;
		paths.forEach((element, index) => {
			buffer.writeUInt32BE(element, 1 + 4 * index);
		});
		return buffer;
	}
	exports.pathElementsToBuffer = pathElementsToBuffer;
	function bip32asBuffer(path) {
		return pathElementsToBuffer(!path ? [] : pathStringToArray(path));
	}
	exports.bip32asBuffer = bip32asBuffer;
	function pathArrayToString(pathElements) {
		if (pathElements.length == 0) return "m";
		return bip32_path_1.default.fromPathArray(pathElements).toString();
	}
	exports.pathArrayToString = pathArrayToString;
	function pathStringToArray(path) {
		if (path == "m" || path == "") return [];
		return bip32_path_1.default.fromString(path).toPathArray();
	}
	exports.pathStringToArray = pathStringToArray;
	function pubkeyFromXpub(xpub) {
		const xpubBuf = bs58check_1.default.decode(xpub);
		return xpubBuf.slice(xpubBuf.length - 33);
	}
	exports.pubkeyFromXpub = pubkeyFromXpub;
	function getXpubComponents(xpub) {
		const xpubBuf = bs58check_1.default.decode(xpub);
		return {
			chaincode: xpubBuf.slice(13, 45),
			pubkey: xpubBuf.slice(xpubBuf.length - 33),
			version: xpubBuf.readUInt32BE(0)
		};
	}
	exports.getXpubComponents = getXpubComponents;
	function hardenedPathOf(pathElements) {
		for (let i = pathElements.length - 1; i >= 0; i--) if (pathElements[i] >= 2147483648) return pathElements.slice(0, i + 1);
		return [];
	}
	exports.hardenedPathOf = hardenedPathOf;
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/varint.js
var require_varint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createVarint = exports.parseVarint = exports.sanitizeBigintToNumber = void 0;
	function bigintToSmallEndian(value, length, buffer, offset) {
		for (let i = 0; i < length; i++) {
			if (buffer[i + offset] == void 0) throw Error("Buffer too small");
			buffer[i + offset] = Number(value % BigInt(256));
			value = value >> BigInt(8);
		}
	}
	function smallEndianToBigint(buffer, offset, length) {
		let result = BigInt(0);
		for (let i = 0; i < length; i++) {
			if (buffer[i + offset] == void 0) throw Error("Buffer too small");
			result += BigInt(buffer[i + offset]) << BigInt(i * 8);
		}
		return result;
	}
	/**
	* Converts a `bigint` to a `number` if it non-negative and at most MAX_SAFE_INTEGER; throws `RangeError` otherwise.
	* Used when converting a Bitcoin-style varint to a `number`, since varints could be larger than what the `Number`
	* class can represent without loss of precision.
	*
	* @param n the number to convert
	* @returns `n` as a `number`
	*/
	function sanitizeBigintToNumber(n) {
		if (n < 0) throw RangeError("Negative bigint is not a valid varint");
		if (n > Number.MAX_SAFE_INTEGER) throw RangeError("Too large for a Number");
		return Number(n);
	}
	exports.sanitizeBigintToNumber = sanitizeBigintToNumber;
	function getVarintSize(value) {
		if (typeof value == "number") value = sanitizeBigintToNumber(value);
		if (value < BigInt(0)) throw new RangeError("Negative numbers are not supported");
		if (value >= BigInt(1) << BigInt(64)) throw new RangeError("Too large for a Bitcoin-style varint");
		if (value < BigInt(253)) return 1;
		else if (value <= BigInt(65535)) return 3;
		else if (value <= BigInt(4294967295)) return 5;
		else return 9;
	}
	/**
	* Parses a Bitcoin-style variable length integer from a buffer, starting at the given `offset`. Returns a pair
	* containing the parsed `BigInt`, and its length in bytes from the buffer.
	*
	* @param data the `Buffer` from which the variable-length integer is read
	* @param offset a non-negative offset to read from
	* @returns a pair where the first element is the parsed BigInt, and the second element is the length in bytes parsed
	* from the buffer.
	*
	* @throws `RangeError` if offset is negative.
	* @throws `Error` if the buffer's end is reached withut parsing being completed.
	*/
	function parseVarint(data, offset) {
		if (offset < 0) throw RangeError("Negative offset is invalid");
		if (data[offset] == void 0) throw Error("Buffer too small");
		if (data[offset] < 253) return [BigInt(data[offset]), 1];
		else {
			let size;
			if (data[offset] === 253) size = 2;
			else if (data[offset] === 254) size = 4;
			else size = 8;
			return [smallEndianToBigint(data, offset + 1, size), size + 1];
		}
	}
	exports.parseVarint = parseVarint;
	function createVarint(value) {
		if (typeof value == "number") value = sanitizeBigintToNumber(value);
		const size = getVarintSize(value);
		value = BigInt(value);
		const buffer = Buffer.alloc(size);
		if (size == 1) buffer[0] = Number(value);
		else {
			if (size == 3) buffer[0] = 253;
			else if (size === 5) buffer[0] = 254;
			else buffer[0] = 255;
			bigintToSmallEndian(value, size - 1, buffer, 1);
		}
		return buffer;
	}
	exports.createVarint = createVarint;
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/buffertools.js
var require_buffertools = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BufferReader = exports.BufferWriter = exports.unsafeFrom64bitLE = exports.unsafeTo64bitLE = void 0;
	var varint_1 = require_varint();
	function unsafeTo64bitLE(n) {
		if (n > Number.MAX_SAFE_INTEGER) throw new Error("Can't convert numbers > MAX_SAFE_INT");
		const byteArray = Buffer.alloc(8, 0);
		for (let index = 0; index < byteArray.length; index++) {
			const byte = n & 255;
			byteArray[index] = byte;
			n = (n - byte) / 256;
		}
		return byteArray;
	}
	exports.unsafeTo64bitLE = unsafeTo64bitLE;
	function unsafeFrom64bitLE(byteArray) {
		let value = 0;
		if (byteArray.length != 8) throw new Error("Expected Bufffer of lenght 8");
		if (byteArray[7] != 0) throw new Error("Can't encode numbers > MAX_SAFE_INT");
		if (byteArray[6] > 31) throw new Error("Can't encode numbers > MAX_SAFE_INT");
		for (let i = byteArray.length - 1; i >= 0; i--) value = value * 256 + byteArray[i];
		return value;
	}
	exports.unsafeFrom64bitLE = unsafeFrom64bitLE;
	var BufferWriter = class {
		constructor() {
			this.bufs = [];
		}
		write(alloc, fn) {
			const b = Buffer.alloc(alloc);
			fn(b);
			this.bufs.push(b);
		}
		writeUInt8(i) {
			this.write(1, (b) => b.writeUInt8(i, 0));
		}
		writeInt32(i) {
			this.write(4, (b) => b.writeInt32LE(i, 0));
		}
		writeUInt32(i) {
			this.write(4, (b) => b.writeUInt32LE(i, 0));
		}
		writeUInt64(i) {
			const bytes = unsafeTo64bitLE(i);
			this.writeSlice(bytes);
		}
		writeVarInt(i) {
			this.bufs.push((0, varint_1.createVarint)(i));
		}
		writeSlice(slice) {
			this.bufs.push(Buffer.from(slice));
		}
		writeVarSlice(slice) {
			this.writeVarInt(slice.length);
			this.writeSlice(slice);
		}
		buffer() {
			return Buffer.concat(this.bufs);
		}
	};
	exports.BufferWriter = BufferWriter;
	var BufferReader = class {
		constructor(buffer, offset = 0) {
			this.buffer = buffer;
			this.offset = offset;
		}
		available() {
			return this.buffer.length - this.offset;
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
			return unsafeFrom64bitLE(this.readSlice(8));
		}
		readVarInt() {
			const [vi, vi_size] = (0, varint_1.parseVarint)(this.buffer, this.offset);
			this.offset += vi_size;
			return vi;
		}
		readSlice(n) {
			if (this.buffer.length < this.offset + n) throw new Error("Cannot read slice out of bounds");
			const result = this.buffer.slice(this.offset, this.offset + n);
			this.offset += n;
			return result;
		}
		readVarSlice() {
			const n = (0, varint_1.sanitizeBigintToNumber)(this.readVarInt());
			return this.readSlice(n);
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
//#region node_modules/ledger-bitcoin/build/main/lib/merkle.js
var require_merkle = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hashLeaf = exports.Merkle = void 0;
	var bitcoinjs_lib_1 = require_src();
	/**
	* This class implements the merkle tree used by Ledger Bitcoin app v2+,
	* which is documented at
	* https://github.com/LedgerHQ/app-bitcoin-new/blob/master/doc/merkle.md
	*/
	var Merkle = class {
		constructor(leaves, hasher = bitcoinjs_lib_1.crypto.sha256) {
			this.leaves = leaves;
			this.h = hasher;
			const nodes = this.calculateRoot(leaves);
			this.rootNode = nodes.root;
			this.leafNodes = nodes.leaves;
		}
		getRoot() {
			return this.rootNode.hash;
		}
		size() {
			return this.leaves.length;
		}
		getLeaves() {
			return this.leaves;
		}
		getLeafHash(index) {
			return this.leafNodes[index].hash;
		}
		getProof(index) {
			if (index >= this.leaves.length) throw Error("Index out of bounds");
			return proveNode(this.leafNodes[index]);
		}
		calculateRoot(leaves) {
			const n = leaves.length;
			if (n == 0) return {
				root: new Node(void 0, void 0, Buffer.alloc(32, 0)),
				leaves: []
			};
			if (n == 1) {
				const newNode = new Node(void 0, void 0, leaves[0]);
				return {
					root: newNode,
					leaves: [newNode]
				};
			}
			const leftCount = highestPowerOf2LessThan(n);
			const leftBranch = this.calculateRoot(leaves.slice(0, leftCount));
			const rightBranch = this.calculateRoot(leaves.slice(leftCount));
			const leftChild = leftBranch.root;
			const rightChild = rightBranch.root;
			const node = new Node(leftChild, rightChild, this.hashNode(leftChild.hash, rightChild.hash));
			leftChild.parent = node;
			rightChild.parent = node;
			return {
				root: node,
				leaves: leftBranch.leaves.concat(rightBranch.leaves)
			};
		}
		hashNode(left, right) {
			return this.h(Buffer.concat([
				Buffer.from([1]),
				left,
				right
			]));
		}
	};
	exports.Merkle = Merkle;
	function hashLeaf(buf, hashFunction = bitcoinjs_lib_1.crypto.sha256) {
		return hashConcat(Buffer.from([0]), buf, hashFunction);
	}
	exports.hashLeaf = hashLeaf;
	function hashConcat(bufA, bufB, hashFunction) {
		return hashFunction(Buffer.concat([bufA, bufB]));
	}
	var Node = class {
		constructor(left, right, hash) {
			this.leftChild = left;
			this.rightChild = right;
			this.hash = hash;
		}
		isLeaf() {
			return this.leftChild == void 0;
		}
	};
	function proveNode(node) {
		if (!node.parent) return [];
		if (node.parent.leftChild == node) {
			if (!node.parent.rightChild) throw new Error("Expected right child to exist");
			return [node.parent.rightChild.hash, ...proveNode(node.parent)];
		} else {
			if (!node.parent.leftChild) throw new Error("Expected left child to exist");
			return [node.parent.leftChild.hash, ...proveNode(node.parent)];
		}
	}
	function highestPowerOf2LessThan(n) {
		if (n < 2) throw Error("Expected n >= 2");
		if (isPowerOf2(n)) return n / 2;
		return 1 << Math.floor(Math.log2(n));
	}
	function isPowerOf2(n) {
		return (n & n - 1) == 0;
	}
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/clientCommands.js
var require_clientCommands = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClientCommandInterpreter = exports.GetMoreElementsCommand = exports.GetMerkleLeafIndexCommand = exports.GetMerkleLeafProofCommand = exports.GetPreimageCommand = exports.YieldCommand = void 0;
	var bitcoinjs_lib_1 = require_src();
	var buffertools_1 = require_buffertools();
	var merkle_1 = require_merkle();
	var varint_1 = require_varint();
	var ClientCommandCode;
	(function(ClientCommandCode) {
		ClientCommandCode[ClientCommandCode["YIELD"] = 16] = "YIELD";
		ClientCommandCode[ClientCommandCode["GET_PREIMAGE"] = 64] = "GET_PREIMAGE";
		ClientCommandCode[ClientCommandCode["GET_MERKLE_LEAF_PROOF"] = 65] = "GET_MERKLE_LEAF_PROOF";
		ClientCommandCode[ClientCommandCode["GET_MERKLE_LEAF_INDEX"] = 66] = "GET_MERKLE_LEAF_INDEX";
		ClientCommandCode[ClientCommandCode["GET_MORE_ELEMENTS"] = 160] = "GET_MORE_ELEMENTS";
	})(ClientCommandCode || (ClientCommandCode = {}));
	var ClientCommand = class {};
	var YieldCommand = class extends ClientCommand {
		constructor(results, progressCallback) {
			super();
			this.progressCallback = progressCallback;
			this.code = ClientCommandCode.YIELD;
			this.results = results;
		}
		execute(request) {
			this.results.push(Buffer.from(request.subarray(1)));
			if (this.progressCallback) this.progressCallback();
			return Buffer.from("");
		}
	};
	exports.YieldCommand = YieldCommand;
	var GetPreimageCommand = class extends ClientCommand {
		constructor(known_preimages, queue) {
			super();
			this.code = ClientCommandCode.GET_PREIMAGE;
			this.known_preimages = known_preimages;
			this.queue = queue;
		}
		execute(request) {
			const req = Buffer.from(request.subarray(1));
			if (req.length != 33) throw new Error("Invalid request, unexpected trailing data");
			if (req[0] != 0) throw new Error("Unsupported request, the first byte should be 0");
			const hash = Buffer.alloc(32);
			for (let i = 0; i < 32; i++) hash[i] = req[1 + i];
			const req_hash_hex = hash.toString("hex");
			const known_preimage = this.known_preimages.get(req_hash_hex);
			if (known_preimage != void 0) {
				const preimage_len_varint = (0, varint_1.createVarint)(known_preimage.length);
				const max_payload_size = 255 - preimage_len_varint.length - 1;
				const payload_size = Math.min(max_payload_size, known_preimage.length);
				if (payload_size < known_preimage.length) for (let i = payload_size; i < known_preimage.length; i++) this.queue.push(Buffer.from([known_preimage[i]]));
				return Buffer.concat([
					preimage_len_varint,
					Buffer.from([payload_size]),
					Buffer.from(known_preimage.subarray(0, payload_size))
				]);
			}
			throw Error(`Requested unknown preimage for: ${req_hash_hex}`);
		}
	};
	exports.GetPreimageCommand = GetPreimageCommand;
	var GetMerkleLeafProofCommand = class extends ClientCommand {
		constructor(known_trees, queue) {
			super();
			this.code = ClientCommandCode.GET_MERKLE_LEAF_PROOF;
			this.known_trees = known_trees;
			this.queue = queue;
		}
		execute(request) {
			const req = Buffer.from(request.subarray(1));
			if (req.length < 34) throw new Error("Invalid request, expected at least 34 bytes");
			const reqBuf = new buffertools_1.BufferReader(req);
			const hash_hex = reqBuf.readSlice(32).toString("hex");
			let tree_size;
			let leaf_index;
			try {
				tree_size = (0, varint_1.sanitizeBigintToNumber)(reqBuf.readVarInt());
				leaf_index = (0, varint_1.sanitizeBigintToNumber)(reqBuf.readVarInt());
			} catch (e) {
				throw new Error("Invalid request, couldn't parse tree_size or leaf_index");
			}
			const mt = this.known_trees.get(hash_hex);
			if (!mt) throw Error(`Requested Merkle leaf proof for unknown tree: ${hash_hex}`);
			if (leaf_index >= tree_size || mt.size() != tree_size) throw Error("Invalid index or tree size.");
			if (this.queue.length != 0) throw Error("This command should not execute when the queue is not empty.");
			const proof = mt.getProof(leaf_index);
			const n_response_elements = Math.min(Math.floor(221 / 32), proof.length);
			const n_leftover_elements = proof.length - n_response_elements;
			if (n_leftover_elements > 0) this.queue.push(...proof.slice(-n_leftover_elements));
			return Buffer.concat([
				mt.getLeafHash(leaf_index),
				Buffer.from([proof.length]),
				Buffer.from([n_response_elements]),
				...proof.slice(0, n_response_elements)
			]);
		}
	};
	exports.GetMerkleLeafProofCommand = GetMerkleLeafProofCommand;
	var GetMerkleLeafIndexCommand = class extends ClientCommand {
		constructor(known_trees) {
			super();
			this.code = ClientCommandCode.GET_MERKLE_LEAF_INDEX;
			this.known_trees = known_trees;
		}
		execute(request) {
			const req = Buffer.from(request.subarray(1));
			if (req.length != 64) throw new Error("Invalid request, unexpected trailing data");
			const root_hash = Buffer.alloc(32);
			for (let i = 0; i < 32; i++) root_hash[i] = req.readUInt8(i);
			const root_hash_hex = root_hash.toString("hex");
			const leef_hash = Buffer.alloc(32);
			for (let i = 0; i < 32; i++) leef_hash[i] = req.readUInt8(32 + i);
			const leef_hash_hex = leef_hash.toString("hex");
			const mt = this.known_trees.get(root_hash_hex);
			if (!mt) throw Error(`Requested Merkle leaf index for unknown root: ${root_hash_hex}`);
			let leaf_index = 0;
			let found = 0;
			for (let i = 0; i < mt.size(); i++) if (mt.getLeafHash(i).toString("hex") == leef_hash_hex) {
				found = 1;
				leaf_index = i;
				break;
			}
			return Buffer.concat([Buffer.from([found]), (0, varint_1.createVarint)(leaf_index)]);
		}
	};
	exports.GetMerkleLeafIndexCommand = GetMerkleLeafIndexCommand;
	var GetMoreElementsCommand = class extends ClientCommand {
		constructor(queue) {
			super();
			this.code = ClientCommandCode.GET_MORE_ELEMENTS;
			this.queue = queue;
		}
		execute(request) {
			if (request.length != 1) throw new Error("Invalid request, unexpected trailing data");
			if (this.queue.length === 0) throw new Error("No elements to get");
			const element_len = this.queue[0].length;
			if (this.queue.some((el) => el.length != element_len)) throw new Error("The queue contains elements with different byte length, which is not expected");
			const max_elements = Math.floor(253 / element_len);
			const n_returned_elements = Math.min(max_elements, this.queue.length);
			const returned_elements = this.queue.splice(0, n_returned_elements);
			return Buffer.concat([
				Buffer.from([n_returned_elements]),
				Buffer.from([element_len]),
				...returned_elements
			]);
		}
	};
	exports.GetMoreElementsCommand = GetMoreElementsCommand;
	/**
	* This class will dispatch a client command coming from the hardware device to
	* the appropriate client command implementation. Those client commands
	* typically requests data from a merkle tree or merkelized maps.
	*
	* A ClientCommandInterpreter is prepared by adding the merkle trees and
	* merkelized maps it should be able to serve to the hardware device. This class
	* doesn't know anything about the semantics of the data it holds, it just
	* serves merkle data. It doesn't even know in what context it is being
	* executed, ie SignPsbt, getWalletAddress, etc.
	*
	* If the command yelds results to the client, as signPsbt does, the yielded
	* data will be accessible after the command completed by calling getYielded(),
	* which will return the yields in the same order as they came in.
	*/
	var ClientCommandInterpreter = class {
		constructor(progressCallback) {
			this.roots = /* @__PURE__ */ new Map();
			this.preimages = /* @__PURE__ */ new Map();
			this.yielded = [];
			this.queue = [];
			this.commands = /* @__PURE__ */ new Map();
			const commands = [
				new YieldCommand(this.yielded, progressCallback),
				new GetPreimageCommand(this.preimages, this.queue),
				new GetMerkleLeafIndexCommand(this.roots),
				new GetMerkleLeafProofCommand(this.roots, this.queue),
				new GetMoreElementsCommand(this.queue)
			];
			for (const cmd of commands) {
				if (this.commands.has(cmd.code)) throw new Error(`Multiple commands with code ${cmd.code}`);
				this.commands.set(cmd.code, cmd);
			}
		}
		getYielded() {
			return this.yielded;
		}
		addKnownPreimage(preimage) {
			this.preimages.set(bitcoinjs_lib_1.crypto.sha256(preimage).toString("hex"), preimage);
		}
		addKnownList(elements) {
			for (const el of elements) {
				const preimage = Buffer.concat([Buffer.from([0]), el]);
				this.addKnownPreimage(preimage);
			}
			const mt = new merkle_1.Merkle(elements.map((el) => (0, merkle_1.hashLeaf)(el)));
			this.roots.set(mt.getRoot().toString("hex"), mt);
		}
		addKnownMapping(mm) {
			this.addKnownList(mm.keys);
			this.addKnownList(mm.values);
		}
		addKnownWalletPolicy(wp) {
			this.addKnownPreimage(wp.serialize());
			this.addKnownList(wp.keys.map((k) => Buffer.from(k, "ascii")));
			this.addKnownPreimage(Buffer.from(wp.descriptorTemplate));
		}
		execute(request) {
			if (request.length == 0) throw new Error("Unexpected empty command");
			const cmdCode = request[0];
			const cmd = this.commands.get(cmdCode);
			if (!cmd) throw new Error(`Unexpected command code ${cmdCode}`);
			return cmd.execute(request);
		}
	};
	exports.ClientCommandInterpreter = ClientCommandInterpreter;
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/merkleMap.js
var require_merkleMap = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MerkleMap = void 0;
	var merkle_1 = require_merkle();
	var varint_1 = require_varint();
	/**
	* This implements "Merkelized Maps", documented at
	* https://github.com/LedgerHQ/app-bitcoin-new/blob/master/doc/merkle.md#merkleized-maps
	*
	* A merkelized map consist of two merkle trees, one for the keys of
	* a map and one for the values of the same map, thus the two merkle
	* trees have the same shape. The commitment is the number elements
	* in the map followed by the keys' merkle root followed by the
	* values' merkle root.
	*/
	var MerkleMap = class {
		/**
		* @param keys Sorted list of (unhashed) keys
		* @param values values, in corresponding order as the keys, and of equal length
		*/
		constructor(keys, values) {
			if (keys.length != values.length) throw new Error("keys and values should have the same length");
			for (let i = 0; i < keys.length - 1; i++) if (keys[i].toString("hex") >= keys[i + 1].toString("hex")) throw new Error("keys must be in strictly increasing order");
			this.keys = keys;
			this.keysTree = new merkle_1.Merkle(keys.map((k) => (0, merkle_1.hashLeaf)(k)));
			this.values = values;
			this.valuesTree = new merkle_1.Merkle(values.map((v) => (0, merkle_1.hashLeaf)(v)));
		}
		commitment() {
			return Buffer.concat([
				(0, varint_1.createVarint)(this.keys.length),
				this.keysTree.getRoot(),
				this.valuesTree.getRoot()
			]);
		}
	};
	exports.MerkleMap = MerkleMap;
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/psbtv2.js
var require_psbtv2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PsbtV2 = exports.NoSuchEntry = exports.psbtOut = exports.psbtIn = exports.psbtGlobal = void 0;
	var bjs = __importStar(require_src());
	var buffertools_1 = require_buffertools();
	var varint_1 = require_varint();
	var psbtGlobal;
	(function(psbtGlobal) {
		psbtGlobal[psbtGlobal["UNSIGNED_TX"] = 0] = "UNSIGNED_TX";
		psbtGlobal[psbtGlobal["XPUB"] = 1] = "XPUB";
		psbtGlobal[psbtGlobal["TX_VERSION"] = 2] = "TX_VERSION";
		psbtGlobal[psbtGlobal["FALLBACK_LOCKTIME"] = 3] = "FALLBACK_LOCKTIME";
		psbtGlobal[psbtGlobal["INPUT_COUNT"] = 4] = "INPUT_COUNT";
		psbtGlobal[psbtGlobal["OUTPUT_COUNT"] = 5] = "OUTPUT_COUNT";
		psbtGlobal[psbtGlobal["TX_MODIFIABLE"] = 6] = "TX_MODIFIABLE";
		psbtGlobal[psbtGlobal["VERSION"] = 251] = "VERSION";
	})(psbtGlobal = exports.psbtGlobal || (exports.psbtGlobal = {}));
	var psbtIn;
	(function(psbtIn) {
		psbtIn[psbtIn["NON_WITNESS_UTXO"] = 0] = "NON_WITNESS_UTXO";
		psbtIn[psbtIn["WITNESS_UTXO"] = 1] = "WITNESS_UTXO";
		psbtIn[psbtIn["PARTIAL_SIG"] = 2] = "PARTIAL_SIG";
		psbtIn[psbtIn["SIGHASH_TYPE"] = 3] = "SIGHASH_TYPE";
		psbtIn[psbtIn["REDEEM_SCRIPT"] = 4] = "REDEEM_SCRIPT";
		psbtIn[psbtIn["WITNESS_SCRIPT"] = 5] = "WITNESS_SCRIPT";
		psbtIn[psbtIn["BIP32_DERIVATION"] = 6] = "BIP32_DERIVATION";
		psbtIn[psbtIn["FINAL_SCRIPTSIG"] = 7] = "FINAL_SCRIPTSIG";
		psbtIn[psbtIn["FINAL_SCRIPTWITNESS"] = 8] = "FINAL_SCRIPTWITNESS";
		psbtIn[psbtIn["PREVIOUS_TXID"] = 14] = "PREVIOUS_TXID";
		psbtIn[psbtIn["OUTPUT_INDEX"] = 15] = "OUTPUT_INDEX";
		psbtIn[psbtIn["SEQUENCE"] = 16] = "SEQUENCE";
		psbtIn[psbtIn["TAP_KEY_SIG"] = 19] = "TAP_KEY_SIG";
		psbtIn[psbtIn["TAP_BIP32_DERIVATION"] = 22] = "TAP_BIP32_DERIVATION";
	})(psbtIn = exports.psbtIn || (exports.psbtIn = {}));
	var psbtOut;
	(function(psbtOut) {
		psbtOut[psbtOut["REDEEM_SCRIPT"] = 0] = "REDEEM_SCRIPT";
		psbtOut[psbtOut["WITNESS_SCRIPT"] = 1] = "WITNESS_SCRIPT";
		psbtOut[psbtOut["BIP_32_DERIVATION"] = 2] = "BIP_32_DERIVATION";
		psbtOut[psbtOut["AMOUNT"] = 3] = "AMOUNT";
		psbtOut[psbtOut["SCRIPT"] = 4] = "SCRIPT";
		psbtOut[psbtOut["TAP_BIP32_DERIVATION"] = 7] = "TAP_BIP32_DERIVATION";
	})(psbtOut = exports.psbtOut || (exports.psbtOut = {}));
	var PSBT_MAGIC_BYTES = Buffer.from([
		112,
		115,
		98,
		116,
		255
	]);
	var NoSuchEntry = class extends Error {};
	exports.NoSuchEntry = NoSuchEntry;
	/**
	* Implements Partially Signed Bitcoin Transaction version 2, BIP370, as
	* documented at https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki
	* and https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
	*
	* A psbt is a data structure that can carry all relevant information about a
	* transaction through all stages of the signing process. From constructing an
	* unsigned transaction to extracting the final serialized transaction ready for
	* broadcast.
	*
	* This implementation is limited to what's needed in ledgerjs to carry out its
	* duties, which means that support for features like multisig or taproot script
	* path spending are not implemented. Specifically, it supports p2pkh,
	* p2wpkhWrappedInP2sh, p2wpkh and p2tr key path spending.
	*
	* This class is made purposefully dumb, so it's easy to add support for
	* complemantary fields as needed in the future.
	*/
	var PsbtV2 = class {
		constructor() {
			this.globalMap = /* @__PURE__ */ new Map();
			this.inputMaps = [];
			this.outputMaps = [];
		}
		setGlobalTxVersion(version) {
			this.setGlobal(psbtGlobal.TX_VERSION, uint32LE(version));
		}
		getGlobalTxVersion() {
			return this.getGlobal(psbtGlobal.TX_VERSION).readUInt32LE(0);
		}
		setGlobalFallbackLocktime(locktime) {
			this.setGlobal(psbtGlobal.FALLBACK_LOCKTIME, uint32LE(locktime));
		}
		getGlobalFallbackLocktime() {
			var _a;
			return (_a = this.getGlobalOptional(psbtGlobal.FALLBACK_LOCKTIME)) === null || _a === void 0 ? void 0 : _a.readUInt32LE(0);
		}
		setGlobalInputCount(inputCount) {
			this.setGlobal(psbtGlobal.INPUT_COUNT, varint(inputCount));
		}
		getGlobalInputCount() {
			return fromVarint(this.getGlobal(psbtGlobal.INPUT_COUNT));
		}
		setGlobalOutputCount(outputCount) {
			this.setGlobal(psbtGlobal.OUTPUT_COUNT, varint(outputCount));
		}
		getGlobalOutputCount() {
			return fromVarint(this.getGlobal(psbtGlobal.OUTPUT_COUNT));
		}
		setGlobalTxModifiable(byte) {
			this.setGlobal(psbtGlobal.TX_MODIFIABLE, byte);
		}
		getGlobalTxModifiable() {
			return this.getGlobalOptional(psbtGlobal.TX_MODIFIABLE);
		}
		setGlobalPsbtVersion(psbtVersion) {
			this.setGlobal(psbtGlobal.VERSION, uint32LE(psbtVersion));
		}
		getGlobalPsbtVersion() {
			return this.getGlobal(psbtGlobal.VERSION).readUInt32LE(0);
		}
		setInputNonWitnessUtxo(inputIndex, transaction) {
			this.setInput(inputIndex, psbtIn.NON_WITNESS_UTXO, b(), transaction);
		}
		getInputNonWitnessUtxo(inputIndex) {
			return this.getInputOptional(inputIndex, psbtIn.NON_WITNESS_UTXO, b());
		}
		setInputWitnessUtxo(inputIndex, amount, scriptPubKey) {
			const buf = new buffertools_1.BufferWriter();
			buf.writeSlice(uint64LE(amount));
			buf.writeVarSlice(scriptPubKey);
			this.setInput(inputIndex, psbtIn.WITNESS_UTXO, b(), buf.buffer());
		}
		getInputWitnessUtxo(inputIndex) {
			const utxo = this.getInputOptional(inputIndex, psbtIn.WITNESS_UTXO, b());
			if (!utxo) return void 0;
			const buf = new buffertools_1.BufferReader(utxo);
			return {
				amount: (0, buffertools_1.unsafeFrom64bitLE)(buf.readSlice(8)),
				scriptPubKey: buf.readVarSlice()
			};
		}
		setInputPartialSig(inputIndex, pubkey, signature) {
			this.setInput(inputIndex, psbtIn.PARTIAL_SIG, pubkey, signature);
		}
		getInputPartialSig(inputIndex, pubkey) {
			return this.getInputOptional(inputIndex, psbtIn.PARTIAL_SIG, pubkey);
		}
		setInputSighashType(inputIndex, sigHashtype) {
			this.setInput(inputIndex, psbtIn.SIGHASH_TYPE, b(), uint32LE(sigHashtype));
		}
		getInputSighashType(inputIndex) {
			const result = this.getInputOptional(inputIndex, psbtIn.SIGHASH_TYPE, b());
			if (!result) return void 0;
			return result.readUInt32LE(0);
		}
		setInputRedeemScript(inputIndex, redeemScript) {
			this.setInput(inputIndex, psbtIn.REDEEM_SCRIPT, b(), redeemScript);
		}
		getInputRedeemScript(inputIndex) {
			return this.getInputOptional(inputIndex, psbtIn.REDEEM_SCRIPT, b());
		}
		setInputWitnessScript(inputIndex, witnessScript) {
			this.setInput(inputIndex, psbtIn.WITNESS_SCRIPT, b(), witnessScript);
		}
		getInputWitnessScript(inputIndex) {
			return this.getInputOptional(inputIndex, psbtIn.WITNESS_SCRIPT, b());
		}
		setInputBip32Derivation(inputIndex, pubkey, masterFingerprint, path) {
			if (pubkey.length != 33) throw new Error("Invalid pubkey length: " + pubkey.length);
			this.setInput(inputIndex, psbtIn.BIP32_DERIVATION, pubkey, this.encodeBip32Derivation(masterFingerprint, path));
		}
		getInputBip32Derivation(inputIndex, pubkey) {
			const buf = this.getInputOptional(inputIndex, psbtIn.BIP32_DERIVATION, pubkey);
			if (!buf) return void 0;
			return this.decodeBip32Derivation(buf);
		}
		setInputFinalScriptsig(inputIndex, scriptSig) {
			this.setInput(inputIndex, psbtIn.FINAL_SCRIPTSIG, b(), scriptSig);
		}
		getInputFinalScriptsig(inputIndex) {
			return this.getInputOptional(inputIndex, psbtIn.FINAL_SCRIPTSIG, b());
		}
		setInputFinalScriptwitness(inputIndex, scriptWitness) {
			this.setInput(inputIndex, psbtIn.FINAL_SCRIPTWITNESS, b(), scriptWitness);
		}
		getInputFinalScriptwitness(inputIndex) {
			return this.getInput(inputIndex, psbtIn.FINAL_SCRIPTWITNESS, b());
		}
		setInputPreviousTxId(inputIndex, txid) {
			this.setInput(inputIndex, psbtIn.PREVIOUS_TXID, b(), txid);
		}
		getInputPreviousTxid(inputIndex) {
			return this.getInput(inputIndex, psbtIn.PREVIOUS_TXID, b());
		}
		setInputOutputIndex(inputIndex, outputIndex) {
			this.setInput(inputIndex, psbtIn.OUTPUT_INDEX, b(), uint32LE(outputIndex));
		}
		getInputOutputIndex(inputIndex) {
			return this.getInput(inputIndex, psbtIn.OUTPUT_INDEX, b()).readUInt32LE(0);
		}
		setInputSequence(inputIndex, sequence) {
			this.setInput(inputIndex, psbtIn.SEQUENCE, b(), uint32LE(sequence));
		}
		getInputSequence(inputIndex) {
			var _a, _b;
			return (_b = (_a = this.getInputOptional(inputIndex, psbtIn.SEQUENCE, b())) === null || _a === void 0 ? void 0 : _a.readUInt32LE(0)) !== null && _b !== void 0 ? _b : 4294967295;
		}
		setInputTapKeySig(inputIndex, sig) {
			this.setInput(inputIndex, psbtIn.TAP_KEY_SIG, b(), sig);
		}
		getInputTapKeySig(inputIndex) {
			return this.getInputOptional(inputIndex, psbtIn.TAP_KEY_SIG, b());
		}
		setInputTapBip32Derivation(inputIndex, pubkey, hashes, masterFingerprint, path) {
			if (pubkey.length != 32) throw new Error("Invalid pubkey length: " + pubkey.length);
			const buf = this.encodeTapBip32Derivation(hashes, masterFingerprint, path);
			this.setInput(inputIndex, psbtIn.TAP_BIP32_DERIVATION, pubkey, buf);
		}
		getInputTapBip32Derivation(inputIndex, pubkey) {
			const buf = this.getInput(inputIndex, psbtIn.TAP_BIP32_DERIVATION, pubkey);
			return this.decodeTapBip32Derivation(buf);
		}
		getInputKeyDatas(inputIndex, keyType) {
			return this.getKeyDatas(this.inputMaps[inputIndex], keyType);
		}
		setOutputRedeemScript(outputIndex, redeemScript) {
			this.setOutput(outputIndex, psbtOut.REDEEM_SCRIPT, b(), redeemScript);
		}
		getOutputRedeemScript(outputIndex) {
			return this.getOutput(outputIndex, psbtOut.REDEEM_SCRIPT, b());
		}
		setOutputBip32Derivation(outputIndex, pubkey, masterFingerprint, path) {
			this.setOutput(outputIndex, psbtOut.BIP_32_DERIVATION, pubkey, this.encodeBip32Derivation(masterFingerprint, path));
		}
		getOutputBip32Derivation(outputIndex, pubkey) {
			const buf = this.getOutput(outputIndex, psbtOut.BIP_32_DERIVATION, pubkey);
			return this.decodeBip32Derivation(buf);
		}
		setOutputAmount(outputIndex, amount) {
			this.setOutput(outputIndex, psbtOut.AMOUNT, b(), uint64LE(amount));
		}
		getOutputAmount(outputIndex) {
			const buf = this.getOutput(outputIndex, psbtOut.AMOUNT, b());
			return (0, buffertools_1.unsafeFrom64bitLE)(buf);
		}
		setOutputScript(outputIndex, scriptPubKey) {
			this.setOutput(outputIndex, psbtOut.SCRIPT, b(), scriptPubKey);
		}
		getOutputScript(outputIndex) {
			return this.getOutput(outputIndex, psbtOut.SCRIPT, b());
		}
		setOutputTapBip32Derivation(outputIndex, pubkey, hashes, fingerprint, path) {
			const buf = this.encodeTapBip32Derivation(hashes, fingerprint, path);
			this.setOutput(outputIndex, psbtOut.TAP_BIP32_DERIVATION, pubkey, buf);
		}
		getOutputTapBip32Derivation(outputIndex, pubkey) {
			const buf = this.getOutput(outputIndex, psbtOut.TAP_BIP32_DERIVATION, pubkey);
			return this.decodeTapBip32Derivation(buf);
		}
		deleteInputEntries(inputIndex, keyTypes) {
			this.inputMaps[inputIndex].forEach((_v, k, m) => {
				if (this.isKeyType(k, keyTypes)) m.delete(k);
			});
		}
		copy(to) {
			this.copyMap(this.globalMap, to.globalMap);
			this.copyMaps(this.inputMaps, to.inputMaps);
			this.copyMaps(this.outputMaps, to.outputMaps);
		}
		copyMaps(from, to) {
			from.forEach((m, index) => {
				const to_index = /* @__PURE__ */ new Map();
				this.copyMap(m, to_index);
				to[index] = to_index;
			});
		}
		copyMap(from, to) {
			from.forEach((v, k) => to.set(k, Buffer.from(v)));
		}
		serialize() {
			const buf = new buffertools_1.BufferWriter();
			buf.writeSlice(Buffer.from([
				112,
				115,
				98,
				116,
				255
			]));
			serializeMap(buf, this.globalMap);
			this.inputMaps.forEach((map) => {
				serializeMap(buf, map);
			});
			this.outputMaps.forEach((map) => {
				serializeMap(buf, map);
			});
			return buf.buffer();
		}
		deserialize(psbt) {
			const buf = new buffertools_1.BufferReader(psbt);
			if (!buf.readSlice(5).equals(PSBT_MAGIC_BYTES)) throw new Error("Invalid magic bytes");
			while (this.readKeyPair(this.globalMap, buf));
			let psbtVersion;
			try {
				psbtVersion = this.getGlobalPsbtVersion();
			} catch (_a) {
				psbtVersion = 0;
			}
			if (psbtVersion !== 0 && psbtVersion !== 2) throw new Error("Only PSBTs of version 0 or 2 are supported");
			let nInputs;
			let nOutputs;
			if (psbtVersion == 0) {
				const txRaw = this.getGlobal(psbtGlobal.UNSIGNED_TX);
				const tx = bjs.Transaction.fromBuffer(txRaw);
				nInputs = tx.ins.length;
				nOutputs = tx.outs.length;
			} else {
				nInputs = this.getGlobalInputCount();
				nOutputs = this.getGlobalOutputCount();
			}
			for (let i = 0; i < nInputs; i++) {
				this.inputMaps[i] = /* @__PURE__ */ new Map();
				while (this.readKeyPair(this.inputMaps[i], buf));
			}
			for (let i = 0; i < nOutputs; i++) {
				this.outputMaps[i] = /* @__PURE__ */ new Map();
				while (this.readKeyPair(this.outputMaps[i], buf));
			}
			this.normalizeToV2();
		}
		normalizeToV2() {
			var _a;
			const psbtVersion = (_a = this.getGlobalOptional(psbtGlobal.VERSION)) === null || _a === void 0 ? void 0 : _a.readInt32LE(0);
			if (psbtVersion === 2) return;
			else if (psbtVersion !== void 0) throw new Error("Invalid or unsupported value for PSBT_GLOBAL_VERSION");
			const txRaw = this.getGlobal(psbtGlobal.UNSIGNED_TX);
			const tx = bjs.Transaction.fromBuffer(txRaw);
			this.setGlobalPsbtVersion(2);
			this.setGlobalTxVersion(tx.version);
			this.setGlobalFallbackLocktime(tx.locktime);
			this.setGlobalInputCount(tx.ins.length);
			this.setGlobalOutputCount(tx.outs.length);
			for (let i = 0; i < tx.ins.length; i++) {
				this.setInputPreviousTxId(i, tx.ins[i].hash);
				this.setInputOutputIndex(i, tx.ins[i].index);
				this.setInputSequence(i, tx.ins[i].sequence);
			}
			for (let i = 0; i < tx.outs.length; i++) {
				this.setOutputAmount(i, tx.outs[i].value);
				this.setOutputScript(i, tx.outs[i].script);
			}
			this.globalMap.delete(psbtGlobal.UNSIGNED_TX.toString(16).padStart(2, "0"));
		}
		/**
		* Imports a BitcoinJS (bitcoinjs-lib) Psbt object.
		* https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/ts_src/psbt.ts
		*
		* Prepares the fields required for signing a Psbt on a Ledger
		* device. It should be used exclusively before calling
		* `appClient.signPsbt()` and not as a general Psbt conversion method.
		*
		* Note: This method supports all the policies that the Ledger is able to
		* sign, with the exception of taproot: tr(@0).
		*/
		fromBitcoinJS(psbtBJS) {
			function isTaprootInput(input) {
				let isP2TR;
				try {
					bjs.payments.p2tr({ output: input.witnessUtxo.script });
					isP2TR = true;
				} catch (err) {
					isP2TR = false;
				}
				return input && !!(input.tapInternalKey || input.tapMerkleRoot || input.tapLeafScript && input.tapLeafScript.length || input.tapBip32Derivation && input.tapBip32Derivation.length || isP2TR);
			}
			this.setGlobalPsbtVersion(2);
			this.setGlobalTxVersion(psbtBJS.version);
			this.setGlobalInputCount(psbtBJS.data.inputs.length);
			this.setGlobalOutputCount(psbtBJS.txOutputs.length);
			if (psbtBJS.locktime !== void 0) this.setGlobalFallbackLocktime(psbtBJS.locktime);
			psbtBJS.data.inputs.forEach((input, index) => {
				if (isTaprootInput(input)) throw new Error(`Taproot inputs not supported`);
				this.setInputPreviousTxId(index, psbtBJS.txInputs[index].hash);
				if (psbtBJS.txInputs[index].sequence !== void 0) this.setInputSequence(index, psbtBJS.txInputs[index].sequence);
				this.setInputOutputIndex(index, psbtBJS.txInputs[index].index);
				if (input.sighashType !== void 0) this.setInputSighashType(index, input.sighashType);
				if (input.nonWitnessUtxo) this.setInputNonWitnessUtxo(index, input.nonWitnessUtxo);
				if (input.witnessUtxo) this.setInputWitnessUtxo(index, input.witnessUtxo.value, input.witnessUtxo.script);
				if (input.witnessScript) this.setInputWitnessScript(index, input.witnessScript);
				if (input.redeemScript) this.setInputRedeemScript(index, input.redeemScript);
				psbtBJS.data.inputs[index].bip32Derivation.forEach((derivation) => {
					if (!/^m\//i.test(derivation.path)) throw new Error(`Invalid input bip32 derivation`);
					const pathArray = derivation.path.replace(/m\//i, "").split("/").map((level) => level.match(/['h]/i) ? parseInt(level) + 2147483648 : Number(level));
					this.setInputBip32Derivation(index, derivation.pubkey, derivation.masterFingerprint, pathArray);
				});
			});
			psbtBJS.txOutputs.forEach((output, index) => {
				this.setOutputAmount(index, output.value);
				this.setOutputScript(index, output.script);
			});
			return this;
		}
		readKeyPair(map, buf) {
			const keyLen = (0, varint_1.sanitizeBigintToNumber)(buf.readVarInt());
			if (keyLen == 0) return false;
			set(map, buf.readUInt8(), buf.readSlice(keyLen - 1), buf.readVarSlice());
			return true;
		}
		getKeyDatas(map, keyType) {
			const result = [];
			map.forEach((_v, k) => {
				if (this.isKeyType(k, [keyType])) result.push(Buffer.from(k.substring(2), "hex"));
			});
			return result;
		}
		isKeyType(hexKey, keyTypes) {
			const keyType = Buffer.from(hexKey.substring(0, 2), "hex").readUInt8(0);
			return keyTypes.some((k) => k == keyType);
		}
		setGlobal(keyType, value) {
			const key = new Key(keyType, Buffer.from([]));
			this.globalMap.set(key.toString(), value);
		}
		getGlobal(keyType) {
			return get(this.globalMap, keyType, b(), false);
		}
		getGlobalOptional(keyType) {
			return get(this.globalMap, keyType, b(), true);
		}
		setInput(index, keyType, keyData, value) {
			set(this.getMap(index, this.inputMaps), keyType, keyData, value);
		}
		getInput(index, keyType, keyData) {
			return get(this.inputMaps[index], keyType, keyData, false);
		}
		getInputOptional(index, keyType, keyData) {
			return get(this.inputMaps[index], keyType, keyData, true);
		}
		setOutput(index, keyType, keyData, value) {
			set(this.getMap(index, this.outputMaps), keyType, keyData, value);
		}
		getOutput(index, keyType, keyData) {
			return get(this.outputMaps[index], keyType, keyData, false);
		}
		getMap(index, maps) {
			if (maps[index]) return maps[index];
			return maps[index] = /* @__PURE__ */ new Map();
		}
		encodeBip32Derivation(masterFingerprint, path) {
			const buf = new buffertools_1.BufferWriter();
			this.writeBip32Derivation(buf, masterFingerprint, path);
			return buf.buffer();
		}
		decodeBip32Derivation(buffer) {
			const buf = new buffertools_1.BufferReader(buffer);
			return this.readBip32Derivation(buf);
		}
		writeBip32Derivation(buf, masterFingerprint, path) {
			buf.writeSlice(masterFingerprint);
			path.forEach((element) => {
				buf.writeUInt32(element);
			});
		}
		readBip32Derivation(buf) {
			const masterFingerprint = buf.readSlice(4);
			const path = [];
			while (buf.offset < buf.buffer.length) path.push(buf.readUInt32());
			return {
				masterFingerprint,
				path
			};
		}
		encodeTapBip32Derivation(hashes, masterFingerprint, path) {
			const buf = new buffertools_1.BufferWriter();
			buf.writeVarInt(hashes.length);
			hashes.forEach((h) => {
				buf.writeSlice(h);
			});
			this.writeBip32Derivation(buf, masterFingerprint, path);
			return buf.buffer();
		}
		decodeTapBip32Derivation(buffer) {
			const buf = new buffertools_1.BufferReader(buffer);
			const hashCount = (0, varint_1.sanitizeBigintToNumber)(buf.readVarInt());
			const hashes = [];
			for (let i = 0; i < hashCount; i++) hashes.push(buf.readSlice(32));
			const deriv = this.readBip32Derivation(buf);
			return Object.assign({ hashes }, deriv);
		}
	};
	exports.PsbtV2 = PsbtV2;
	function get(map, keyType, keyData, acceptUndefined) {
		if (!map) throw Error("No such map");
		const key = new Key(keyType, keyData);
		const value = map.get(key.toString());
		if (!value) {
			if (acceptUndefined) return;
			throw new NoSuchEntry(key.toString());
		}
		return Buffer.from(value);
	}
	var Key = class {
		constructor(keyType, keyData) {
			this.keyType = keyType;
			this.keyData = keyData;
		}
		toString() {
			const buf = new buffertools_1.BufferWriter();
			this.toBuffer(buf);
			return buf.buffer().toString("hex");
		}
		serialize(buf) {
			buf.writeVarInt(1 + this.keyData.length);
			this.toBuffer(buf);
		}
		toBuffer(buf) {
			buf.writeUInt8(this.keyType);
			buf.writeSlice(this.keyData);
		}
	};
	var KeyPair = class {
		constructor(key, value) {
			this.key = key;
			this.value = value;
		}
		serialize(buf) {
			this.key.serialize(buf);
			buf.writeVarSlice(this.value);
		}
	};
	function createKey(buf) {
		return new Key(buf.readUInt8(0), buf.slice(1));
	}
	function serializeMap(buf, map) {
		for (let [key, value] of [...map].sort(([k1], [k2]) => k1.localeCompare(k2))) new KeyPair(createKey(Buffer.from(key, "hex")), value).serialize(buf);
		buf.writeUInt8(0);
	}
	function b() {
		return Buffer.from([]);
	}
	function set(map, keyType, keyData, value) {
		const key = new Key(keyType, keyData);
		map.set(key.toString(), value);
	}
	function uint32LE(n) {
		const buf = Buffer.alloc(4);
		buf.writeUInt32LE(n, 0);
		return buf;
	}
	function uint64LE(n) {
		return (0, buffertools_1.unsafeTo64bitLE)(n);
	}
	function varint(n) {
		const buf = new buffertools_1.BufferWriter();
		buf.writeVarInt(n);
		return buf.buffer();
	}
	function fromVarint(buf) {
		return (0, varint_1.sanitizeBigintToNumber)(new buffertools_1.BufferReader(buf).readVarInt());
	}
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/merkelizedPsbt.js
var require_merkelizedPsbt = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MerkelizedPsbt = void 0;
	var merkleMap_1 = require_merkleMap();
	var psbtv2_1 = require_psbtv2();
	exports.MerkelizedPsbt = class MerkelizedPsbt extends psbtv2_1.PsbtV2 {
		constructor(psbt) {
			super();
			this.inputMerkleMaps = [];
			this.outputMerkleMaps = [];
			psbt.copy(this);
			this.globalMerkleMap = MerkelizedPsbt.createMerkleMap(this.globalMap);
			for (let i = 0; i < this.getGlobalInputCount(); i++) this.inputMerkleMaps.push(MerkelizedPsbt.createMerkleMap(this.inputMaps[i]));
			this.inputMapCommitments = [...this.inputMerkleMaps.values()].map((v) => v.commitment());
			for (let i = 0; i < this.getGlobalOutputCount(); i++) this.outputMerkleMaps.push(MerkelizedPsbt.createMerkleMap(this.outputMaps[i]));
			this.outputMapCommitments = [...this.outputMerkleMaps.values()].map((v) => v.commitment());
		}
		getGlobalSize() {
			return this.globalMap.size;
		}
		getGlobalKeysValuesRoot() {
			return this.globalMerkleMap.commitment();
		}
		static createMerkleMap(map) {
			const sortedKeysStrings = [...map.keys()].sort();
			const values = sortedKeysStrings.map((k) => {
				const v = map.get(k);
				if (!v) throw new Error("No value for key " + k);
				return v;
			});
			const sortedKeys = sortedKeysStrings.map((k) => Buffer.from(k, "hex"));
			return new merkleMap_1.MerkleMap(sortedKeys, values);
		}
	};
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/appClient.js
var require_appClient = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AppClient = exports.PartialSignature = void 0;
	var bip32_1 = require_bip32();
	var clientCommands_1 = require_clientCommands();
	var merkelizedPsbt_1 = require_merkelizedPsbt();
	var merkle_1 = require_merkle();
	var psbtv2_1 = require_psbtv2();
	var varint_1 = require_varint();
	var CLA_BTC = 225;
	var CLA_FRAMEWORK = 248;
	var CURRENT_PROTOCOL_VERSION = 1;
	var BitcoinIns;
	(function(BitcoinIns) {
		BitcoinIns[BitcoinIns["GET_PUBKEY"] = 0] = "GET_PUBKEY";
		BitcoinIns[BitcoinIns["REGISTER_WALLET"] = 2] = "REGISTER_WALLET";
		BitcoinIns[BitcoinIns["GET_WALLET_ADDRESS"] = 3] = "GET_WALLET_ADDRESS";
		BitcoinIns[BitcoinIns["SIGN_PSBT"] = 4] = "SIGN_PSBT";
		BitcoinIns[BitcoinIns["GET_MASTER_FINGERPRINT"] = 5] = "GET_MASTER_FINGERPRINT";
		BitcoinIns[BitcoinIns["SIGN_MESSAGE"] = 16] = "SIGN_MESSAGE";
	})(BitcoinIns || (BitcoinIns = {}));
	var FrameworkIns;
	(function(FrameworkIns) {
		FrameworkIns[FrameworkIns["CONTINUE_INTERRUPTED"] = 1] = "CONTINUE_INTERRUPTED";
	})(FrameworkIns || (FrameworkIns = {}));
	/**
	* This class represents a partial signature produced by the app during signing.
	* It always contains the `signature` and the corresponding `pubkey` whose private key
	* was used for signing; in the case of taproot script paths, it also contains the
	* tapleaf hash.
	*/
	var PartialSignature = class {
		constructor(pubkey, signature, tapleafHash) {
			this.pubkey = pubkey;
			this.signature = signature;
			this.tapleafHash = tapleafHash;
		}
	};
	exports.PartialSignature = PartialSignature;
	/**
	* Creates an instance of `PartialSignature` from the returned raw augmented pubkey and signature.
	* @param pubkeyAugm the public key, concatenated with the tapleaf hash in the case of taproot script path spend.
	* @param signature the signature
	* @returns an instance of `PartialSignature`.
	*/
	function makePartialSignature(pubkeyAugm, signature) {
		if (pubkeyAugm.length == 64) return new PartialSignature(pubkeyAugm.slice(0, 32), signature, pubkeyAugm.slice(32, 64));
		else if (pubkeyAugm.length == 32 || pubkeyAugm.length == 33) return new PartialSignature(pubkeyAugm, signature);
		else throw new Error(`Invalid length for pubkeyAugm: ${pubkeyAugm.length} bytes.`);
	}
	/**
	* Checks whether a descriptor template contains an `a:` fragment.
	*/
	function containsA(descriptorTemplate) {
		return (descriptorTemplate.match(/[asctdvjnlu]+:/g) || []).some((match) => match.includes("a"));
	}
	/**
	* This class encapsulates the APDU protocol documented at
	* https://github.com/LedgerHQ/app-bitcoin-new/blob/master/doc/bitcoin.md
	*/
	var AppClient = class {
		constructor(transport) {
			this.transport = transport;
		}
		async makeRequest(ins, data, cci) {
			let response = await this.transport.send(CLA_BTC, ins, 0, CURRENT_PROTOCOL_VERSION, data, [36864, 57344]);
			while (response.readUInt16BE(response.length - 2) === 57344) {
				if (!cci) throw new Error("Unexpected SW_INTERRUPTED_EXECUTION");
				const hwRequest = response.slice(0, -2);
				const commandResponse = cci.execute(hwRequest);
				response = await this.transport.send(CLA_FRAMEWORK, FrameworkIns.CONTINUE_INTERRUPTED, 0, 0, commandResponse, [36864, 57344]);
			}
			return response.slice(0, -2);
		}
		/**
		* Returns an object containing the currently running app's name, version and the device status flags.
		*
		* @returns an object with app name, version and device status flags.
		*/
		async getAppAndVersion() {
			const r = await this.transport.send(176, 1, 0, 0);
			let i = 0;
			if (r[i++] !== 1) throw new Error("Unexpected response");
			const nameLength = r[i++];
			const name = r.slice(i, i += nameLength).toString("ascii");
			const versionLength = r[i++];
			const version = r.slice(i, i += versionLength).toString("ascii");
			const flagLength = r[i++];
			return {
				name,
				version,
				flags: r.slice(i, i += flagLength)
			};
		}
		/**
		* Requests the BIP-32 extended pubkey to the hardware wallet.
		* If `display` is `false`, only standard paths will be accepted; an error is returned if an unusual path is
		* requested.
		* If `display` is `true`, the requested path is shown on screen for user verification; unusual paths can be
		* requested, and a warning is shown to the user in that case.
		*
		* @param path the requested BIP-32 path as a string
		* @param display `false` to silently retrieve a pubkey for a standard path, `true` to display the path on screen
		* @returns the base58-encoded serialized extended pubkey (xpub)
		*/
		async getExtendedPubkey(path, display = false) {
			const pathElements = (0, bip32_1.pathStringToArray)(path);
			if (pathElements.length > 6) throw new Error("Path too long. At most 6 levels allowed.");
			return (await this.makeRequest(BitcoinIns.GET_PUBKEY, Buffer.concat([Buffer.from(display ? [1] : [0]), (0, bip32_1.pathElementsToBuffer)(pathElements)]))).toString("ascii");
		}
		/**
		* Registers a `WalletPolicy`, after interactive verification from the user.
		* On success, after user's approval, this function returns the id (which is the same that can be computed with
		* `walletPolicy.getid()`), followed by the 32-byte hmac. The client should store the hmac to use it for future
		* requests to `getWalletAddress` or `signPsbt` using this `WalletPolicy`.
		*
		* @param walletPolicy the `WalletPolicy` to register
		* @returns a pair of two 32-byte arrays: the id of the Wallet Policy, followed by the policy hmac
		*/
		async registerWallet(walletPolicy) {
			await this.validatePolicy(walletPolicy);
			const clientInterpreter = new clientCommands_1.ClientCommandInterpreter();
			clientInterpreter.addKnownWalletPolicy(walletPolicy);
			const serializedWalletPolicy = walletPolicy.serialize();
			const response = await this.makeRequest(BitcoinIns.REGISTER_WALLET, Buffer.concat([(0, varint_1.createVarint)(serializedWalletPolicy.length), serializedWalletPolicy]), clientInterpreter);
			if (response.length != 64) throw Error(`Invalid response length. Expected 64 bytes, got ${response.length}`);
			return [response.subarray(0, 32), response.subarray(32)];
		}
		/**
		* Returns the address of `walletPolicy` for the given `change` and `addressIndex`.
		*
		* @param walletPolicy the `WalletPolicy` to use
		* @param walletHMAC the 32-byte hmac returned during wallet registration for a registered policy; otherwise
		* `null` for a standard policy
		* @param change `0` for a normal receive address, `1` for a change address
		* @param addressIndex the address index to retrieve
		* @param display `True` to show the address on screen, `False` to retrieve it silently
		* @returns the address, as an ascii string.
		*/
		async getWalletAddress(walletPolicy, walletHMAC, change, addressIndex, display) {
			if (change !== 0 && change !== 1) throw new Error("Change can only be 0 or 1");
			if (addressIndex < 0 || !Number.isInteger(addressIndex)) throw new Error("Invalid address index");
			if (walletHMAC != null && walletHMAC.length != 32) throw new Error("Invalid HMAC length");
			await this.validatePolicy(walletPolicy);
			const clientInterpreter = new clientCommands_1.ClientCommandInterpreter();
			clientInterpreter.addKnownWalletPolicy(walletPolicy);
			const addressIndexBuffer = Buffer.alloc(4);
			addressIndexBuffer.writeUInt32BE(addressIndex, 0);
			return (await this.makeRequest(BitcoinIns.GET_WALLET_ADDRESS, Buffer.concat([
				Buffer.from(display ? [1] : [0]),
				walletPolicy.getId(),
				walletHMAC || Buffer.alloc(32, 0),
				Buffer.from([change]),
				addressIndexBuffer
			]), clientInterpreter)).toString("ascii");
		}
		/**
		* Signs a psbt using a (standard or registered) `WalletPolicy`. This is an interactive command, as user validation
		* is necessary using the device's secure screen.
		* On success, a map of input indexes and signatures is returned.
		* @param psbt a base64-encoded string, or a psbt in a binary Buffer. Using the `PsbtV2` type is deprecated.
		* @param walletPolicy the `WalletPolicy` to use for signing
		* @param walletHMAC the 32-byte hmac obtained during wallet policy registration, or `null` for a standard policy
		* @param progressCallback optionally, a callback that will be called every time a signature is produced during
		* the signing process. The callback does not receive any argument, but can be used to track progress.
		* @returns an array of of tuples with 2 elements containing:
		*    - the index of the input being signed;
		*    - an instance of PartialSignature
		*/
		async signPsbt(psbt, walletPolicy, walletHMAC, progressCallback) {
			await this.validatePolicy(walletPolicy);
			if (typeof psbt === "string") psbt = Buffer.from(psbt, "base64");
			if (Buffer.isBuffer(psbt)) {
				const psbtObj = new psbtv2_1.PsbtV2();
				psbtObj.deserialize(psbt);
				psbt = psbtObj;
			}
			const merkelizedPsbt = new merkelizedPsbt_1.MerkelizedPsbt(psbt);
			if (walletHMAC != null && walletHMAC.length != 32) throw new Error("Invalid HMAC length");
			const clientInterpreter = new clientCommands_1.ClientCommandInterpreter(progressCallback);
			clientInterpreter.addKnownWalletPolicy(walletPolicy);
			clientInterpreter.addKnownMapping(merkelizedPsbt.globalMerkleMap);
			for (const map of merkelizedPsbt.inputMerkleMaps) clientInterpreter.addKnownMapping(map);
			for (const map of merkelizedPsbt.outputMerkleMaps) clientInterpreter.addKnownMapping(map);
			clientInterpreter.addKnownList(merkelizedPsbt.inputMapCommitments);
			const inputMapsRoot = new merkle_1.Merkle(merkelizedPsbt.inputMapCommitments.map((m) => (0, merkle_1.hashLeaf)(m))).getRoot();
			clientInterpreter.addKnownList(merkelizedPsbt.outputMapCommitments);
			const outputMapsRoot = new merkle_1.Merkle(merkelizedPsbt.outputMapCommitments.map((m) => (0, merkle_1.hashLeaf)(m))).getRoot();
			await this.makeRequest(BitcoinIns.SIGN_PSBT, Buffer.concat([
				merkelizedPsbt.getGlobalKeysValuesRoot(),
				(0, varint_1.createVarint)(merkelizedPsbt.getGlobalInputCount()),
				inputMapsRoot,
				(0, varint_1.createVarint)(merkelizedPsbt.getGlobalOutputCount()),
				outputMapsRoot,
				walletPolicy.getId(),
				walletHMAC || Buffer.alloc(32, 0)
			]), clientInterpreter);
			const yielded = clientInterpreter.getYielded();
			const ret = [];
			for (const inputAndSig of yielded) {
				const [inputIndex, inputIndexLen] = (0, varint_1.parseVarint)(inputAndSig, 0);
				const pubkeyAugmLen = inputAndSig[inputIndexLen];
				const partialSig = makePartialSignature(inputAndSig.subarray(inputIndexLen + 1, inputIndexLen + 1 + pubkeyAugmLen), inputAndSig.subarray(inputIndexLen + 1 + pubkeyAugmLen));
				ret.push([Number(inputIndex), partialSig]);
			}
			return ret;
		}
		/**
		* Returns the fingerprint of the master public key, as per BIP-32 standard.
		* @returns the master key fingerprint as a string of 8 hexadecimal digits.
		*/
		async getMasterFingerprint() {
			return (await this.makeRequest(BitcoinIns.GET_MASTER_FINGERPRINT, Buffer.from([]))).toString("hex");
		}
		/**
		* Signs a message using the legacy Bitcoin Message Signing standard. The signed message is
		* the double-sha256 hash of the concatenation of:
		* - "\x18Bitcoin Signed Message:\n";
		* - the length of `message`, encoded as a Bitcoin-style variable length integer;
		* - `message`.
		*
		* @param message the serialized message to sign
		* @param path the BIP-32 path of the key used to sign the message
		* @returns base64-encoded signature of the message.
		*/
		async signMessage(message, path) {
			const pathElements = (0, bip32_1.pathStringToArray)(path);
			const clientInterpreter = new clientCommands_1.ClientCommandInterpreter();
			const nChunks = Math.ceil(message.length / 64);
			const chunks = [];
			for (let i = 0; i < nChunks; i++) chunks.push(message.subarray(64 * i, 64 * i + 64));
			clientInterpreter.addKnownList(chunks);
			const chunksRoot = new merkle_1.Merkle(chunks.map((m) => (0, merkle_1.hashLeaf)(m))).getRoot();
			return (await this.makeRequest(BitcoinIns.SIGN_MESSAGE, Buffer.concat([
				(0, bip32_1.pathElementsToBuffer)(pathElements),
				(0, varint_1.createVarint)(message.length),
				chunksRoot
			]), clientInterpreter)).toString("base64");
		}
		async validatePolicy(walletPolicy) {
			if (containsA(walletPolicy.descriptorTemplate)) {
				const appAndVer = await this.getAppAndVersion();
				if (["2.1.0", "2.1.1"].includes(appAndVer.version)) throw new Error("Please update your Ledger Bitcoin app.");
			}
		}
	};
	exports.AppClient = AppClient;
	exports.default = AppClient;
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/lib/policy.js
var require_policy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DefaultWalletPolicy = exports.WalletPolicy = void 0;
	var bitcoinjs_lib_1 = require_src();
	var buffertools_1 = require_buffertools();
	var merkle_1 = require_merkle();
	var WALLET_POLICY_V2 = 2;
	/**
	* The Bitcon hardware app uses a descriptors-like thing to describe
	* how to construct output scripts from keys. A "Wallet Policy" consists
	* of a "Descriptor Template" and a list of "keys". A key is basically
	* a serialized BIP32 extended public key with some added derivation path
	* information. This is documented at
	* https://github.com/LedgerHQ/app-bitcoin-new/blob/master/doc/wallet.md
	*/
	var WalletPolicy = class {
		/**
		* Creates and instance of a wallet policy.
		* @param name an ascii string, up to 16 bytes long; it must be an empty string for default wallet policies
		* @param descriptorTemplate the wallet policy template
		* @param keys and array of the keys, with the key derivation information
		*/
		constructor(name, descriptorTemplate, keys) {
			this.name = name;
			this.descriptorTemplate = descriptorTemplate;
			this.keys = keys;
		}
		/**
		* Returns the unique 32-bytes id of this wallet policy.
		*/
		getId() {
			return bitcoinjs_lib_1.crypto.sha256(this.serialize());
		}
		/**
		* Serializes the wallet policy for transmission via the hardware wallet protocol.
		* @returns the serialized wallet policy
		*/
		serialize() {
			const keyBuffers = this.keys.map((k) => {
				return Buffer.from(k, "ascii");
			});
			const m = new merkle_1.Merkle(keyBuffers.map((k) => (0, merkle_1.hashLeaf)(k)));
			const buf = new buffertools_1.BufferWriter();
			buf.writeUInt8(WALLET_POLICY_V2);
			buf.writeVarSlice(Buffer.from(this.name, "ascii"));
			buf.writeVarInt(this.descriptorTemplate.length);
			buf.writeSlice(bitcoinjs_lib_1.crypto.sha256(Buffer.from(this.descriptorTemplate)));
			buf.writeVarInt(this.keys.length);
			buf.writeSlice(m.getRoot());
			return buf.buffer();
		}
	};
	exports.WalletPolicy = WalletPolicy;
	/**
	* Simplified class to handle default wallet policies that can be used without policy registration.
	*/
	var DefaultWalletPolicy = class extends WalletPolicy {
		constructor(descriptorTemplate, key) {
			super("", descriptorTemplate, [key]);
		}
	};
	exports.DefaultWalletPolicy = DefaultWalletPolicy;
}));
//#endregion
//#region node_modules/ledger-bitcoin/build/main/index.js
var require_main = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WalletPolicy = exports.DefaultWalletPolicy = exports.PsbtV2 = exports.AppClient = void 0;
	var appClient_1 = __importDefault(require_appClient());
	exports.AppClient = appClient_1.default;
	var policy_1 = require_policy();
	Object.defineProperty(exports, "DefaultWalletPolicy", {
		enumerable: true,
		get: function() {
			return policy_1.DefaultWalletPolicy;
		}
	});
	Object.defineProperty(exports, "WalletPolicy", {
		enumerable: true,
		get: function() {
			return policy_1.WalletPolicy;
		}
	});
	var psbtv2_1 = require_psbtv2();
	Object.defineProperty(exports, "PsbtV2", {
		enumerable: true,
		get: function() {
			return psbtv2_1.PsbtV2;
		}
	});
	exports.default = appClient_1.default;
}));
//#endregion
export { require_main as t };
