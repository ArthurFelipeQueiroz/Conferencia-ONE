var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/can-promise.js"(exports, module) {
    module.exports = function() {
      return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
    };
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = /* @__PURE__ */ __name(function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    }, "getSymbolSize");
    exports.getSymbolTotalCodewords = /* @__PURE__ */ __name(function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    }, "getSymbolTotalCodewords");
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = /* @__PURE__ */ __name(function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    }, "setToSJISFunction");
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = /* @__PURE__ */ __name(function toSJIS(kanji) {
      return toSJISFunction(kanji);
    }, "toSJIS");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    __name(fromString, "fromString");
    exports.isValid = /* @__PURE__ */ __name(function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    }, "isValid");
    exports.from = /* @__PURE__ */ __name(function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    }, "from");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    __name(BitBuffer, "BitBuffer");
    BitBuffer.prototype = {
      get: /* @__PURE__ */ __name(function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      }, "get"),
      put: /* @__PURE__ */ __name(function(num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit((num >>> length - i - 1 & 1) === 1);
        }
      }, "put"),
      getLengthInBits: /* @__PURE__ */ __name(function() {
        return this.length;
      }, "getLengthInBits"),
      putBit: /* @__PURE__ */ __name(function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }, "putBit")
    };
    module.exports = BitBuffer;
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    __name(BitMatrix, "BitMatrix");
    BitMatrix.prototype.set = function(row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value) {
      this.data[row * this.size + col] ^= value;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module.exports = BitMatrix;
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = /* @__PURE__ */ __name(function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    }, "getRowColCoords");
    exports.getPositions = /* @__PURE__ */ __name(function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j = 0; j < posLength; j++) {
          if (i === 0 && j === 0 || // top-left
          i === 0 && j === posLength - 1 || // bottom-left
          i === posLength - 1 && j === 0) {
            continue;
          }
          coords.push([pos[i], pos[j]]);
        }
      }
      return coords;
    }, "getPositions");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = /* @__PURE__ */ __name(function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    }, "getPositions");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = /* @__PURE__ */ __name(function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    }, "isValid");
    exports.from = /* @__PURE__ */ __name(function from(value) {
      return exports.isValid(value) ? parseInt(value, 10) : void 0;
    }, "from");
    exports.getPenaltyN1 = /* @__PURE__ */ __name(function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module2 = data.get(row, col);
          if (module2 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module2;
            sameCountCol = 1;
          }
          module2 = data.get(col, row);
          if (module2 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module2;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    }, "getPenaltyN1");
    exports.getPenaltyN2 = /* @__PURE__ */ __name(function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    }, "getPenaltyN2");
    exports.getPenaltyN3 = /* @__PURE__ */ __name(function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    }, "getPenaltyN3");
    exports.getPenaltyN4 = /* @__PURE__ */ __name(function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    }, "getPenaltyN4");
    function getMaskAt(maskPattern, i, j) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    __name(getMaskAt, "getMaskAt");
    exports.applyMask = /* @__PURE__ */ __name(function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    }, "applyMask");
    exports.getBestMask = /* @__PURE__ */ __name(function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p = 0; p < numPatterns; p++) {
        setupFormatFunc(p);
        exports.applyMask(p, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p;
        }
      }
      return bestPattern;
    }, "getBestMask");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = /* @__PURE__ */ __name(function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    }, "getBlocksCount");
    exports.getTotalCodewordsCount = /* @__PURE__ */ __name(function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    }, "getTotalCodewordsCount");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (/* @__PURE__ */ __name(function initTables() {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 256) {
          x ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    }, "initTables"))();
    exports.log = /* @__PURE__ */ __name(function log(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    }, "log");
    exports.exp = /* @__PURE__ */ __name(function exp(n) {
      return EXP_TABLE[n];
    }, "exp");
    exports.mul = /* @__PURE__ */ __name(function mul(x, y) {
      if (x === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
    }, "mul");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = /* @__PURE__ */ __name(function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    }, "mul");
    exports.mod = /* @__PURE__ */ __name(function mod(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    }, "mod");
    exports.generateECPolynomial = /* @__PURE__ */ __name(function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    }, "generateECPolynomial");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    __name(ReedSolomonEncoder, "ReedSolomonEncoder");
    ReedSolomonEncoder.prototype.initialize = /* @__PURE__ */ __name(function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    }, "initialize");
    ReedSolomonEncoder.prototype.encode = /* @__PURE__ */ __name(function encode(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    }, "encode");
    module.exports = ReedSolomonEncoder;
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = /* @__PURE__ */ __name(function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    }, "isValid");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = /* @__PURE__ */ __name(function testKanji(str) {
      return TEST_KANJI.test(str);
    }, "testKanji");
    exports.testNumeric = /* @__PURE__ */ __name(function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    }, "testNumeric");
    exports.testAlphanumeric = /* @__PURE__ */ __name(function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    }, "testAlphanumeric");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = /* @__PURE__ */ __name(function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    }, "getCharCountIndicator");
    exports.getBestModeForData = /* @__PURE__ */ __name(function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    }, "getBestModeForData");
    exports.toString = /* @__PURE__ */ __name(function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    }, "toString");
    exports.isValid = /* @__PURE__ */ __name(function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    }, "isValid");
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    __name(fromString, "fromString");
    exports.from = /* @__PURE__ */ __name(function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    }, "from");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    __name(getBestVersionForDataLength, "getBestVersionForDataLength");
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    __name(getReservedBitsCount, "getReservedBitsCount");
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    __name(getTotalBitsFromDataArray, "getTotalBitsFromDataArray");
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length = getTotalBitsFromDataArray(segments, currentVersion);
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    __name(getBestVersionForMixedData, "getBestVersionForMixedData");
    exports.from = /* @__PURE__ */ __name(function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    }, "from");
    exports.getCapacity = /* @__PURE__ */ __name(function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    }, "getCapacity");
    exports.getBestVersionForData = /* @__PURE__ */ __name(function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    }, "getBestVersionForData");
    exports.getEncodedBits = /* @__PURE__ */ __name(function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version << 12 | d;
    }, "getEncodedBits");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = /* @__PURE__ */ __name(function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d = data << 10;
      while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
      }
      return (data << 10 | d) ^ G15_MASK;
    }, "getEncodedBits");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    __name(NumericData, "NumericData");
    NumericData.getBitsLength = /* @__PURE__ */ __name(function getBitsLength(length) {
      return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
    }, "getBitsLength");
    NumericData.prototype.getLength = /* @__PURE__ */ __name(function getLength() {
      return this.data.length;
    }, "getLength");
    NumericData.prototype.getBitsLength = /* @__PURE__ */ __name(function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    }, "getBitsLength");
    NumericData.prototype.write = /* @__PURE__ */ __name(function write(bitBuffer) {
      let i, group, value;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);
        bitBuffer.put(value, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);
        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    }, "write");
    module.exports = NumericData;
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    __name(AlphanumericData, "AlphanumericData");
    AlphanumericData.getBitsLength = /* @__PURE__ */ __name(function getBitsLength(length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2);
    }, "getBitsLength");
    AlphanumericData.prototype.getLength = /* @__PURE__ */ __name(function getLength() {
      return this.data.length;
    }, "getLength");
    AlphanumericData.prototype.getBitsLength = /* @__PURE__ */ __name(function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    }, "getBitsLength");
    AlphanumericData.prototype.write = /* @__PURE__ */ __name(function write(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    }, "write");
    module.exports = AlphanumericData;
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    __name(ByteData, "ByteData");
    ByteData.getBitsLength = /* @__PURE__ */ __name(function getBitsLength(length) {
      return length * 8;
    }, "getBitsLength");
    ByteData.prototype.getLength = /* @__PURE__ */ __name(function getLength() {
      return this.data.length;
    }, "getLength");
    ByteData.prototype.getBitsLength = /* @__PURE__ */ __name(function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    }, "getBitsLength");
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module.exports = ByteData;
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    __name(KanjiData, "KanjiData");
    KanjiData.getBitsLength = /* @__PURE__ */ __name(function getBitsLength(length) {
      return length * 13;
    }, "getBitsLength");
    KanjiData.prototype.getLength = /* @__PURE__ */ __name(function getLength() {
      return this.data.length;
    }, "getLength");
    KanjiData.prototype.getBitsLength = /* @__PURE__ */ __name(function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    }, "getBitsLength");
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value = Utils.toSJIS(this.data[i]);
        if (value >= 33088 && value <= 40956) {
          value -= 33088;
        } else if (value >= 57408 && value <= 60351) {
          value -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value = (value >>> 8 & 255) * 192 + (value & 255);
        bitBuffer.put(value, 13);
      }
    };
    module.exports = KanjiData;
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/dijkstrajs/dijkstra.js"(exports, module) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: /* @__PURE__ */ __name(function(graph, s, d) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v)) {
              cost_of_e = adjacent_nodes[v];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v];
              first_visit = typeof costs[v] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v] = u;
              }
            }
          }
        }
        if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      }, "single_source_shortest_paths"),
      extract_shortest_path_from_predecessor_list: /* @__PURE__ */ __name(function(predecessors, d) {
        var nodes = [];
        var u = d;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      }, "extract_shortest_path_from_predecessor_list"),
      find_path: /* @__PURE__ */ __name(function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d
        );
      }, "find_path"),
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: /* @__PURE__ */ __name(function(opts) {
          var T = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T) {
            if (T.hasOwnProperty(key)) {
              t[key] = T[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T.default_sorter;
          return t;
        }, "make"),
        default_sorter: /* @__PURE__ */ __name(function(a, b) {
          return a.cost - b.cost;
        }, "default_sorter"),
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: /* @__PURE__ */ __name(function(value, cost) {
          var item = { value, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        }, "push"),
        /**
         * Return the highest priority element in the queue.
         */
        pop: /* @__PURE__ */ __name(function() {
          return this.queue.shift();
        }, "pop"),
        empty: /* @__PURE__ */ __name(function() {
          return this.queue.length === 0;
        }, "empty")
      }
    };
    if (typeof module !== "undefined") {
      module.exports = dijkstra;
    }
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    __name(getStringByteLength, "getStringByteLength");
    function getSegments(regex, mode, str) {
      const segments = [];
      let result;
      while ((result = regex.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    __name(getSegments, "getSegments");
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    __name(getSegmentsFromString, "getSegmentsFromString");
    function getSegmentBitsLength(length, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
      }
    }
    __name(getSegmentBitsLength, "getSegmentBitsLength");
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    __name(mergeSegments, "mergeSegments");
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    __name(buildNodes, "buildNodes");
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j = 0; j < nodeGroup.length; j++) {
          const node = nodeGroup[j];
          const key = "" + i + j;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    __name(buildGraph, "buildGraph");
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    __name(buildSingleSegment, "buildSingleSegment");
    exports.fromArray = /* @__PURE__ */ __name(function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    }, "fromArray");
    exports.fromString = /* @__PURE__ */ __name(function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    }, "fromString");
    exports.rawSplit = /* @__PURE__ */ __name(function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    }, "rawSplit");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue;
            if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    __name(setupFinderPattern, "setupFinderPattern");
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }
    __name(setupTimingPattern, "setupTimingPattern");
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    __name(setupAlignmentPattern, "setupAlignmentPattern");
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = (bits >> i & 1) === 1;
        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }
    __name(setupVersionInfo, "setupVersionInfo");
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;
      for (i = 0; i < 15; i++) {
        mod = (bits >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    __name(setupFormatInfo, "setupFormatInfo");
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    __name(setupData, "setupData");
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    __name(createData, "createData");
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b = 0; b < ecTotalBlocks; b++) {
        const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b] = buffer.slice(offset, offset + dataSize);
        ecData[b] = rs.encode(dcData[b]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    __name(createCodewords, "createCodewords");
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    __name(createSymbol, "createSymbol");
    exports.create = /* @__PURE__ */ __name(function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    }, "create");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex2) {
      if (typeof hex2 === "number") {
        hex2 = hex2.toString();
      }
      if (typeof hex2 !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex2.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex2);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
          return [c, c];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    __name(hex2rgba, "hex2rgba");
    exports.getOptions = /* @__PURE__ */ __name(function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    }, "getOptions");
    exports.getScale = /* @__PURE__ */ __name(function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    }, "getScale");
    exports.getImageWidth = /* @__PURE__ */ __name(function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    }, "getImageWidth");
    exports.qrToImageData = /* @__PURE__ */ __name(function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j = 0; j < symbolSize; j++) {
          let posDst = (i * symbolSize + j) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    }, "qrToImageData");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/renderer/canvas.js"(exports) {
    var Utils = require_utils2();
    function clearCanvas(ctx, canvas, size) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!canvas.style) canvas.style = {};
      canvas.height = size;
      canvas.width = size;
      canvas.style.height = size + "px";
      canvas.style.width = size + "px";
    }
    __name(clearCanvas, "clearCanvas");
    function getCanvasElement() {
      try {
        return document.createElement("canvas");
      } catch (e) {
        throw new Error("You need to specify a canvas element");
      }
    }
    __name(getCanvasElement, "getCanvasElement");
    exports.render = /* @__PURE__ */ __name(function render(qrData, canvas, options) {
      let opts = options;
      let canvasEl = canvas;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!canvas) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    }, "render");
    exports.renderToDataURL = /* @__PURE__ */ __name(function renderToDataURL(qrData, canvas, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports.render(qrData, canvas, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    }, "renderToDataURL");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    __name(getColorAttrib, "getColorAttrib");
    function svgCmd(cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    __name(svgCmd, "svgCmd");
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    __name(qrToPath, "qrToPath");
    exports.render = /* @__PURE__ */ __name(function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    }, "render");
  }
});

// ../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/browser.js
var require_browser = __commonJS({
  "../../0e0fb55c6264/conferencia-one/node_modules/qrcode/lib/browser.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var CanvasRenderer = require_canvas();
    var SvgRenderer = require_svg_tag();
    function renderCanvas(renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === "function";
      if (!isLastArgCb && !canPromise()) {
        throw new Error("Callback required as last argument");
      }
      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === "undefined") {
            cb = opts;
            opts = void 0;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = void 0;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 1) {
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = void 0;
        }
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }
    __name(renderCanvas, "renderCanvas");
    exports.create = QRCode2.create;
    exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
    exports.toString = renderCanvas.bind(null, function(data, _, opts) {
      return SvgRenderer.render(data, opts);
    });
  }
});

// src/index.ts
var import_qrcode = __toESM(require_browser(), 1);

// src/reconciliation.mjs
var clean = /* @__PURE__ */ __name((v) => String(v ?? "").trim(), "clean");
var norm = /* @__PURE__ */ __name((v) => clean(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " "), "norm");
var digits = /* @__PURE__ */ __name((v) => clean(v).replace(/\D/g, ""), "digits");
var timestamp = /* @__PURE__ */ __name((v) => clean(v).replace("T", " ").replace(/\.\d+Z?$/, "").replace(/Z$/, ""), "timestamp");
var amount = /* @__PURE__ */ __name((v) => {
  let s = clean(v).replace(/[^\d,.-]/g, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "");
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}, "amount");
var ageOf = /* @__PURE__ */ __name((v) => {
  const m = /^(\d{1,2})(?:\s*anos?)?$/i.exec(clean(v));
  return m && +m[1] > 0 ? +m[1] : null;
}, "ageOf");
var quoteId = /* @__PURE__ */ __name((name) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error("Nome de tabela inv\xE1lido.");
  return '"' + name + '"';
}, "quoteId");
var pair = /* @__PURE__ */ __name((p) => norm(p.full_name) + "|" + digits(p.contact), "pair");
var identity = /* @__PURE__ */ __name((p) => pair(p) + "|" + timestamp(p.registered_at), "identity");
function planRoster(items, existing, previousMapping = []) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 200) throw new Error("Base oficial inv\xE1lida.");
  const ordered = [...items].sort((a, b) => +a.source_row - +b.source_row);
  const seen = /* @__PURE__ */ new Set(), used = /* @__PURE__ */ new Set(), conflicts = [], matches = [];
  const oldByRow = new Map(existing.map((p) => [+p.source_row, p]));
  const saved = new Map(previousMapping.map((p) => [+p.official_source_row, p]));
  const counts = /* @__PURE__ */ new Map();
  for (const p of ordered) counts.set(pair(p), (counts.get(pair(p)) || 0) + 1);
  let nextRow = Math.max(1, ...existing.map((p) => +p.source_row)), moved = 0, contactCorrections = 0, nameCorrections = 0;
  for (const input of ordered) {
    const officialRow = +input.source_row;
    if (!Number.isInteger(officialRow) || officialRow < 2 || seen.has(officialRow) || norm(input.full_name).length < 3 || !timestamp(input.registered_at)) throw new Error("Inscri\xE7\xE3o oficial sem identificador, nome ou data v\xE1lida.");
    seen.add(officialRow);
    if (!["volunteer", "support", "adolescent"].includes(input.roster_group)) throw new Error("Grupo oficial ausente na linha " + officialRow);
    const hasShirt = norm(input.shirt_requested) === "sim", inputSize = clean(input.shirt_size).toUpperCase();
    if (hasShirt && !["PP", "P", "M", "G", "GG", "XGG"].includes(inputSize)) throw new Error("Tamanho inv\xE1lido na linha " + officialRow);
    let old;
    const previous = saved.get(officialRow);
    if (previous) {
      const candidate = oldByRow.get(+previous.database_source_row);
      if (!candidate || identity(candidate) !== identity(input)) {
        conflicts.push("Linha oficial " + officialRow + ": a identidade mudou desde a concilia\xE7\xE3o anterior.");
        continue;
      }
      old = candidate;
    } else {
      const exact = existing.filter((p) => !used.has(+p.source_row) && identity(p) === identity(input));
      if (exact.length === 1) old = exact[0];
      else if (exact.length > 1) {
        conflicts.push("Linha oficial " + officialRow + ": mais de uma ficha com nome, telefone e data id\xEAnticos.");
        continue;
      } else {
        const sameNameTime = existing.filter((p) => !used.has(+p.source_row) && norm(p.full_name) === norm(input.full_name) && timestamp(p.registered_at) === timestamp(input.registered_at));
        const samePhoneTime = existing.filter((p) => !used.has(+p.source_row) && digits(p.contact) === digits(input.contact) && timestamp(p.registered_at) === timestamp(input.registered_at) && norm(p.guardian_name) === norm(input.guardian_name) && ageOf(p.age_raw) === ageOf(input.age_raw));
        const candidates = [...new Map([...sameNameTime, ...samePhoneTime].map((p) => [+p.source_row, p])).values()];
        if (candidates.length === 1) old = candidates[0];
        else if (candidates.length > 1) {
          conflicts.push("Linha oficial " + officialRow + ": correspond\xEAncia amb\xEDgua; hist\xF3rico preservado.");
          continue;
        }
      }
    }
    if (old && used.has(+old.source_row)) {
      conflicts.push("Linha oficial " + officialRow + ": duas inscri\xE7\xF5es apontam para a mesma ficha antiga.");
      continue;
    }
    if (old) {
      used.add(+old.source_row);
      if (+old.source_row !== officialRow) moved++;
      if (digits(old.contact) !== digits(input.contact)) contactCorrections++;
      if (norm(old.full_name) !== norm(input.full_name)) nameCorrections++;
    }
    matches.push({
      ...input,
      official_source_row: officialRow,
      source_row: old ? +old.source_row : ++nextRow,
      database_source_row: old ? +old.source_row : nextRow,
      is_new: !old,
      full_name: clean(input.full_name),
      normalized_name: norm(input.full_name),
      contact: clean(input.contact),
      contact_digits: digits(input.contact),
      age_raw: clean(input.age_raw),
      age: ageOf(input.age_raw),
      shirt_requested: hasShirt ? 1 : 0,
      shirt_size: hasShirt ? inputSize === "XGG" ? "GG" : inputSize : null,
      shirt_payment_status: amount(input.payment_raw) >= 50 ? "confirmed" : "unverified",
      registration_type: input.roster_group === "adolescent" ? "adolescent" : "team",
      duplicate_status: digits(input.contact).length >= 9 && counts.get(pair(input)) > 1 ? "needs_review" : "clear",
      media_consent: norm(input.media_consent).includes("sim") ? 1 : 0
    });
  }
  const extras = existing.filter((p) => !used.has(+p.source_row));
  return {
    matches,
    conflicts,
    extras,
    total: ordered.length,
    existing_rows: used.size,
    new_rows: matches.filter((p) => p.is_new).length,
    moved_rows: moved,
    contact_corrections: contactCorrections,
    name_corrections: nameCorrections,
    groups: Object.fromEntries(["volunteer", "support", "adolescent"].map((group) => [group, ordered.filter((p) => p.roster_group === group).length]))
  };
}
__name(planRoster, "planRoster");
async function snapshotDatabase(db) {
  const schema = (await db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'enr_backup_%' AND name<>'enr_reconcile_guards' ORDER BY type='table' DESC,name").all()).results;
  const originals = schema.filter((s) => s.type === "table");
  if (!originals.some((s) => s.name === "participants") || originals.length > 25) throw new Error("Esquema inesperado; backup n\xE3o criado.");
  const id = Date.now().toString() + "_" + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const tables = originals.map((s, i) => ({ original: s.name, copy: "enr_backup_" + id + "_" + i }));
  const operations = [db.prepare("CREATE TABLE IF NOT EXISTS enr_backup_manifest(id TEXT PRIMARY KEY,created_at TEXT NOT NULL DEFAULT (datetime('now')),metadata TEXT NOT NULL)")];
  for (const t of tables) operations.push(db.prepare("CREATE TABLE " + quoteId(t.copy) + " AS SELECT * FROM " + quoteId(t.original)));
  operations.push(db.prepare("INSERT INTO enr_backup_manifest(id,metadata) VALUES(?,?)").bind(id, JSON.stringify({ schema, tables })));
  await db.batch(operations);
  const participantsTable = tables.find((t) => t.original === "participants").copy;
  const counts = await db.prepare("SELECT count(*) total,sum(active=1) active,sum(checkin_at IS NOT NULL) checked_in,sum(arrival_at IS NOT NULL) arrived,sum(shirt_delivered_at IS NOT NULL) shirts,sum(prize_delivered_at IS NOT NULL) prizes FROM " + quoteId(participantsTable)).first();
  return { id, counts, table_count: tables.length };
}
__name(snapshotDatabase, "snapshotDatabase");
async function loadSnapshot(db, id) {
  if (!/^\d{13}_[a-f0-9]{8}$/.test(id)) throw new Error("Identificador de backup inv\xE1lido.");
  const row = await db.prepare("SELECT metadata FROM enr_backup_manifest WHERE id=?").bind(id).first();
  if (!row) throw new Error("Backup n\xE3o encontrado.");
  return JSON.parse(row.metadata);
}
__name(loadSnapshot, "loadSnapshot");
var sqlValue = /* @__PURE__ */ __name((value) => value == null ? "NULL" : typeof value === "number" ? String(value) : Array.isArray(value) ? "X'" + value.map((v) => (+v).toString(16).padStart(2, "0")).join("") + "'" : "'" + String(value).replace(/'/g, "''") + "'", "sqlValue");
async function exportSnapshot(db, id) {
  const meta = await loadSnapshot(db, id), lines = ["-- ENRAIZADOS: backup privado do D1 antes da reconcilia\xE7\xE3o.", "-- Backup " + id, "PRAGMA defer_foreign_keys=ON;"];
  for (const t of meta.tables) {
    const schema = meta.schema.find((s) => s.type === "table" && s.name === t.original);
    lines.push(schema.sql.replace(/;\s*$/, "") + ";");
  }
  for (const t of meta.tables) {
    const rows = (await db.prepare("SELECT * FROM " + quoteId(t.copy)).all()).results;
    for (const row of rows) lines.push("INSERT INTO " + quoteId(t.original) + "(" + Object.keys(row).map(quoteId).join(",") + ") VALUES(" + Object.values(row).map(sqlValue).join(",") + ");");
  }
  for (const s of meta.schema.filter((s2) => s2.type !== "table")) lines.push(s.sql.replace(/;\s*$/, "") + ";");
  return lines.join("\n");
}
__name(exportSnapshot, "exportSnapshot");
function reconciliationStatements(db, plan, snapshot, locked, runId, actorId) {
  const before = quoteId(snapshot.tables.find((t) => t.original === "participants").copy);
  const configBefore = quoteId(snapshot.tables.find((t) => t.original === "event_config").copy);
  const payload = JSON.stringify(plan.matches), j = /* @__PURE__ */ __name((field) => "json_extract(j.value,'$." + field + "')", "j");
  const updateFields = ["full_name", "normalized_name", "contact", "contact_digits", "guardian_name", "church", "previous_attendance", "media_consent", "registration_type"].map((f) => f + "=" + j(f));
  updateFields.push(
    "shirt_requested=CASE WHEN p.shirt_delivered_at IS NOT NULL THEN p.shirt_requested ELSE " + j("shirt_requested") + " END",
    "shirt_size=CASE WHEN p.shirt_delivered_at IS NOT NULL THEN p.shirt_size ELSE " + j("shirt_size") + " END",
    "payment_raw=CASE WHEN " + j("shirt_payment_status") + "='confirmed' THEN " + j("payment_raw") + " ELSE p.payment_raw END",
    "shirt_payment_status=CASE WHEN p.shirt_payment_status IN ('confirmed','waived') THEN p.shirt_payment_status ELSE " + j("shirt_payment_status") + " END"
  );
  if (!locked) updateFields.push(
    "age=CASE WHEN p.checkin_at IS NOT NULL OR COALESCE(p.review_note,'')<>'' OR p.prize_eligible=1 THEN p.age ELSE " + j("age") + " END",
    "age_raw=CASE WHEN p.checkin_at IS NOT NULL OR COALESCE(p.review_note,'')<>'' OR p.prize_eligible=1 THEN p.age_raw ELSE " + j("age_raw") + " END",
    "duplicate_status=CASE WHEN p.duplicate_status<>'clear' OR COALESCE(p.review_note,'')<>'' THEN p.duplicate_status ELSE " + j("duplicate_status") + " END"
  );
  const columns = ["source_row", "registered_at", "full_name", "normalized_name", "guardian_name", "contact", "contact_digits", "age_raw", "age", "duplicate_status", "church", "shirt_requested", "shirt_size", "previous_attendance", "media_consent", "payment_raw", "shirt_payment_status", "registration_type", "ticket_token"];
  return [
    db.prepare("CREATE TABLE IF NOT EXISTS enr_reconcile_guards(id TEXT PRIMARY KEY,ok INTEGER NOT NULL CHECK(ok=1))"),
    db.prepare("INSERT INTO enr_reconcile_guards(id,ok) SELECT ?,CASE WHEN NOT EXISTS(SELECT * FROM participants EXCEPT SELECT * FROM " + before + ") AND NOT EXISTS(SELECT * FROM " + before + " EXCEPT SELECT * FROM participants) AND NOT EXISTS(SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%' EXCEPT SELECT key,value FROM " + configBefore + " WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%') AND NOT EXISTS(SELECT key,value FROM " + configBefore + " WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%' EXCEPT SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%') THEN 1 ELSE 0 END").bind(runId),
    db.prepare("UPDATE participants AS p SET " + updateFields.join(",") + " FROM json_each(?) AS j WHERE p.source_row=" + j("source_row") + " AND " + j("is_new") + "=0").bind(payload),
    db.prepare("INSERT INTO participants(" + columns.join(",") + ") SELECT " + columns.map(j).join(",") + " FROM json_each(?) AS j WHERE " + j("is_new") + "=1").bind(payload),
    db.prepare("INSERT INTO event_config(key,value) SELECT 'roster_member:'||" + j("source_row") + ",json_object('official_source_row'," + j("official_source_row") + ",'database_source_row'," + j("source_row") + ",'roster_group'," + j("roster_group") + ",'physical_row'," + j("physical_row") + ",'batch',?) FROM json_each(?) AS j WHERE 1 ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(runId, payload),
    db.prepare("INSERT INTO event_config(key,value) VALUES('latest_imported_at',datetime('now')),('official_roster_count',?),('last_reconciliation_backup',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(String(plan.total), runId.split(":")[0]),
    db.prepare("INSERT INTO event_config(key,value) VALUES('import_count','1') ON CONFLICT(key) DO UPDATE SET value=CAST(CAST(event_config.value AS INTEGER)+1 AS TEXT)"),
    db.prepare("INSERT INTO audit_log(action,actor_id,details) VALUES('official_roster_reconciled',?,?)").bind(actorId, JSON.stringify({ backup_id: runId.split(":")[0], total: plan.total, existing: plan.existing_rows, new: plan.new_rows, extras: plan.extras.length }))
  ];
}
__name(reconciliationStatements, "reconciliationStatements");

// src/web-origin.mjs
var DEFAULT_PUBLIC_APP_URL = "https://arthurfelipequeiroz.github.io/Conferencia-ONE";
function publicAppBase(value = DEFAULT_PUBLIC_APP_URL) {
  const url = new URL(value || DEFAULT_PUBLIC_APP_URL);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("PUBLIC_APP_URL deve ser um endere\xE7o HTTPS sem credenciais, consulta ou fragmento.");
  }
  return url.href.replace(/\/+$/, "");
}
__name(publicAppBase, "publicAppBase");
function mutationOriginAllowed(request, publicUrl) {
  const origin = request.headers.get("origin");
  const ownOrigin = new URL(request.url).origin;
  const frontendOrigin = new URL(publicAppBase(publicUrl)).origin;
  if (origin && origin !== ownOrigin && origin !== frontendOrigin) return false;
  return request.headers.get("sec-fetch-site") !== "cross-site" || origin === frontendOrigin;
}
__name(mutationOriginAllowed, "mutationOriginAllowed");
function rejection(message, status = 403) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
__name(rejection, "rejection");
async function withFrontend(request, publicUrl, handle) {
  if (!new URL(request.url).pathname.startsWith("/api/")) return handle();
  const origin = request.headers.get("origin");
  const ownOrigin = new URL(request.url).origin;
  const frontendOrigin = new URL(publicAppBase(publicUrl)).origin;
  if (origin && origin !== ownOrigin && origin !== frontendOrigin) return rejection("Origem inv\xE1lida.");
  let response;
  if (request.method === "OPTIONS") {
    const method = request.headers.get("access-control-request-method");
    const headers2 = (request.headers.get("access-control-request-headers") || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
    if (!origin || !["GET", "POST", "DELETE"].includes(method || "") || headers2.some((value) => !["content-type", "x-jovens-session"].includes(value))) {
      response = rejection("Pr\xE9-verifica\xE7\xE3o inv\xE1lida.");
    } else {
      response = new Response(null, { status: 204, headers: {
        "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type, x-jovens-session",
        "access-control-max-age": "600"
      } });
    }
  } else {
    response = await handle();
  }
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin);
  headers.set("access-control-expose-headers", "content-disposition, retry-after");
  headers.append("vary", "Origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
__name(withFrontend, "withFrontend");

// src/index.ts
var EVENT_DATE = "2026-11-07";
var REGISTRATION_CUTOFF = "2026-11-06";
function brazilDate() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(/* @__PURE__ */ new Date());
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}
__name(brazilDate, "brazilDate");
var SIZES = ["PP", "P", "M", "G", "GG", "XGG"];
var encoder = new TextEncoder();
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  status;
  static {
    __name(this, "HttpError");
  }
};
function d1DailyLimit(error) {
  let current = error;
  for (let depth = 0; depth < 5 && current != null; depth++) {
    const item = typeof current === "object" ? current : null;
    const message = typeof current === "string" ? current : typeof item?.message === "string" ? item.message : "";
    if (/exceeded D1['’]s free tier daily row (read|write) limit/i.test(message)) return true;
    current = item?.cause;
  }
  return false;
}
__name(d1DailyLimit, "d1DailyLimit");
var reply = /* @__PURE__ */ __name((v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } }), "reply");
var fail = /* @__PURE__ */ __name((status, message) => {
  throw new HttpError(status, message);
}, "fail");
var clean2 = /* @__PURE__ */ __name((v, max = 250) => typeof v === "string" ? v.trim().slice(0, max) : v == null ? "" : String(v).trim().slice(0, max), "clean");
var paymentAmount = /* @__PURE__ */ __name((v) => {
  let raw = clean2(v, 60).replace(/[^0-9,.-]/g, "");
  if (raw.includes(",") && raw.includes(".")) raw = raw.replace(/\./g, "").replace(",", ".");
  else raw = raw.replace(",", ".");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}, "paymentAmount");
var digits2 = /* @__PURE__ */ __name((v) => clean2(v).replace(/\D/g, ""), "digits");
var normalize = /* @__PURE__ */ __name((v) => clean2(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " "), "normalize");
var whatsappNumber = /* @__PURE__ */ __name((v) => {
  const d = digits2(v);
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d;
  if (d.length === 10 || d.length === 11) return "55" + d;
  return "";
}, "whatsappNumber");
var csvCell = /* @__PURE__ */ __name((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"', "csvCell");
function confirmationMessage(name, hasShirt, size) {
  const text = "Ol\xE1! A inscri\xE7\xE3o de " + clean2(name) + " no Confer\xEAncia ONE est\xE1 confirmada para o dia 07/11/2026.";
  const shirt = hasShirt ? "Sua camiseta" + (size ? ", tamanho " + clean2(size) : "") + ", ser\xE1 entregue no dia do evento." : "";
  return text + "\n\n" + (shirt ? shirt + "\n\n" : "") + "At\xE9 l\xE1! \u{1F333}";
}
__name(confirmationMessage, "confirmationMessage");
var hex = /* @__PURE__ */ __name((buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""), "hex");
var random = /* @__PURE__ */ __name((n = 32) => hex(crypto.getRandomValues(new Uint8Array(n))), "random");
var sha = /* @__PURE__ */ __name(async (s) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(s))), "sha");
async function passwordHash(pass, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(pass), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 1e5, hash: "SHA-256" }, key, 256));
}
__name(passwordHash, "passwordHash");
var safeEqual = /* @__PURE__ */ __name((a, b) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}, "safeEqual");
function cookie(request, name) {
  return (request.headers.get("cookie") || "").split(";").map((s) => s.trim()).find((s) => s.startsWith(name + "="))?.slice(name.length + 1) || "";
}
__name(cookie, "cookie");
function sessionCookie(token, maxAge) {
  return `enr_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
__name(sessionCookie, "sessionCookie");
async function staffSession(request, env) {
  const token = cookie(request, "enr_session") || request.headers.get("x-jovens-session") || "";
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const h = await sha(token);
  return await env.DB.prepare("SELECT u.id,u.username,u.role FROM sessions s JOIN staff_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1").bind(h, Date.now()).first();
}
__name(staffSession, "staffSession");
function requireRole(staff, allowed) {
  if (!staff) return fail(401, "Fa\xE7a login para continuar.");
  if (!allowed.includes(staff.role)) return fail(403, "Seu perfil n\xE3o permite esta opera\xE7\xE3o.");
  return staff;
}
__name(requireRole, "requireRole");
var DEFAULT_WHATSAPP_CONNECTOR_URL = "";
var LEGACY_WHATSAPP_CONNECTOR_URL = "";
var WHATSAPP_INSTANCE = "jovens";
async function whatsappConfig(env) {
  const rows = await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('whatsapp_connector_url','whatsapp_connector_key')").all();
  const cfg = Object.fromEntries(rows.results.map((x) => [x.key, x.value]));
  const url = cfg.whatsapp_connector_url;
  return {
    // Migrate the previous broken connector URL without exposing stored API keys.
    url: !url || url === LEGACY_WHATSAPP_CONNECTOR_URL ? DEFAULT_WHATSAPP_CONNECTOR_URL : url,
    key: cfg.whatsapp_connector_key || ""
  };
}
__name(whatsappConfig, "whatsappConfig");
async function whatsappRequest(env, path, init = {}) {
  throw new HttpError(501, "WhatsApp autom\xE1tico indispon\xEDvel nesta c\xF3pia.");
  const cfg = await whatsappConfig(env);
  if (!cfg.key || cfg.key.length < 32) throw new Error("Configure a chave da Evolution API no painel administrativo.");
  const headers = new Headers(init.headers);
  headers.set("apikey", cfg.key);
  headers.set("accept", "application/json");
  headers.set("origin", "https://localhost.invalid");
  let response;
  try {
    response = await fetch(cfg.url.replace(/\/$/, "") + path, { ...init, headers, signal: AbortSignal.timeout(12e3), cache: "no-store" });
  } catch {
    throw new Error("Evolution API indispon\xEDvel. Verifique o servi\xE7o no Railway.");
  }
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    const err = data?.response?.message || data?.message || data?.error;
    const message = typeof err === "string" ? clean2(err, 200) : "HTTP " + response.status;
    throw new Error(response.status === 401 ? "Chave da Evolution API inv\xE1lida. Atualize no painel." : "Evolution API: " + message);
  }
  return data;
}
__name(whatsappRequest, "whatsappRequest");
async function evolutionInstances(env) {
  const data = await whatsappRequest(env, "/instance/fetchInstances");
  return Array.isArray(data) ? data : [];
}
__name(evolutionInstances, "evolutionInstances");
function hasEvolutionInstance(items) {
  return items.some((item) => item?.name === WHATSAPP_INSTANCE || item?.instance?.instanceName === WHATSAPP_INSTANCE);
}
__name(hasEvolutionInstance, "hasEvolutionInstance");
async function evolutionConnection(env) {
  const instances = await evolutionInstances(env);
  if (!hasEvolutionInstance(instances)) return "close";
  try {
    const data = await whatsappRequest(env, "/instance/connectionState/" + WHATSAPP_INSTANCE);
    return data?.instance?.state || "close";
  } catch {
    return "close";
  }
}
__name(evolutionConnection, "evolutionConnection");
function asQrImage(data) {
  const value = data?.base64 || data?.qrcode?.base64 || data?.qrcode?.base64Qr || null;
  if (typeof value !== "string" || !value) return null;
  return value.startsWith("data:image/") ? value : "data:image/png;base64," + value;
}
__name(asQrImage, "asQrImage");
async function jsonBody(request, limit = 25e4) {
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return fail(415, "Envie JSON.");
  const text = await request.text();
  if (text.length > limit) return fail(413, "Arquivo excede o limite.");
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
  } catch {
  }
  return fail(400, "JSON inv\xE1lido.");
}
__name(jsonBody, "jsonBody");
async function rateLimit(request, env, scope, max) {
  const saltRow = await env.DB.prepare("SELECT value FROM event_config WHERE key='rate_limit_salt'").first();
  const salt = env.RATE_LIMIT_SALT || saltRow?.value;
  if (!salt || salt.length < 20) return fail(503, "Prote\xE7\xE3o de acesso n\xE3o configurada.");
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const key = await sha(salt + ":" + scope + ":" + ip);
  const start = Math.floor(Date.now() / 36e5);
  await env.DB.prepare("INSERT INTO rate_limits(key,window_start,attempts) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET window_start=excluded.window_start, attempts=CASE WHEN rate_limits.window_start=excluded.window_start THEN rate_limits.attempts+1 ELSE 1 END").bind(key, start).run();
  const item = await env.DB.prepare("SELECT attempts FROM rate_limits WHERE key=?").bind(key).first();
  if ((item?.attempts || 0) > max) return fail(429, "Muitas tentativas. Procure a recep\xE7\xE3o ou tente mais tarde.");
}
__name(rateLimit, "rateLimit");
async function audit(env, action, actor, participant, details = "") {
  await env.DB.prepare("INSERT INTO audit_log(action,actor_id,participant_id,details) VALUES(?,?,?,?)").bind(action, actor, participant, details).run();
}
__name(audit, "audit");
function publicCard(p) {
  const names = clean2(p.full_name).split(/\s+/);
  return { name: names.length > 1 ? `${names[0]} ${names.at(-1)?.[0]}.` : names[0], arrived: !!p.arrival_at, checked_in: !!p.checkin_at };
}
__name(publicCard, "publicCard");
var PRIZE_ELIGIBLE_SQL = "CASE WHEN (SELECT value FROM event_config WHERE key='official_prizes_source')='roster_2026' THEN EXISTS(SELECT 1 FROM event_config WHERE key='official_prize:'||participants.id) ELSE participants.prize_eligible END";
var PRIZE_RANK_SQL = "CASE WHEN (SELECT value FROM event_config WHERE key='official_prizes_source')='roster_2026' THEN CAST((SELECT value FROM event_config WHERE key='official_prize:'||participants.id) AS INTEGER) ELSE participants.prize_rank END";
var PRIZE_DELIVERY_GUARD_SQL = `CREATE TRIGGER guarded_prize_delivery BEFORE UPDATE OF prize_delivered_at ON participants
 WHEN NEW.prize_delivered_at IS NOT NULL AND OLD.prize_delivered_at IS NULL
 BEGIN
   SELECT RAISE(ABORT,'prize list not finalized') WHERE COALESCE((SELECT value FROM event_config WHERE key='prizes_locked'),'0')<>'1';
   SELECT RAISE(ABORT,'not eligible for prize') WHERE OLD.active=0 OR
     CASE WHEN (SELECT value FROM event_config WHERE key='official_prizes_source')='roster_2026'
       THEN NOT EXISTS(SELECT 1 FROM event_config WHERE key='official_prize:'||OLD.id)
       ELSE OLD.prize_eligible=0 END;
 END`;
var SELECT_PARTICIPANT = `SELECT
 id,source_row,registered_at,full_name,guardian_name,contact,age_raw,age,active,
 duplicate_status,review_note,church,shirt_requested,
 CASE WHEN COALESCE(json_extract(roster.value,'$.official_source_row'),source_row)=135 OR (shirt_size='GG' AND json_extract(onsite.value,'$.shirt_size')='XGG') THEN 'XGG' ELSE shirt_size END AS shirt_size,
 json_extract(roster.value,'$.official_source_row') AS official_source_row,
 COALESCE(json_extract(roster.value,'$.roster_group'),json_extract(onsite.value,'$.roster_group')) AS roster_group,
 previous_attendance,media_consent,payment_raw,
 CASE
   WHEN shirt_payment_status='waived' THEN 'waived'
   WHEN CAST(REPLACE(REPLACE(REPLACE(COALESCE(payment_raw,''),'R$',''),' ',''),',','.') AS REAL)>=50 THEN 'confirmed'
   ELSE shirt_payment_status
 END AS shirt_payment_status,
 ${PRIZE_RANK_SQL} AS prize_rank,${PRIZE_ELIGIBLE_SQL} AS prize_eligible,authorization_status,authorization_note,authorization_at,
 registration_type,registration_confirmed_at,arrival_at,checkin_at,checkin_note,
 prize_delivered_at,shirt_delivered_at,
 COALESCE((SELECT value FROM event_config WHERE key='shirt_delivery_size:'||participants.id),shirt_delivered_size) AS shirt_delivered_size,ticket_token,
 reception_events.reception_payment_received_at,
 reception_events.reception_shirt_delivered_at,
 reception_events.reception_gift_delivered_at
 FROM participants LEFT JOIN event_config roster ON roster.key='roster_member:'||participants.source_row
 LEFT JOIN event_config onsite ON onsite.key='onsite_member:'||participants.id
 LEFT JOIN (
   SELECT participant_id,
     max(CASE WHEN action='reception_shirt_payment_received' THEN created_at END) AS reception_payment_received_at,
     max(CASE WHEN action='reception_shirt_delivered' THEN created_at END) AS reception_shirt_delivered_at,
     max(CASE WHEN action='reception_gift_delivered' THEN created_at END) AS reception_gift_delivered_at
   FROM audit_log WHERE action IN ('reception_shirt_payment_received','reception_shirt_delivered','reception_gift_delivered')
   GROUP BY participant_id
 ) reception_events ON reception_events.participant_id=participants.id`;
async function route(request, env) {
  const url = new URL(request.url), path = url.pathname, method = request.method;
  if (!path.startsWith("/api/")) {
    if (method !== "GET" && method !== "HEAD") return reply({ error: "M\xE9todo n\xE3o permitido." }, 405);
    const page = path.replace(/\/+$/, "") || "/";
    if (!["/", "/checkin", "/confirmacao", "/equipe", "/admin", "/qr-impressao"].includes(page)) return reply({ error: "Rota n\xE3o encontrada." }, 404);
    const target = publicAppBase(env.PUBLIC_APP_URL) + (page === "/" ? "/" : page + "/") + url.search;
    return new Response(null, { status: 302, headers: { location: target, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
  }
  if (method !== "GET" && method !== "HEAD") {
    if (!mutationOriginAllowed(request, env.PUBLIC_APP_URL)) return fail(403, "Origem inv\xE1lida.");
  }
  if (path === "/api/health" && method === "GET") {
    const lastImport = await env.DB.prepare("SELECT value FROM event_config WHERE key='import_count'").first();
    return reply({ status: "ok", event_date: EVENT_DATE, configured: !!env.DB, import_applied: Number(lastImport?.value || 0) > 0 });
  }
  if (path === "/api/public/qr.svg" && method === "GET") {
    const svg = await import_qrcode.default.toString(`${publicAppBase(env.PUBLIC_APP_URL)}/checkin/`, { type: "svg", width: 320, margin: 2, errorCorrectionLevel: "M" });
    return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public,max-age=3600", "x-content-type-options": "nosniff" } });
  }
  if (path === "/api/setup-status" && method === "GET") {
    const row = await env.DB.prepare("SELECT count(*) AS total FROM staff_users").first();
    return reply({ initialized: (row?.total || 0) > 0, bootstrap_ready: typeof env.BOOTSTRAP_TOKEN === "string" && env.BOOTSTRAP_TOKEN.length >= 32 });
  }
  if (path === "/api/initialize" && method === "POST") {
    await rateLimit(request, env, "initialize", 10);
    const b = await jsonBody(request);
    const count = await env.DB.prepare("SELECT count(*) AS total FROM staff_users").first();
    if (count?.total) return fail(409, "A administra\xE7\xE3o j\xE1 foi configurada.");
    if (!env.BOOTSTRAP_TOKEN || env.BOOTSTRAP_TOKEN.length < 32 || !safeEqual(clean2(b.token, 200), env.BOOTSTRAP_TOKEN)) return fail(403, "Token de instala\xE7\xE3o inv\xE1lido.");
    const username = normalize(b.username).replace(/\s+/g, ".");
    if (!/^[a-z0-9._-]{4,40}$/.test(username) || typeof b.password !== "string" || b.password.length < 12) return fail(400, "Informe usu\xE1rio v\xE1lido e senha de pelo menos 12 caracteres.");
    const salt = random(16), hashed = await passwordHash(b.password, salt);
    await env.DB.prepare("INSERT INTO staff_users(username,password_hash,salt,role) VALUES(?,?,?,'admin')").bind(username, hashed, salt).run();
    await audit(env, "bootstrap", null, null);
    return reply({ ok: true });
  }
  if (path === "/api/session" && method === "POST") {
    await rateLimit(request, env, "login", 100);
    const b = await jsonBody(request);
    await rateLimit(request, env, "login-account:" + normalize(b.username), 12);
    const username = normalize(b.username).replace(/\s+/g, ".");
    const u = await env.DB.prepare("SELECT id,username,role,password_hash,salt FROM staff_users WHERE username=? AND active=1").bind(username).first();
    if (!u || typeof b.password !== "string" || !safeEqual(await passwordHash(b.password, u.salt), u.password_hash)) return fail(401, "Usu\xE1rio ou senha inv\xE1lidos.");
    const token = random(32), expires = Date.now() + 12 * 36e5;
    await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(await sha(token), u.id, expires).run();
    const response = reply({ user: { id: u.id, username: u.username, role: u.role }, sessionToken: token });
    response.headers.append("set-cookie", sessionCookie(token, 12 * 3600));
    return response;
  }
  if (path === "/api/session" && method === "GET") {
    const s = await staffSession(request, env);
    return reply({ user: s });
  }
  if (path === "/api/session" && method === "DELETE") {
    const token = cookie(request, "enr_session") || request.headers.get("x-jovens-session") || "";
    if (/^[a-f0-9]{64}$/.test(token)) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha(token)).run();
    const response = reply({ ok: true });
    response.headers.append("set-cookie", sessionCookie("", 0));
    return response;
  }
  if (path === "/api/public/confirm-registration" && method === "POST") {
    await rateLimit(request, env, "registration-confirm", 500);
    const b = await jsonBody(request);
    const name = normalize(b.name), phone = digits2(b.contact);
    if (name.length < 5 || phone.length < 9) return fail(400, "Informe o nome completo e o telefone usado na inscri\xE7\xE3o, com DDD quando houver.");
    await rateLimit(request, env, "registration-confirm-contact:" + phone, 20);
    const hits = await env.DB.prepare("SELECT id,full_name,registration_type,shirt_requested,shirt_size,registration_confirmed_at FROM participants WHERE normalized_name=? AND contact_digits=? AND active=1").bind(name, phone).all();
    if (hits.results.length !== 1) return fail(404, "N\xE3o foi poss\xEDvel confirmar uma \xFAnica inscri\xE7\xE3o com esses dados. Procure a equipe.");
    const p = hits.results[0];
    if (!p.registration_confirmed_at) {
      const updated = await env.DB.prepare("UPDATE participants SET registration_confirmed_at=datetime('now') WHERE id=? AND registration_confirmed_at IS NULL").bind(p.id).run();
      if (updated.meta.changes) await audit(env, "registration_confirmed_public", null, p.id);
    }
    const label = p.registration_type === "adolescent" ? "Adolescente" : p.registration_type === "adult_guardian" ? "Adulto / respons\xE1vel" : p.registration_type === "team" ? "Equipe" : "Categoria a confirmar pela equipe";
    return reply({ ok: true, name: publicCard(p).name, registration_type: p.registration_type, registration_label: label, shirt_requested: !!p.shirt_requested, shirt_size: p.shirt_size || null, event_date: EVENT_DATE });
  }
  if (path === "/api/public/lookup" && method === "POST") {
    await rateLimit(request, env, "lookup", 500);
    const b = await jsonBody(request);
    const name = normalize(b.name), phone = digits2(b.contact);
    if (name.length < 5 || phone.length < 9) return fail(400, "Informe o nome completo e telefone cadastrado, incluindo DDD quando houver.");
    await rateLimit(request, env, "lookup-contact:" + phone, 20);
    const hits = await env.DB.prepare("SELECT id,source_row,full_name,ticket_token,arrival_at,checkin_at FROM participants WHERE normalized_name=? AND contact_digits=? AND active=1 ORDER BY source_row").bind(name, phone).all();
    if (!hits.results.length) return fail(404, "N\xE3o foi poss\xEDvel confirmar a inscri\xE7\xE3o. Procure a equipe de recep\xE7\xE3o.");
    const chosen = hits.results[0];
    return reply({ ticket: chosen.ticket_token, ...publicCard(chosen) });
  }
  if (path === "/api/public/ticket" && method === "GET") {
    await rateLimit(request, env, "ticket", 1200);
    const ticket = url.searchParams.get("t") || "";
    if (!/^[a-f0-9]{48}$/.test(ticket)) return fail(400, "C\xF3digo inv\xE1lido.");
    const p = await env.DB.prepare("SELECT full_name,arrival_at,checkin_at FROM participants WHERE ticket_token=? AND active=1").bind(ticket).first();
    if (!p) return fail(404, "C\xF3digo de inscri\xE7\xE3o n\xE3o encontrado.");
    return reply(publicCard(p));
  }
  if (path === "/api/public/arrive" && method === "POST") {
    await rateLimit(request, env, "arrive", 600);
    const b = await jsonBody(request);
    if (!/^[a-f0-9]{48}$/.test(clean2(b.ticket))) return fail(400, "C\xF3digo inv\xE1lido.");
    const p = await env.DB.prepare("SELECT id,full_name,arrival_at,checkin_at FROM participants WHERE ticket_token=? AND active=1").bind(b.ticket).first();
    if (!p) return fail(404, "Inscri\xE7\xE3o n\xE3o encontrada.");
    if (p.arrival_at) return reply({ ok: true, already: true, ...publicCard(p) });
    const r = await env.DB.prepare("UPDATE participants SET arrival_at=datetime('now') WHERE id=? AND arrival_at IS NULL").bind(p.id).run();
    if (r.meta.changes) await audit(env, "participant_arrived", null, p.id);
    return reply({ ok: true, ...publicCard({ ...p, arrival_at: (/* @__PURE__ */ new Date()).toISOString() }) });
  }
  const staff = await staffSession(request, env);
  const blockedLegacy = ["/api/admin/finalize-prizes", "/api/admin/reception-policy", "/api/admin/stock", "/api/staff/reception-payment", "/api/staff/shirt", "/api/staff/prize"];
  if (path.startsWith("/api/admin/whatsapp/") || blockedLegacy.includes(path)) {
    requireRole(staff, ["admin", "reception", "gifts"]);
    return fail(501, "Recurso legado desabilitado na c\xF3pia do Minist\xE9rio de Jovens.");
  }
  if (path === "/api/staff/updates" && method === "GET") {
    requireRole(staff, ["admin", "reception", "gifts"]);
    const latest = await env.DB.prepare("SELECT id FROM audit_log ORDER BY id DESC LIMIT 1").first();
    return reply({ version: Number(latest?.id || 0) });
  }
  if (path === "/api/admin/database-backup" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    if (b.confirm !== "CRIAR BACKUP") return fail(400, "Confirma\xE7\xE3o de backup obrigat\xF3ria.");
    const backup = await snapshotDatabase(env.DB);
    await env.DB.prepare("INSERT INTO event_config(key,value) VALUES('latest_backup_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(backup.id).run();
    await audit(env, "database_backup_created", u.id, null, "id=" + backup.id + ";tables=" + backup.table_count);
    return reply({ ok: true, backup });
  }
  if (path === "/api/admin/database-backup/export" && method === "POST") {
    requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    const sql = await exportSnapshot(env.DB, clean2(b.backup_id, 40));
    return new Response(sql, { headers: { "content-type": "application/sql; charset=utf-8", "content-disposition": 'attachment; filename="CONFERENCIA_ONE_D1_BACKUP_' + clean2(b.backup_id, 40) + '.sql"', "cache-control": "no-store", "x-content-type-options": "nosniff" } });
  }
  if ((path === "/api/admin/roster-preview" || path === "/api/admin/roster-reconcile") && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request, 12e5);
    if (b.schema_version !== 1 || b.event_date !== EVENT_DATE) return fail(400, "Base oficial de outro evento ou vers\xE3o inv\xE1lida.");
    const rows = await env.DB.prepare("SELECT * FROM participants ORDER BY source_row").all();
    const configs = await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%' ORDER BY key").all();
    const previous = configs.results.filter((p) => p.key.startsWith("roster_member:")).map((p) => JSON.parse(p.value));
    const plan = planRoster(b.participants, rows.results, previous);
    const fingerprint = await sha(JSON.stringify({ rows: rows.results, configs: configs.results }));
    const summary = { ok: plan.conflicts.length === 0, total: plan.total, existing_rows: plan.existing_rows, new_rows: plan.new_rows, moved_rows: plan.moved_rows, contact_corrections: plan.contact_corrections, name_corrections: plan.name_corrections, groups: plan.groups, conflicts: plan.conflicts, extra_rows: plan.extras.length, extra_source_rows: plan.extras.map((p) => p.source_row), database_total: rows.results.length, expected_fingerprint: fingerprint };
    if (path.endsWith("roster-preview")) return reply(summary);
    if (plan.conflicts.length) return fail(409, "Concilia\xE7\xE3o interrompida: " + plan.conflicts.slice(0, 4).join(" "));
    if (b.expected_fingerprint !== fingerprint) return fail(409, "O banco mudou ap\xF3s a confer\xEAncia. Fa\xE7a nova confer\xEAncia e novo backup.");
    if (b.confirm !== "RECONCILIAR SEM EXCLUIR") return fail(400, "Confirma\xE7\xE3o de reconcilia\xE7\xE3o obrigat\xF3ria.");
    const backupId = clean2(b.backup_id, 40), snapshot = await loadSnapshot(env.DB, backupId);
    for (const p of plan.matches) if (p.is_new) p.ticket_token = random(24);
    const locked = configs.results.some((p) => p.key === "prizes_locked" && p.value === "1");
    const runId = backupId + ":" + random(6);
    try {
      await env.DB.batch(reconciliationStatements(env.DB, plan, snapshot, locked, runId, u.id));
    } catch {
      return fail(409, "A base mudou desde o backup ou a valida\xE7\xE3o falhou. Nada foi aplicado; fa\xE7a novo backup e nova confer\xEAncia.");
    }
    const verified = await env.DB.prepare("SELECT count(*) total,sum(active=1) active,sum(checkin_at IS NOT NULL) checked_in,sum(arrival_at IS NOT NULL) arrived,sum(shirt_delivered_at IS NOT NULL) shirts,sum(prize_delivered_at IS NOT NULL) prizes FROM participants").first();
    return reply({ ...summary, applied: true, backup_id: backupId, verified });
  }
  if (path === "/api/staff/stats" && method === "GET") {
    requireRole(staff, ["admin", "reception", "gifts"]);
    const counts = await env.DB.prepare("SELECT count(*) total,sum(CASE WHEN registration_confirmed_at IS NOT NULL THEN 1 ELSE 0 END) registration_confirmed,sum(CASE WHEN registration_type='adolescent' THEN 1 ELSE 0 END) adolescents,sum(CASE WHEN registration_type='adult_guardian' THEN 1 ELSE 0 END) adults_guardians,sum(CASE WHEN registration_type='team' THEN 1 ELSE 0 END) team,sum(CASE WHEN registration_type='other' THEN 1 ELSE 0 END) type_review,sum(CASE WHEN arrival_at IS NOT NULL THEN 1 ELSE 0 END) arrived,sum(CASE WHEN checkin_at IS NOT NULL THEN 1 ELSE 0 END) checked_in,sum(CASE WHEN prize_delivered_at IS NOT NULL THEN 1 ELSE 0 END) prizes,sum(CASE WHEN shirt_delivered_at IS NOT NULL THEN 1 ELSE 0 END) shirts FROM participants WHERE active=1").first();
    const stock = await env.DB.prepare("SELECT size,total_qty,delivered_qty,(total_qty-delivered_qty) available FROM shirt_stock ORDER BY CASE size WHEN 'PP' THEN 0 WHEN 'P' THEN 1 WHEN 'M' THEN 2 WHEN 'G' THEN 3 ELSE 4 END").all();
    const recent = await env.DB.prepare(`SELECT id,full_name,source_row,arrival_at,checkin_at,shirt_requested,shirt_size,shirt_payment_status,${PRIZE_ELIGIBLE_SQL} AS prize_eligible,${PRIZE_RANK_SQL} AS prize_rank,prize_delivered_at,shirt_delivered_at,authorization_status,age FROM participants WHERE active=1 AND arrival_at IS NOT NULL ORDER BY arrival_at DESC,id DESC LIMIT 12`).all();
    const configs = await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed','latest_imported_at','import_count','latest_backup_id','official_roster_count','last_reconciliation_backup','official_prizes_source','onsite_shirt_price','reception_flow','reception_policy_version') OR (key>='official_prize:' AND key<'official_prize;') OR (key>='roster_member:' AND key<'roster_member;')").all();
    const cfg = Object.fromEntries(configs.results.map((x) => [x.key, x.value]));
    const groups = configs.results.filter((p) => p.key.startsWith("roster_member:")).map((p) => JSON.parse(p.value).roster_group);
    return reply({ onsite_shirt_price: Number(cfg.onsite_shirt_price || 60), reception_flow: cfg.reception_flow || "shirt_gift_entry", reception_policy_version: Number(cfg.reception_policy_version || 0), counts: counts || {}, stock: stock.results, recent_arrivals: recent.results, prizes_locked: cfg.prizes_locked === "1", official_prize_count: configs.results.filter((p) => p.key.startsWith("official_prize:")).length, registration_closed: cfg.registration_closed === "1", last_imported_at: cfg.latest_imported_at || null, import_count: Number(cfg.import_count || 0), can_close: brazilDate() >= REGISTRATION_CUTOFF, latest_backup_id: staff?.role === "admin" ? cfg.latest_backup_id || null : null, official_roster_count: Number(cfg.official_roster_count || 0), roster_groups: { volunteer: groups.filter((x) => x === "volunteer").length, support: groups.filter((x) => x === "support").length, adolescent: groups.filter((x) => x === "adolescent").length } });
  }
  if (path === "/api/admin/whatsapp/status" && method === "GET") {
    requireRole(staff, ["admin"]);
    const cfg = await whatsappConfig(env);
    if (!cfg.key || cfg.key.length < 32) return reply({ configured: false, provider: "evolution", state: "not_configured", connected: false });
    if (url.searchParams.get("probe") !== "1") return reply({ configured: true, provider: "evolution", state: "not_checked", connected: false });
    try {
      const state = await evolutionConnection(env);
      return reply({ configured: true, provider: "evolution", state, connected: state === "open" });
    } catch (e) {
      return reply({ configured: true, provider: "evolution", state: "error", connected: false, error: e instanceof Error ? e.message : "Falha ao consultar a Evolution API." });
    }
  }
  if (path === "/api/admin/whatsapp/config" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    const key = clean2(b.api_key, 300);
    if (key.length < 32) return fail(400, "A chave da Evolution API precisa ter pelo menos 32 caracteres.");
    await env.DB.prepare("INSERT INTO event_config(key,value) VALUES('whatsapp_connector_url',?),('whatsapp_connector_key',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(DEFAULT_WHATSAPP_CONNECTOR_URL, key).run();
    await audit(env, "whatsapp_evolution_configured", u.id, null);
    return reply({ ok: true, configured: true, provider: "evolution" });
  }
  if (path === "/api/admin/whatsapp/qr" && method === "GET") {
    requireRole(staff, ["admin"]);
    const instances = await evolutionInstances(env);
    const exists = hasEvolutionInstance(instances);
    const state = exists ? await evolutionConnection(env) : "close";
    if (state === "open") return reply({ configured: true, provider: "evolution", state, connected: true, base64: null });
    let created = null;
    if (!exists) {
      try {
        created = await whatsappRequest(env, "/instance/create", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ instanceName: WHATSAPP_INSTANCE, qrcode: true, integration: "WHATSAPP-BAILEYS" })
        });
      } catch (e) {
        if (!String(e?.message || "").toLowerCase().includes("already")) throw e;
      }
    }
    const initialQr = asQrImage(created);
    if (initialQr) return reply({ configured: true, provider: "evolution", state: "qr", connected: false, base64: initialQr });
    const data = await whatsappRequest(env, "/instance/connect/" + WHATSAPP_INSTANCE);
    const base64 = asQrImage(data);
    return reply({ configured: true, provider: "evolution", state: base64 ? "qr" : "connecting", connected: false, base64 });
  }
  if (path === "/api/admin/whatsapp/send" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    const number = whatsappNumber(b.number);
    const text = clean2(b.text, 4e3);
    if (!number) return fail(400, "Informe um n\xFAmero brasileiro v\xE1lido com DDD.");
    if (!text) return fail(400, "Digite a mensagem.");
    await rateLimit(request, env, "whatsapp-test", 14);
    if (await evolutionConnection(env) !== "open") return fail(409, "Conecte a nova inst\xE2ncia da Evolution API antes de enviar.");
    const local = number.slice(4), ddd = number.slice(2, 4);
    const candidates = [number];
    if (local.length === 9 && local.startsWith("9")) candidates.push("55" + ddd + local.slice(1));
    if (local.length === 8 && !local.startsWith("9")) candidates.push("55" + ddd + "9" + local);
    let jid = "";
    for (const candidate of [...new Set(candidates)]) {
      try {
        const matched = await whatsappRequest(env, "/chat/whatsappNumbers/" + WHATSAPP_INSTANCE, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ numbers: [candidate] })
        });
        if (Array.isArray(matched) && matched[0]?.exists) {
          jid = matched[0].jid || candidate;
          break;
        }
      } catch {
      }
    }
    if (!jid) return fail(422, "N\xFAmero n\xE3o encontrado no WhatsApp. Confira o telefone.");
    const data = await whatsappRequest(env, "/message/sendText/" + WHATSAPP_INSTANCE, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ number: jid, text })
    });
    const messageId = data?.key?.id || data?.message?.key?.id || null;
    await audit(env, "whatsapp_evolution_message_accepted", u.id, null, "number_last4=" + number.slice(-4));
    return reply({ ok: true, provider: "evolution", status: "accepted", delivery: "unconfirmed", messageId });
  }
  if (path === "/api/admin/whatsapp/disconnect" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    await whatsappRequest(env, "/instance/logout/" + WHATSAPP_INSTANCE, { method: "DELETE" });
    await audit(env, "whatsapp_evolution_disconnected", u.id, null);
    return reply({ ok: true });
  }
  if (path === "/api/admin/communications" && method === "GET") {
    requireRole(staff, ["admin"]);
    const rows = await env.DB.prepare(
      "SELECT p.id participant_id,p.full_name,p.contact_digits,p.contact,p.shirt_requested,p.shirt_size,p.registration_confirmed_at,COALESCE(c.status,'not_sent') status,c.sent_at,c.note FROM participants p LEFT JOIN communication_individual c ON c.participant_id=p.id WHERE p.active=1 ORDER BY CASE COALESCE(c.status,'not_sent') WHEN 'not_sent' THEN 0 WHEN 'failed' THEN 1 WHEN 'sent' THEN 2 ELSE 3 END,p.source_row"
    ).all();
    const contacts = rows.results.map((r) => ({
      participant_id: Number(r.participant_id),
      contact_digits: r.contact_digits,
      whatsapp_phone: whatsappNumber(r.contact_digits),
      contact: r.contact,
      names: [r.full_name],
      total: 1,
      confirmed: r.registration_confirmed_at ? 1 : 0,
      shirt_requested: !!r.shirt_requested,
      shirt_size: r.shirt_size || null,
      status: r.status || "not_sent",
      sent_at: r.sent_at || null,
      note: r.note || "",
      message: confirmationMessage(r.full_name, !!r.shirt_requested, r.shirt_size || null)
    }));
    const countByPhone = /* @__PURE__ */ new Map();
    for (const c of contacts) if (c.whatsapp_phone) countByPhone.set(c.whatsapp_phone, (countByPhone.get(c.whatsapp_phone) || 0) + 1);
    const summary = {
      contacts: countByPhone.size,
      registrations: contacts.length,
      confirmed: contacts.reduce((n, x) => n + x.confirmed, 0),
      not_sent: contacts.filter((x) => x.status === "not_sent").length,
      sent: contacts.filter((x) => x.status === "sent").length,
      failed: contacts.filter((x) => x.status === "failed").length,
      skipped: contacts.filter((x) => x.status === "skipped").length,
      invalid_phone: contacts.filter((x) => !x.whatsapp_phone).length,
      family_contacts: [...countByPhone.values()].filter((n) => n > 1).length
    };
    return reply({ contacts, summary });
  }
  if (path === "/api/admin/communications.csv" && method === "GET") {
    requireRole(staff, ["admin"]);
    const rows = await env.DB.prepare(
      "SELECT p.id,p.full_name,p.contact_digits,p.shirt_requested,p.shirt_size,COALESCE(c.status,'not_sent') status FROM participants p LEFT JOIN communication_individual c ON c.participant_id=p.id WHERE p.active=1 ORDER BY p.source_row"
    ).all();
    const lines = ["Inscricao,Nome,Telefone WhatsApp,Mensagem,Camiseta,Tamanho,Status"];
    for (const r of rows.results) {
      const phone = whatsappNumber(r.contact_digits);
      lines.push([
        r.id,
        r.full_name,
        phone,
        confirmationMessage(r.full_name, !!r.shirt_requested, r.shirt_size || null),
        r.shirt_requested ? "Sim" : "N\xE3o",
        r.shirt_size || "",
        phone ? r.status || "not_sent" : "revisar_telefone"
      ].map(csvCell).join(","));
    }
    return new Response("\uFEFF" + lines.join("\r\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="jovens-confirmacoes-individuais.csv"', "cache-control": "no-store", "x-content-type-options": "nosniff" } });
  }
  if (path === "/api/admin/communication-status" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    const participantId = Number(b.participant_id), status = clean2(b.status), note = clean2(b.note, 200);
    if (!Number.isInteger(participantId) || participantId <= 0 || !["not_sent", "sent", "skipped", "failed"].includes(status))
      return fail(400, "Inscri\xE7\xE3o ou status inv\xE1lido.");
    const person = await env.DB.prepare("SELECT id,contact_digits FROM participants WHERE id=? AND active=1").bind(participantId).first();
    if (!person) return fail(404, "Inscri\xE7\xE3o n\xE3o encontrada ou inativa.");
    if (status === "sent" && !whatsappNumber(person.contact_digits)) return fail(422, "Confirme o telefone antes de marcar a mensagem como enviada.");
    await env.DB.prepare(
      "INSERT INTO communication_individual(participant_id,status,sent_at,updated_at,updated_by,note) VALUES(?,?,CASE WHEN ?='sent' THEN datetime('now') ELSE NULL END,datetime('now'),?,?) ON CONFLICT(participant_id) DO UPDATE SET status=excluded.status,sent_at=CASE WHEN excluded.status='sent' THEN COALESCE(communication_individual.sent_at,datetime('now')) WHEN excluded.status='not_sent' THEN NULL ELSE communication_individual.sent_at END,updated_at=datetime('now'),updated_by=excluded.updated_by,note=excluded.note"
    ).bind(participantId, status, status, u.id, note || null).run();
    await audit(env, "communication_individual_status", u.id, participantId, status);
    return reply({ ok: true });
  }
  if (path === "/api/staff/list" && method === "GET") {
    const u = requireRole(staff, ["admin", "reception", "gifts"]);
    const q = normalize(url.searchParams.get("q") || "");
    const items = await env.DB.prepare(SELECT_PARTICIPANT + ` WHERE (?='' OR normalized_name LIKE ?) ORDER BY CASE WHEN arrival_at IS NOT NULL AND checkin_at IS NULL THEN 0 WHEN checkin_at IS NULL THEN 1 ELSE 2 END,source_row LIMIT 300`).bind(q, `%${q}%`).all();
    const output = items.results.map((p) => u.role === "gifts" ? { ...p, guardian_name: void 0, contact: void 0, authorization_note: void 0, checkin_note: void 0, ticket_token: void 0 } : p);
    return reply({ items: output });
  }
  if (path === "/api/staff/register-onsite" && method === "POST") {
    const u = requireRole(staff, ["admin", "reception"]);
    const b = await jsonBody(request, 8e3);
    const requestKey = clean2(b.request_key, 60), name = clean2(b.full_name, 151), contact = clean2(b.contact, 41), guardian = clean2(b.guardian_name, 151), church = clean2(b.church, 151);
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(requestKey)) return fail(400, "Atualize o painel antes de cadastrar.");
    const normalizedName = normalize(name), phone = digits2(contact);
    if (name.length < 3 || name.length > 150 || normalizedName.length < 3) return fail(400, "Informe o nome completo do participante.");
    if (contact.length > 40 || contact && !/^(?:\d{10,11}|55\d{10,11})$/.test(phone)) return fail(400, "Informe um telefone com DDD ou deixe o contato vazio.");
    if (guardian.length > 150 || church.length > 150) return fail(400, "Respons\xE1vel e igreja devem ter at\xE9 150 caracteres.");
    const profile = clean2(b.profile, 30);
    if (!["adolescent", "adult_guardian", "volunteer", "support"].includes(profile)) return fail(400, "Selecione o perfil da inscri\xE7\xE3o.");
    if (typeof b.shirt_requested !== "boolean") return fail(400, "Informe se deseja camiseta.");
    const size = b.shirt_requested ? clean2(b.shirt_size, 10).toUpperCase() : null;
    if (b.shirt_requested && !SIZES.includes(size)) return fail(400, "Selecione o tamanho da camiseta.");
    const fingerprint = await sha(JSON.stringify({ name, contact, guardian, church, profile, shirt: b.shirt_requested, size }));
    const receiptKey = "onsite_registration:" + requestKey;
    const receipt = await env.DB.prepare("SELECT value FROM event_config WHERE key=?").bind(receiptKey).first();
    if (receipt) {
      const saved2 = JSON.parse(receipt.value);
      if (saved2.fingerprint !== fingerprint) return fail(409, "Este cadastro j\xE1 foi enviado com outros dados. Confira a ficha antes de cadastrar outra pessoa.");
      const item = await env.DB.prepare(SELECT_PARTICIPANT + " WHERE ticket_token=?").bind(saved2.ticket_token).first();
      if (!item || !item.active) return fail(409, "A inscri\xE7\xE3o foi alterada pela administra\xE7\xE3o. Busque a ficha pelo nome.");
      return reply({ ok: true, created: false, replayed: true, item });
    }
    const existing = await env.DB.prepare(SELECT_PARTICIPANT + " WHERE normalized_name=? AND active=1 ORDER BY id LIMIT 2").bind(normalizedName).all();
    if (existing.results.length > 1) return fail(409, "H\xE1 mais de uma inscri\xE7\xE3o com esse nome. Localize e confira a ficha pela busca antes de continuar.");
    if (existing.results.length === 1) return reply({ ok: true, created: false, existing: true, item: existing.results[0] });
    const ticket = random(24), group = profile === "adult_guardian" ? "adult_guardian" : profile;
    const registrationType = ["volunteer", "support"].includes(profile) ? "team" : profile;
    const record = JSON.stringify({ fingerprint, ticket_token: ticket, actor_id: u.id });
    const metadata = JSON.stringify({ roster_group: group, shirt_size: size, registered_by: u.id, origin: "reception" });
    const saved = await env.DB.batch([
      env.DB.prepare("INSERT INTO event_config(key,value) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM participants WHERE normalized_name=? AND active=1) ON CONFLICT(key) DO NOTHING").bind(receiptKey, record, normalizedName),
      env.DB.prepare(`INSERT INTO participants(source_row,registered_at,full_name,normalized_name,guardian_name,contact,contact_digits,church,shirt_requested,shirt_size,shirt_payment_status,payment_raw,registration_type,arrival_at,ticket_token)
       SELECT (SELECT COALESCE(MAX(source_row),1)+1 FROM participants),datetime('now'),?,?,?,?,?,?,?,?, 'unverified','',?,datetime('now'),json_extract(value,'$.ticket_token')
       FROM event_config WHERE key=? AND json_extract(value,'$.fingerprint')=?
       AND NOT EXISTS(SELECT 1 FROM participants WHERE normalized_name=? AND active=1)
       AND NOT EXISTS(SELECT 1 FROM participants WHERE ticket_token=json_extract(event_config.value,'$.ticket_token'))`).bind(name, normalizedName, guardian, contact, phone, church, b.shirt_requested ? 1 : 0, size === "XGG" ? "GG" : size, registrationType, receiptKey, fingerprint, normalizedName),
      env.DB.prepare(`INSERT INTO event_config(key,value) SELECT 'onsite_member:'||id,? FROM participants WHERE ticket_token=(SELECT json_extract(value,'$.ticket_token') FROM event_config WHERE key=? AND json_extract(value,'$.fingerprint')=?) ON CONFLICT(key) DO NOTHING`).bind(metadata, receiptKey, fingerprint),
      env.DB.prepare(`INSERT INTO audit_log(action,actor_id,participant_id,details)
       SELECT 'onsite_registration_created',?,id,'origin=reception;event=07/11/2026' FROM participants
       WHERE ticket_token=(SELECT json_extract(value,'$.ticket_token') FROM event_config WHERE key=? AND json_extract(value,'$.fingerprint')=?)
       AND NOT EXISTS(SELECT 1 FROM audit_log WHERE action='onsite_registration_created' AND participant_id=participants.id)`).bind(u.id, receiptKey, fingerprint)
    ]);
    const committed = await env.DB.prepare("SELECT value FROM event_config WHERE key=?").bind(receiptKey).first();
    if (committed) {
      const stored = JSON.parse(committed.value);
      if (stored.fingerprint !== fingerprint) return fail(409, "Este cadastro j\xE1 foi enviado com outros dados. Confira a ficha pelo nome.");
      const item = await env.DB.prepare(SELECT_PARTICIPANT + " WHERE ticket_token=? AND active=1").bind(stored.ticket_token).first();
      if (item) return reply({ ok: true, created: !!saved[1].meta.changes, replayed: !saved[1].meta.changes, item });
    }
    const concurrent = await env.DB.prepare(SELECT_PARTICIPANT + " WHERE normalized_name=? AND active=1 ORDER BY id LIMIT 2").bind(normalizedName).all();
    if (concurrent.results.length === 1) return reply({ ok: true, created: false, existing: true, item: concurrent.results[0] });
    return fail(409, "A base mudou durante o cadastro. Busque e confira a ficha antes de continuar.");
  }
  if (path === "/api/staff/participant" && method === "GET") {
    const u = requireRole(staff, ["admin", "reception", "gifts"]);
    const id = Number(url.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) return fail(400, "Inscri\xE7\xE3o inv\xE1lida.");
    const p = await env.DB.prepare(SELECT_PARTICIPANT + " WHERE id=? AND active=1").bind(id).first();
    if (!p) return fail(404, "Inscri\xE7\xE3o n\xE3o encontrada.");
    const item = u.role === "gifts" ? { ...p, guardian_name: void 0, contact: void 0, authorization_note: void 0, checkin_note: void 0, ticket_token: void 0 } : p;
    return reply({ item });
  }
  if (path === "/api/staff/ticket" && method === "GET") {
    requireRole(staff, ["admin", "reception"]);
    const token = url.searchParams.get("t") || "";
    if (!/^[a-f0-9]{48}$/.test(token)) return fail(400, "QR Code inv\xE1lido.");
    const p = await env.DB.prepare(SELECT_PARTICIPANT + " WHERE ticket_token=? AND active=1").bind(token).first();
    if (!p) return fail(404, "Inscri\xE7\xE3o n\xE3o encontrada.");
    return reply({ item: p });
  }
  const qrMatch = path.match(/^\/api\/staff\/qr\/(\d+)\.svg$/);
  if (qrMatch && method === "GET") {
    requireRole(staff, ["admin", "reception"]);
    const p = await env.DB.prepare("SELECT ticket_token FROM participants WHERE id=? AND active=1").bind(Number(qrMatch[1])).first();
    if (!p) return fail(404, "Participante n\xE3o encontrado.");
    const svg = await import_qrcode.default.toString(`${publicAppBase(env.PUBLIC_APP_URL)}/checkin/?t=${p.ticket_token}`, { type: "svg", width: 360, margin: 2 });
    return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
  }
  if (path === "/api/staff/checkin" && method === "POST") {
    const u = requireRole(staff, ["admin", "reception"]);
    const b = await jsonBody(request);
    const id = Number(b.id);
    const p = await env.DB.prepare("SELECT id,age,active,authorization_status,checkin_at FROM participants WHERE id=?").bind(id).first();
    if (!p || !p.active) return fail(404, "Inscri\xE7\xE3o inativa ou inexistente.");
    if (p.checkin_at) return fail(409, "Entrada j\xE1 liberada.");
    const r = await env.DB.prepare("UPDATE participants SET arrival_at=coalesce(arrival_at,datetime('now')),checkin_at=datetime('now'),checkin_by=?,checkin_note=? WHERE id=? AND checkin_at IS NULL AND active=1").bind(u.id, clean2(b.note, 300), id).run();
    if (!r.meta.changes) return fail(409, "O cadastro foi alterado; atualize a ficha.");
    await audit(env, "checkin_approved", u.id, id);
    return reply({ ok: true });
  }
  if (path === "/api/staff/reception-payment" && method === "POST") {
    const u = requireRole(staff, ["admin", "reception"]);
    const b = await jsonBody(request);
    const id = Number(b.id);
    const p = await env.DB.prepare("SELECT id,active,shirt_requested,shirt_payment_status,payment_raw FROM participants WHERE id=?").bind(id).first();
    if (!p || !p.active) return fail(404, "Inscri\xE7\xE3o inativa ou inexistente.");
    if (!p.shirt_requested) return fail(409, "Esta inscri\xE7\xE3o n\xE3o possui camiseta.");
    if (p.shirt_payment_status === "confirmed" || p.shirt_payment_status === "waived" || paymentAmount(p.payment_raw) >= 50) {
      if (p.shirt_payment_status === "unverified") await env.DB.prepare("UPDATE participants SET shirt_payment_status='confirmed' WHERE id=?").bind(id).run();
      return reply({ ok: true, already: true, source: paymentAmount(p.payment_raw) >= 50 ? "planilha" : "status" });
    }
    await env.DB.batch([
      env.DB.prepare("UPDATE participants SET shirt_payment_status='confirmed' WHERE id=? AND active=1 AND shirt_requested=1").bind(id),
      env.DB.prepare("INSERT INTO audit_log(action,participant_id,actor_id,details) SELECT 'reception_shirt_payment_received',?,?,? WHERE NOT EXISTS(SELECT 1 FROM audit_log WHERE participant_id=? AND action='reception_shirt_payment_received')").bind(id, u.id, "amount=60;event=07/11/2026", id)
    ]);
    return reply({ ok: true, amount: 60 });
  }
  if (path === "/api/staff/reception-complete" && method === "POST") {
    const u = requireRole(staff, ["admin", "reception"]);
    const b = await jsonBody(request);
    const id = Number(b.id);
    const p = await env.DB.prepare(`SELECT id,active,checkin_at,${PRIZE_ELIGIBLE_SQL} AS prize_eligible,${PRIZE_RANK_SQL} AS prize_rank FROM participants WHERE id=?`).bind(id).first();
    if (!p || !p.active) return fail(404, "Inscri\xE7\xE3o inativa ou inexistente.");
    if (p.checkin_at) return reply({ ok: true, already: true, gift_eligible: !!p.prize_eligible, gift_rank: p.prize_rank || null });
    const r = await env.DB.prepare("UPDATE participants SET arrival_at=coalesce(arrival_at,datetime('now')),checkin_at=datetime('now'),checkin_by=? WHERE id=? AND active=1 AND checkin_at IS NULL").bind(u.id, id).run();
    if (!r.meta.changes) return fail(409, "A ficha j\xE1 foi atualizada. Recarregue o painel.");
    await audit(env, "reception_checkin_completed", u.id, id, "entrada_liberada_sem_entregas_automaticas");
    return reply({ ok: true, gift_eligible: !!p.prize_eligible, gift_rank: p.prize_rank || null });
  }
  if (path === "/api/staff/prize" && method === "POST") {
    const u = requireRole(staff, ["admin", "reception", "gifts"]);
    const b = await jsonBody(request);
    const id = Number(b.id);
    const r = await env.DB.prepare(`UPDATE participants SET prize_delivered_at=datetime('now'),prize_delivered_by=? WHERE id=? AND (${PRIZE_ELIGIBLE_SQL})=1 AND active=1 AND prize_delivered_at IS NULL AND (SELECT value FROM event_config WHERE key='prizes_locked')='1'`).bind(u.id, id).run();
    if (!r.meta.changes) return fail(409, "Pr\xEAmio n\xE3o dispon\xEDvel, lista ainda aberta ou j\xE1 entregue.");
    await audit(env, "prize_delivered", u.id, id);
    return reply({ ok: true });
  }
  if (path === "/api/staff/shirt" && method === "POST") {
    const u = requireRole(staff, ["admin", "reception", "gifts"]);
    const b = await jsonBody(request);
    const id = Number(b.id), size = clean2(b.size);
    if (!SIZES.includes(size)) return fail(400, "Tamanho inv\xE1lido.");
    const storedSize = size === "XGG" ? "GG" : size;
    try {
      await env.DB.batch([
        // Preserve the exact delivered size without changing the existing table's legacy enum.
        // The NOT NULL guard makes duplicate or unpaid deliveries roll back as one batch.
        env.DB.prepare(`INSERT INTO event_config(key,value) SELECT 'shirt_delivery_size:'||CAST(? AS INTEGER),
         CASE WHEN EXISTS(SELECT 1 FROM participants WHERE id=? AND active=1 AND shirt_requested=1
           AND (shirt_payment_status IN ('confirmed','waived') OR CAST(REPLACE(REPLACE(REPLACE(COALESCE(payment_raw,''),'R$',''),' ',''),',','.') AS REAL)>=50) AND shirt_delivered_at IS NULL)
         THEN ? ELSE NULL END ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(id, id, size),
        env.DB.prepare("UPDATE participants SET shirt_delivered_at=datetime('now'),shirt_delivered_size=?,shirt_delivered_by=? WHERE id=?").bind(storedSize, u.id, id),
        env.DB.prepare("INSERT INTO audit_log(action,actor_id,participant_id,details) VALUES('shirt_delivered',?,?,?)").bind(u.id, id, "size=" + size)
      ]);
    } catch (e) {
      if (d1DailyLimit(e)) throw e;
      return fail(409, "Camiseta n\xE3o dispon\xEDvel: confira o pagamento, a inscri\xE7\xE3o e se a entrega j\xE1 foi registrada.");
    }
    return reply({ ok: true, size });
  }
  if (path === "/api/admin/authorize" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request), id = Number(b.id), status = clean2(b.status), note = clean2(b.note, 300);
    if (!["pending", "approved", "rejected"].includes(status) || note.length < 5) return fail(400, "Informe o status e evid\xEAncia da confer\xEAncia em observa\xE7\xF5es.");
    const r = await env.DB.prepare("UPDATE participants SET authorization_status=?,authorization_note=?,authorization_at=datetime('now'),authorization_by=? WHERE id=? AND active=1").bind(status, note, u.id, id).run();
    if (!r.meta.changes) return fail(404, "Inscri\xE7\xE3o n\xE3o encontrada.");
    await audit(env, "minor_authorization", u.id, id, status);
    return reply({ ok: true });
  }
  if (path === "/api/admin/registration-type" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request), id = Number(b.id), type = clean2(b.registration_type);
    if (!["adolescent", "adult_guardian", "team", "other"].includes(type)) return fail(400, "Perfil de inscri\xE7\xE3o inv\xE1lido.");
    const r = await env.DB.prepare("UPDATE participants SET registration_type=? WHERE id=? AND active=1").bind(type, id).run();
    if (!r.meta.changes) return fail(404, "Inscri\xE7\xE3o n\xE3o encontrada.");
    await audit(env, "registration_type_reviewed", u.id, id, type);
    return reply({ ok: true });
  }
  if (path === "/api/admin/payment" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request), id = Number(b.id), status = clean2(b.status);
    if (!["unverified", "confirmed", "waived"].includes(status)) return fail(400, "Status de pagamento inv\xE1lido.");
    const r = await env.DB.prepare("UPDATE participants SET shirt_payment_status=? WHERE id=? AND active=1 AND shirt_delivered_at IS NULL").bind(status, id).run();
    if (!r.meta.changes) return fail(409, "Inscri\xE7\xE3o inexistente ou camiseta j\xE1 entregue.");
    await audit(env, "shirt_payment_reviewed", u.id, id, status);
    return reply({ ok: true });
  }
  if (path === "/api/admin/reset-test-entries" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    if (brazilDate() >= EVENT_DATE) return fail(409, "A revers\xE3o de testes s\xF3 est\xE1 dispon\xEDvel antes do evento.");
    const entries = b.entries;
    if (b.reason !== "teste_pre_evento" || !Array.isArray(entries) || entries.length < 1 || entries.length > 3 || entries.some((p) => !Number.isSafeInteger(p.id) || p.id < 1 || typeof p.checkin_at !== "string" || !p.checkin_at) || new Set(entries.map((p) => p.id)).size !== entries.length || typeof b.reset_deliveries !== "boolean") return fail(400, "Selecione at\xE9 tr\xEAs entradas de teste.");
    const snapshot = await loadSnapshot(env.DB, clean2(b.backup_id));
    const table = snapshot.tables.find((t) => t.original === "participants")?.copy;
    if (!table || !/^enr_backup_[0-9]{13}_[a-f0-9]{8}_\d+$/.test(table)) return fail(409, "Crie um backup atual antes de reverter os testes.");
    const protections = (await env.DB.prepare("SELECT name,sql FROM sqlite_master WHERE type='trigger' AND name IN ('no_prize_undo','no_shirt_undo')").all()).results;
    if (protections.length !== 2) return fail(409, "As prote\xE7\xF5es de entrega precisam ser verificadas antes da revers\xE3o.");
    const payload = JSON.stringify(entries), selected = "id IN (SELECT CAST(json_extract(value,'$.id') AS INTEGER) FROM json_each(?))";
    const runId = "test_reset:" + crypto.randomUUID();
    const statements = [
      env.DB.prepare("CREATE TABLE IF NOT EXISTS enr_reconcile_guards(id TEXT PRIMARY KEY,ok INTEGER NOT NULL CHECK(ok=1))"),
      env.DB.prepare(`INSERT INTO enr_reconcile_guards(id,ok) SELECT ?,CASE WHEN
       (SELECT count(*) FROM participants p JOIN json_each(?) j ON p.id=json_extract(j.value,'$.id')
        WHERE p.checkin_at IS json_extract(j.value,'$.checkin_at') AND p.arrival_at IS json_extract(j.value,'$.arrival_at')
        AND p.shirt_delivered_at IS json_extract(j.value,'$.shirt_delivered_at') AND p.prize_delivered_at IS json_extract(j.value,'$.prize_delivered_at'))=?
       AND NOT EXISTS(SELECT * FROM participants WHERE ${selected} EXCEPT SELECT * FROM "${table}" WHERE ${selected})
       AND NOT EXISTS(SELECT * FROM "${table}" WHERE ${selected} EXCEPT SELECT * FROM participants WHERE ${selected})
       THEN 1 ELSE 0 END`).bind(runId, payload, entries.length, payload, payload, payload, payload),
      env.DB.prepare("DROP TRIGGER no_prize_undo"),
      env.DB.prepare("DROP TRIGGER no_shirt_undo"),
      env.DB.prepare(`INSERT INTO audit_log(action,participant_id,actor_id,details)
       SELECT 'pre_event_test_reset',id,?,json_object('backup_id',?,'arrival_at',arrival_at,'checkin_at',checkin_at,
         'shirt_delivered_at',shirt_delivered_at,'prize_delivered_at',prize_delivered_at,'reset_deliveries',?) FROM participants WHERE ${selected}`).bind(u.id, b.backup_id, b.reset_deliveries ? 1 : 0, payload),
      env.DB.prepare(`UPDATE participants SET arrival_at=NULL,checkin_at=NULL,checkin_by=NULL,checkin_note=NULL,
       shirt_delivered_at=CASE WHEN ? THEN NULL ELSE shirt_delivered_at END,
       shirt_delivered_size=CASE WHEN ? THEN NULL ELSE shirt_delivered_size END,
       shirt_delivered_by=CASE WHEN ? THEN NULL ELSE shirt_delivered_by END,
       prize_delivered_at=CASE WHEN ? THEN NULL ELSE prize_delivered_at END,
       prize_delivered_by=CASE WHEN ? THEN NULL ELSE prize_delivered_by END WHERE ${selected}`).bind(...Array(5).fill(b.reset_deliveries ? 1 : 0), payload),
      ...protections.map((t) => env.DB.prepare(t.sql))
    ];
    try {
      await env.DB.batch(statements);
    } catch (error) {
      if (d1DailyLimit(error)) throw error;
      return fail(409, "A base mudou desde o backup. Crie outro backup e confira as fichas novamente.");
    }
    return reply({ ok: true, reset: entries.length, deliveries_reset: b.reset_deliveries });
  }
  if (path === "/api/admin/reception-policy" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    if (b.onsite_shirt_price !== 60 || b.shirts_available !== true || b.flow !== "shirt_gift_entry") return fail(400, "Confirme as regras do evento: camiseta dispon\xEDvel, R$ 60 no dia e camiseta, brinde, entrada.");
    await env.DB.batch([
      env.DB.prepare("DROP TRIGGER IF EXISTS guarded_shirt_delivery"),
      env.DB.prepare(`CREATE TRIGGER guarded_shirt_delivery BEFORE UPDATE OF shirt_delivered_at ON participants
       WHEN NEW.shirt_delivered_at IS NOT NULL AND OLD.shirt_delivered_at IS NULL
       BEGIN
         SELECT RAISE(ABORT,'inactive registration') WHERE OLD.active=0;
         SELECT RAISE(ABORT,'shirt not requested') WHERE OLD.shirt_requested=0;
         SELECT RAISE(ABORT,'shirt payment not confirmed') WHERE OLD.shirt_payment_status NOT IN ('confirmed','waived') AND CAST(REPLACE(REPLACE(REPLACE(COALESCE(OLD.payment_raw,''),'R$',''),' ',''),',','.') AS REAL)<50;
       END`),
      env.DB.prepare("DROP TRIGGER IF EXISTS guarded_prize_delivery"),
      env.DB.prepare(PRIZE_DELIVERY_GUARD_SQL),
      env.DB.prepare("INSERT INTO event_config(key,value) VALUES('onsite_shirt_price','60'),('reception_flow','shirt_gift_entry'),('reception_policy_version','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value"),
      env.DB.prepare("INSERT INTO audit_log(action,actor_id,details) VALUES('reception_policy_updated',?,'onsite_shirt_price=60;shirts_available_confirmed;flow=shirt_gift_entry')").bind(u.id)
    ]);
    return reply({ ok: true, onsite_shirt_price: 60, flow: "shirt_gift_entry" });
  }
  if (path === "/api/admin/stock" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request), size = clean2(b.size), qty = Number(b.total_qty);
    if (!SIZES.includes(size) || !Number.isInteger(qty) || qty < 0 || qty > 1e4) return fail(400, "Tamanho ou quantidade inv\xE1lidos.");
    const r = await env.DB.prepare("UPDATE shirt_stock SET total_qty=?,updated_at=datetime('now') WHERE size=? AND delivered_qty<=?").bind(qty, size, qty).run();
    if (!r.meta.changes) return fail(409, "A quantidade n\xE3o pode ser inferior ao total j\xE1 entregue.");
    await audit(env, "stock_set", u.id, null, size + ":" + qty);
    return reply({ ok: true });
  }
  if (path === "/api/admin/review" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request), id = Number(b.id), note = clean2(b.note, 300), active = b.active === true ? 1 : 0;
    const age = b.age === "" || b.age == null ? null : Number(b.age);
    const dup = clean2(b.duplicate_status);
    if (note.length < 5 || !Number.isInteger(age) && age !== null || age !== null && (age < 1 || age > 110) || !["clear", "needs_review", "distinct", "void"].includes(dup)) return fail(400, "Informe idade, situa\xE7\xE3o de duplicidade e justificativa.");
    const locked = await env.DB.prepare("SELECT value FROM event_config WHERE key='prizes_locked'").first();
    if (locked?.value === "1") return fail(409, "Premia\xE7\xE3o fechada: ranking protegido contra altera\xE7\xF5es.");
    if (dup === "void" && active) return fail(400, "Registro anulado deve ficar inativo.");
    const r = await env.DB.prepare("UPDATE participants SET age=?,active=?,duplicate_status=?,review_note=? WHERE id=?").bind(age, active, dup, note, id).run();
    if (!r.meta.changes) return fail(404, "Inscri\xE7\xE3o n\xE3o encontrada.");
    await audit(env, "registration_reviewed", u.id, id, "active=" + active + ";dup=" + dup);
    return reply({ ok: true });
  }
  if (path === "/api/admin/close-registrations" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request);
    if (b.confirm !== "ENCERRAR INSCRICOES") return fail(400, "Digite exatamente ENCERRAR INSCRICOES para confirmar.");
    if (brazilDate() < REGISTRATION_CUTOFF) return fail(409, "O encerramento de inscri\xE7\xF5es fica dispon\xEDvel a partir de 06/11, hor\xE1rio de Bras\xEDlia.");
    const count = await env.DB.prepare("SELECT count(*) total FROM participants").first();
    if (!count?.total) return fail(409, "Importe a planilha atualizada antes de encerrar.");
    const r = await env.DB.prepare("UPDATE event_config SET value='1' WHERE key='registration_closed' AND value='0'").run();
    if (!r.meta.changes) return fail(409, "As inscri\xE7\xF5es j\xE1 foram encerradas.");
    await audit(env, "registrations_closed", u.id, null, "total=" + count.total);
    return reply({ ok: true, total: count.total });
  }
  if (path === "/api/admin/finalize-prizes" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const configs = await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('prizes_locked','official_roster_count')").all();
    const cfg = Object.fromEntries(configs.results.map((x) => [x.key, x.value]));
    if (cfg.prizes_locked === "1") return fail(409, "A lista de brindes j\xE1 est\xE1 confirmada.");
    if (cfg.official_roster_count !== "171") return fail(409, "Concilie a base oficial de 171 inscri\xE7\xF5es antes de liberar os brindes.");
    const selected = await env.DB.prepare(`SELECT participants.id,participants.source_row,active,
     json_extract(roster.value,'$.official_source_row') AS official_source_row,
     json_extract(roster.value,'$.roster_group') AS roster_group
     FROM participants JOIN event_config roster ON roster.key='roster_member:'||participants.source_row
     WHERE json_extract(roster.value,'$.official_source_row') BETWEEN 43 AND 92
     ORDER BY official_source_row`).all();
    if (selected.results.length !== 50 || selected.results.some((p, i) => !p.active || p.roster_group !== "adolescent" || p.official_source_row !== 43 + i))
      return fail(409, "A correspond\xEAncia da lista oficial de brindes est\xE1 incompleta. Nenhuma classifica\xE7\xE3o foi alterada.");
    const payload = JSON.stringify(selected.results.map((p, i) => ({ id: p.id, source_row: p.source_row, official_source_row: p.official_source_row, rank: i + 1 })));
    const deliveredOutside = await env.DB.prepare("SELECT count(*) n FROM participants WHERE prize_delivered_at IS NOT NULL AND id NOT IN (SELECT json_extract(value,'$.id') FROM json_each(?))").bind(payload).first();
    if (deliveredOutside?.n) return fail(409, "Existe entrega registrada fora da lista oficial. O hist\xF3rico foi preservado.");
    const stmts = [
      // A NOT NULL guard aborts the entire D1 batch if the roster changes before commit.
      env.DB.prepare(`INSERT INTO event_config(key,value)
       SELECT 'official_prizes_source',CASE WHEN
         (SELECT value FROM event_config WHERE key='prizes_locked')='0'
         AND (SELECT value FROM event_config WHERE key='official_roster_count')='171'
         AND NOT EXISTS(SELECT 1 FROM json_each(?) j WHERE NOT EXISTS(
           SELECT 1 FROM participants p JOIN event_config r ON r.key='roster_member:'||p.source_row
           WHERE p.id=json_extract(j.value,'$.id') AND p.active=1
           AND p.source_row=json_extract(j.value,'$.source_row')
           AND json_extract(r.value,'$.official_source_row')=json_extract(j.value,'$.official_source_row')
           AND json_extract(r.value,'$.roster_group')='adolescent'))
         AND NOT EXISTS(SELECT 1 FROM participants WHERE prize_delivered_at IS NOT NULL AND id NOT IN (SELECT json_extract(value,'$.id') FROM json_each(?)))
         THEN 'roster_2026' ELSE NULL END
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(payload, payload),
      env.DB.prepare("INSERT INTO event_config(key,value) SELECT 'official_prize:'||json_extract(value,'$.id'),CAST(json_extract(value,'$.rank') AS TEXT) FROM json_each(?) WHERE 1 ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(payload),
      env.DB.prepare("DROP TRIGGER IF EXISTS guarded_prize_delivery"),
      env.DB.prepare(PRIZE_DELIVERY_GUARD_SQL),
      env.DB.prepare("UPDATE event_config SET value='1' WHERE key='prizes_locked'"),
      env.DB.prepare("INSERT INTO audit_log(action,actor_id,details) VALUES('prizes_finalized',?,'eligible=50;source=official_roster;registration_authorization_already_collected')").bind(u.id)
    ];
    try {
      await env.DB.batch(stmts);
    } catch (e) {
      if (d1DailyLimit(e)) throw e;
      return fail(409, "A base mudou durante a confirma\xE7\xE3o. Nenhuma altera\xE7\xE3o foi aplicada; atualize o painel.");
    }
    return reply({ ok: true, eligible: 50, source: "official_roster" });
  }
  if (path === "/api/admin/users" && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const b = await jsonBody(request), username = normalize(b.username).replace(/\s+/g, "."), role = clean2(b.role);
    if (!/^[a-z0-9._-]{4,40}$/.test(username) || !["admin", "reception", "gifts"].includes(role) || typeof b.password !== "string" || b.password.length < 12) return fail(400, "Usu\xE1rio, perfil ou senha inv\xE1lidos.");
    const salt = random(16), pass = await passwordHash(b.password, salt);
    await env.DB.prepare("INSERT INTO staff_users(username,password_hash,salt,role) VALUES(?,?,?,?)").bind(username, pass, salt, role).run();
    await audit(env, "staff_created", u.id, null, username + " " + role);
    return reply({ ok: true });
  }
  if ((path === "/api/admin/import" || path === "/api/admin/sync-preview") && method === "POST") {
    const u = requireRole(staff, ["admin"]);
    const preview = path.endsWith("sync-preview");
    const cfg = await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('registration_closed','prizes_locked')").all();
    const state = Object.fromEntries(cfg.results.map((x) => [x.key, x.value]));
    const recovery = state.registration_closed === "1" || state.prizes_locked === "1";
    const b = await jsonBody(request, 12e5), items = b.participants;
    if (b.schema_version !== 1 || b.event_date !== EVENT_DATE || !Array.isArray(items) || !items.length || items.length > 200) return fail(400, "JSON ou vers\xE3o incorreta. Use o conversor atualizado da planilha oficial (at\xE9 200 registros por importa\xE7\xE3o).");
    const existing = await env.DB.prepare("SELECT source_row,normalized_name,contact_digits,age_raw,age,review_note,shirt_requested,shirt_size,shirt_delivered_at,checkin_at,registration_type,registration_confirmed_at FROM participants ORDER BY source_row").all();
    const oldByRow = new Map(existing.results.map((x) => [x.source_row, x]));
    const ordered = [...items].sort((a, b2) => Number(a.source_row) - Number(b2.source_row));
    const sources = /* @__PURE__ */ new Set(), pairCounts = /* @__PURE__ */ new Map(), issues = [];
    for (const p of ordered) {
      const row = Number(p.source_row), name = normalize(p.full_name), phone = digits2(p.contact), raw = clean2(p.age_raw, 30), hasShirt = clean2(p.shirt_requested).toLowerCase() === "sim", size = clean2(p.shirt_size).toUpperCase();
      if (!Number.isInteger(row) || row < 2 || sources.has(row) || name.length < 3 || !clean2(p.full_name) || clean2(p.full_name).length > 250) return fail(400, "Posi\xE7\xE3o duplicada ou cadastro sem nome.");
      if (hasShirt && !SIZES.includes(size)) return fail(400, "Camiseta com tamanho inv\xE1lido na linha " + row);
      sources.add(row);
      const pair2 = name + "|" + phone;
      if (phone.length >= 9) pairCounts.set(pair2, (pairCounts.get(pair2) || 0) + 1);
      const old = oldByRow.get(row);
      if (old) {
        if (old.normalized_name !== name || old.contact_digits !== phone) issues.push(`Linha ${row}: nome ou telefone alterado. Conferir manualmente para n\xE3o associar hist\xF3rico \xE0 pessoa errada.`);
        const oldHasShirt = !!old.shirt_requested;
        if (!recovery && old.shirt_delivered_at && (oldHasShirt !== hasShirt || old.shirt_size !== size)) issues.push(`Linha ${row}: camiseta j\xE1 entregue; tamanho ou solicita\xE7\xE3o alterado.`);
        const match = raw.match(/^(\d{1,2})(?:\s*anos?)?$/i), newAge = match ? Number(match[1]) : null;
        if (!recovery && old.checkin_at && raw !== old.age_raw && newAge !== old.age) issues.push(`Linha ${row}: idade alterada ap\xF3s libera\xE7\xE3o da entrada.`);
      }
    }
    for (const old of existing.results) if (!sources.has(old.source_row)) issues.push(`Linha ${old.source_row}: desapareceu da planilha. Corrija a origem; n\xE3o exclu\xEDmos um cadastro com hist\xF3rico.`);
    const inserts = ordered.filter((p) => !oldByRow.has(Number(p.source_row))).length;
    const revised = ordered.filter((p) => oldByRow.has(Number(p.source_row))).length;
    const provisional = ordered.filter((p) => {
      const raw = clean2(p.age_raw, 30), m = /^(\d{1,2})(?:\s*anos?)?$/i.exec(raw);
      return m && Number(m[1]) >= 12 && Number(m[1]) <= 17;
    }).map((p) => Number(p.source_row));
    if (preview) return reply({ ok: issues.length === 0, total: ordered.length, new_rows: inserts, existing_rows: revised, conflicts: issues.slice(0, 25), provisional_teen_count: provisional.length, provisional_50th_row: provisional[49] || null, registration_closed: state.registration_closed === "1", prizes_locked: state.prizes_locked === "1", recovery_mode: recovery });
    if (issues.length) return fail(409, "Importa\xE7\xE3o interrompida sem alterar dados. " + issues.slice(0, 3).join(" "));
    const stmts = [];
    const importValues = [];
    for (const p of ordered) {
      const name = clean2(p.full_name), phone = digits2(p.contact), pair2 = normalize(name) + "|" + phone;
      const raw = clean2(p.age_raw, 30), match = raw.match(/^(\d{1,2})(?:\s*anos?)?$/i), numeric = match ? Number(match[1]) : null;
      const age = numeric && numeric >= 1 && numeric <= 110 ? numeric : null;
      const hasShirt = clean2(p.shirt_requested).toLowerCase() === "sim";
      const size = clean2(p.shirt_size).toUpperCase();
      const storedSize = size === "XGG" ? "GG" : size;
      const duplicate = phone.length >= 9 && (pairCounts.get(pair2) || 0) > 1;
      const payment = clean2(p.payment_raw), confirmed = paymentAmount(payment) >= 50;
      const sourceRow = Number(p.source_row);
      const inferredType = age !== null && age >= 18 ? "adult_guardian" : age !== null && age >= 12 ? "adolescent" : "other";
      importValues.push([Number(p.source_row), clean2(p.registered_at, 40) || null, name, normalize(name), clean2(p.guardian_name) || null, clean2(p.contact, 60), phone, raw, age, duplicate ? "needs_review" : "clear", clean2(p.church, 180), hasShirt ? 1 : 0, hasShirt ? storedSize : null, clean2(p.previous_attendance, 30), clean2(p.media_consent).toLowerCase().includes("sim") ? 1 : 0, payment || null, confirmed ? "confirmed" : "unverified", inferredType, random(24)]);
    }
    for (let i = 0; i < importValues.length; i += 5) {
      const chunk = importValues.slice(i, i + 5);
      const placeholders = chunk.map(() => `(${Array(19).fill("?").join(",")})`).join(",");
      const sql = `INSERT INTO participants(source_row,registered_at,full_name,normalized_name,guardian_name,contact,contact_digits,age_raw,age,duplicate_status,church,shirt_requested,shirt_size,previous_attendance,media_consent,payment_raw,shirt_payment_status,registration_type,ticket_token) VALUES ${placeholders}
     ON CONFLICT(source_row) DO UPDATE SET
       registered_at=excluded.registered_at, guardian_name=excluded.guardian_name,
       church=excluded.church, previous_attendance=excluded.previous_attendance,media_consent=excluded.media_consent,
       age=CASE WHEN participants.age_raw=excluded.age_raw THEN participants.age ELSE excluded.age END,
       age_raw=excluded.age_raw,shirt_requested=excluded.shirt_requested,shirt_size=excluded.shirt_size,
       payment_raw=excluded.payment_raw,
       registration_type=CASE WHEN participants.registration_type IN ('team','adult_guardian','adolescent') THEN participants.registration_type ELSE excluded.registration_type END,
       shirt_payment_status=CASE WHEN participants.shirt_payment_status IN ('confirmed','waived') THEN participants.shirt_payment_status ELSE excluded.shirt_payment_status END`;
      const recoverySql = `INSERT INTO participants(source_row,registered_at,full_name,normalized_name,guardian_name,contact,contact_digits,age_raw,age,duplicate_status,church,shirt_requested,shirt_size,previous_attendance,media_consent,payment_raw,shirt_payment_status,registration_type,ticket_token) VALUES ${placeholders}
     ON CONFLICT(source_row) DO UPDATE SET
       guardian_name=excluded.guardian_name,
       church=excluded.church,
       previous_attendance=excluded.previous_attendance,
       media_consent=excluded.media_consent,
       shirt_requested=CASE WHEN participants.shirt_delivered_at IS NOT NULL THEN participants.shirt_requested ELSE excluded.shirt_requested END,
       shirt_size=CASE WHEN participants.shirt_delivered_at IS NOT NULL THEN participants.shirt_size ELSE excluded.shirt_size END,
       payment_raw=CASE WHEN excluded.shirt_payment_status='confirmed' THEN excluded.payment_raw ELSE participants.payment_raw END,
       shirt_payment_status=CASE WHEN participants.shirt_payment_status IN ('confirmed','waived') THEN participants.shirt_payment_status ELSE excluded.shirt_payment_status END,
       registration_type=CASE WHEN participants.registration_type='other' THEN excluded.registration_type ELSE participants.registration_type END`;
      stmts.push(env.DB.prepare(recovery ? recoverySql : sql).bind(...chunk.flat()));
    }
    if (!recovery) stmts.push(env.DB.prepare(`UPDATE participants SET duplicate_status='needs_review' WHERE active=1 AND duplicate_status='clear' AND length(contact_digits)>=9 AND EXISTS(SELECT 1 FROM participants x WHERE x.id<>participants.id AND x.active=1 AND x.normalized_name=participants.normalized_name AND x.contact_digits=participants.contact_digits)`));
    stmts.push(env.DB.prepare("INSERT INTO event_config(key,value) VALUES ('latest_imported_at',datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value"));
    stmts.push(env.DB.prepare("INSERT INTO event_config(key,value) VALUES ('import_count','1') ON CONFLICT(key) DO UPDATE SET value=CAST(CAST(event_config.value AS INTEGER)+1 AS TEXT)"));
    await env.DB.batch(stmts);
    await audit(env, recovery ? "sheet_recovered" : "sheet_synchronized", u.id, null, `total=${ordered.length};new=${inserts};existing=${revised}`);
    const pending = await env.DB.prepare("SELECT count(*) total FROM participants WHERE active=1 AND (age IS NULL OR duplicate_status='needs_review')").first();
    return reply({ ok: true, imported: ordered.length, new_rows: inserts, existing_rows: revised, needs_review: pending?.total || 0, recovery_mode: recovery });
  }
  return fail(404, "Rota n\xE3o encontrada.");
}
__name(route, "route");
var index_default = {
  async fetch(request, env) {
    return withFrontend(request, env.PUBLIC_APP_URL, async () => {
      try {
        return await route(request, env);
      } catch (err) {
        if (err instanceof HttpError) return reply({ error: err.message }, err.status);
        if (d1DailyLimit(err)) {
          const now = Date.now();
          const reset = new Date(now);
          reset.setUTCHours(24, 0, 0, 0);
          const retryAfter = Math.max(1, Math.ceil((reset.getTime() - now) / 1e3));
          const when = reset.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
          const response = reply({ error: `O banco atingiu o limite di\xE1rio de uso. O limite ser\xE1 renovado em ${when} (hor\xE1rio de Bras\xEDlia). Procure a coordena\xE7\xE3o.`, error_code: "D1_DAILY_LIMIT", retry_after: retryAfter }, 503);
          response.headers.set("retry-after", String(retryAfter));
          return response;
        }
        console.error("Request failed", err instanceof Error ? err.message : "unexpected");
        return reply({ error: "N\xE3o foi poss\xEDvel concluir a opera\xE7\xE3o. Atualize a tela ou procure o administrador." }, 500);
      }
    });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
