/* ==================== ПЕРЕМИКАЧ ЛАБОРАТОРНИХ ==================== */
function switchLab(labNum) {
  document
    .getElementById("lab1-section")
    .classList.toggle("active", labNum === 1);
  document
    .getElementById("lab2-section")
    .classList.toggle("active", labNum === 2);
  document
    .getElementById("lab3-section")
    .classList.toggle("active", labNum === 3);
  document
    .getElementById("lab4-section")
    .classList.toggle("active", labNum === 4);

  document.getElementById("btn-lab1").classList.toggle("active", labNum === 1);
  document.getElementById("btn-lab2").classList.toggle("active", labNum === 2);
  document.getElementById("btn-lab3").classList.toggle("active", labNum === 3);
  document.getElementById("btn-lab4").classList.toggle("active", labNum === 4);

  const subtitle = document.getElementById("header-subtitle");
  const desc = document.getElementById("header-desc");

  if (labNum === 1) {
    subtitle.innerText = "ЛАБОРАТОРНА РОБОТА №1 • КРИПТОГРАФІЯ";
    desc.innerText =
      "Шифр Цезаря та таблична перестановка: шифрування, розшифрування й гістограми частот.";
  } else if (labNum === 2) {
    subtitle.innerText = "ЛАБОРАТОРНА РОБОТА №2 • АВТЕНТИФІКАЦІЯ ТА JWT";
    desc.innerText =
      "Генерація та валідація JSON Web Token (HS256), хешування паролів SHA-256 без солі та захищений маршрут.";
  } else if (labNum === 3) {
    subtitle.innerText = "ЛАБОРАТОРНА РОБОТА №3 • КРИПТОГРАФІЯ";
    desc.innerText =
      "Система блочного шифрування S-DES. Покрокове шифрування та розшифрування 8-бітних блоків.";
  } else {
    subtitle.innerText = "ЛАБОРАТОРНА РОБОТА №4 • КРИПТОГРАФІЯ";
    desc.innerText =
      'Протокол Діффі-Хеллмана. Безпечний обмін ключами та симуляція атаки "Людина посередині" (MITM).';
  }
}

/* ==================== ЛАБОРАТОРНА №1: ШИФРИ ==================== */
const alphabets = {
  uk: "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя",
  en: "abcdefghijklmnopqrstuvwxyz",
};

let currentCipher = "caesar";

function setCipher(type) {
  currentCipher = type;
  document
    .getElementById("tab-caesar")
    .classList.toggle("active", type === "caesar");
  document
    .getElementById("tab-perm")
    .classList.toggle("active", type === "perm");

  const keyLabel = document.getElementById("key-label");
  const keyInput = document.getElementById("cipher-key");

  if (type === "caesar") {
    keyLabel.innerText = "Зміщення k";
    keyInput.type = "number";
    keyInput.value = "7";
  } else {
    keyLabel.innerText = "Ключ (слово)";
    keyInput.type = "text";
    keyInput.value = "СЕКРЕТ";
  }
}

function onInputTextChange() {
  document.getElementById("in-count").innerText =
    `${document.getElementById("input-text").value.length} символів`;
  updateHistograms();
}

function updateOutCount() {
  document.getElementById("out-count").innerText =
    `${document.getElementById("output-text").value.length} символів`;
}

function clearAll() {
  document.getElementById("input-text").value = "";
  document.getElementById("output-text").value = "";
  document.getElementById("file-status").innerText = "Файл ще не відкрито";
  document.getElementById("file-input").value = "";
  onInputTextChange();
  updateOutCount();
  updateHistograms();
}

function loadSample() {
  document.getElementById("input-text").value =
    "Криптографія — це наука про математичні методи забезпечення конфіденційності, цілісності і автентичності інформації.";
  onInputTextChange();
}

function processText(action) {
  const text = document.getElementById("input-text").value;
  const keyVal = document.getElementById("cipher-key").value;
  const lang = document.getElementById("alphabet-select").value;
  let result = "";

  if (!text) return;

  if (currentCipher === "caesar") {
    const shift = parseInt(keyVal) || 0;
    result = caesarCipher(
      text,
      action === "encrypt" ? shift : -shift,
      alphabets[lang],
    );
  } else {
    result = columnarTransposition(
      text,
      keyVal.toUpperCase(),
      action === "encrypt",
    );
  }

  document.getElementById("output-text").value = result;
  updateOutCount();
  updateHistograms();
}

function caesarCipher(text, shift, alphabet) {
  let result = "";
  const len = alphabet.length;
  shift = ((shift % len) + len) % len;

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let isUpper = char === char.toUpperCase();
    let lowerChar = char.toLowerCase();
    let idx = alphabet.indexOf(lowerChar);

    if (idx !== -1) {
      let newIdx = (idx + shift) % len;
      let newChar = alphabet[newIdx];
      result += isUpper ? newChar.toUpperCase() : newChar;
    } else {
      result += char;
    }
  }
  return result;
}

// Таблична перестановка зі збереженням пробілів
function columnarTransposition(text, key, isEncrypt) {
  if (!key || !text) return text;

  let processedText = text;
  let colCount = key.length;
  let rowCount = Math.ceil(processedText.length / colCount);

  let keyArr = Array.from(key).map((char, index) => ({ char, index }));
  keyArr.sort((a, b) => a.char.localeCompare(b.char));

  let result = "";

  if (isEncrypt) {
    let grid = [];
    let k = 0;
    for (let r = 0; r < rowCount; r++) {
      grid[r] = [];
      for (let c = 0; c < colCount; c++) {
        grid[r][c] = k < processedText.length ? processedText[k++] : undefined;
      }
    }
    for (let item of keyArr) {
      let c = item.index;
      for (let r = 0; r < rowCount; r++) {
        if (grid[r][c] !== undefined) {
          result += grid[r][c];
        }
      }
    }
  } else {
    let emptyCells = colCount * rowCount - processedText.length;
    let colLengths = Array(colCount).fill(rowCount);

    for (let i = 0; i < emptyCells; i++) {
      colLengths[colCount - 1 - i]--;
    }

    let grid = Array.from({ length: rowCount }, () =>
      Array(colCount).fill(undefined),
    );
    let k = 0;

    for (let item of keyArr) {
      let c = item.index;
      for (let r = 0; r < colLengths[c]; r++) {
        if (k < processedText.length) {
          grid[r][c] = processedText[k++];
        }
      }
    }

    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        if (grid[r][c] !== undefined) {
          result += grid[r][c];
        }
      }
    }
  }
  return result;
}

function updateHistograms() {
  const inText = document.getElementById("input-text").value;
  const outText = document.getElementById("output-text").value;
  const lang = document.getElementById("alphabet-select").value;
  const alphabet = alphabets[lang];

  drawChart(inText, alphabet, "chart-input");
  drawChart(outText, alphabet, "chart-output");
}

function drawChart(text, alphabet, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  let counts = {};
  let maxCount = 0;

  for (let char of text.toLowerCase()) {
    if (alphabet.includes(char)) {
      counts[char] = (counts[char] || 0) + 1;
      if (counts[char] > maxCount) maxCount = counts[char];
    }
  }

  for (let char of alphabet) {
    let count = counts[char] || 0;
    let heightPercent = maxCount === 0 ? 0 : (count / maxCount) * 100;

    let barGroup = document.createElement("div");
    barGroup.className = "bar-group";
    barGroup.title = `${char.toUpperCase()}: ${count}`;
    barGroup.innerHTML = `
                <div class="bar" style="height: ${heightPercent}%"></div>
                <div class="bar-label">${char}</div>
            `;
    container.appendChild(barGroup);
  }
}

function openFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("input-text").value = e.target.result;
    document.getElementById("file-status").innerText = `Відкрито: ${file.name}`;
    onInputTextChange();
  };
  reader.readAsText(file);
}

function saveFile(type) {
  const textId = type === "input" ? "input-text" : "output-text";
  const text = document.getElementById(textId).value;
  if (!text) {
    alert("Немає тексту для збереження!");
    return;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = type === "input" ? "source.txt" : "cipher.txt";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ==================== ЛАБОРАТОРНА №2: SHA-256 ТА JWT ==================== */

// Автономна реалізація SHA-256 та HMAC-SHA256 (працює навіть при відкритті через file://)
function sha256Bytes(asciiBytes) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];

  const l = asciiBytes.length;
  const bitLen = l * 8;
  const padLen = ((l + 9 + 63) >> 6) << 6;
  const padded = new Uint8Array(padLen);
  padded.set(asciiBytes);
  padded[l] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 4, bitLen >>> 0, false);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  const W = new Uint32Array(64);

  const rotr = (n, x) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, W[i - 15]) ^ rotr(18, W[i - 15]) ^ (W[i - 15] >>> 3);
      const s1 = rotr(17, W[i - 2]) ^ rotr(19, W[i - 2]) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outView.setUint32(i * 4, H[i], false);
  }
  return out;
}

function sha256Hex(str) {
  const bytes = new TextEncoder().encode(str);
  const hashBytes = sha256Bytes(bytes);
  return Array.from(hashBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hmacSha256Bytes(keyStr, messageStr) {
  let keyBytes = new TextEncoder().encode(keyStr);
  const msgBytes = new TextEncoder().encode(messageStr);

  if (keyBytes.length > 64) {
    keyBytes = sha256Bytes(keyBytes);
  }

  const paddedKey = new Uint8Array(64);
  paddedKey.set(keyBytes);

  const oKeyPad = new Uint8Array(64);
  const iKeyPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c;
    iKeyPad[i] = paddedKey[i] ^ 0x36;
  }

  const innerInput = new Uint8Array(64 + msgBytes.length);
  innerInput.set(iKeyPad);
  innerInput.set(msgBytes, 64);
  const innerHash = sha256Bytes(innerInput);

  const outerInput = new Uint8Array(64 + 32);
  outerInput.set(oKeyPad);
  outerInput.set(innerHash, 64);
  return sha256Bytes(outerInput);
}

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlEncodeStr(str) {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlDecodeStr(b64url) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// База з 3 користувачів (сусід вище, ви, сусід нижче)
let usersDB = [
  { id: 12, login: "Марчук", plainName: "Дмитро" },
  { id: 13, login: "Новак", plainName: "Давид" },
  { id: 14, login: "Паздерська", plainName: "Марія" },
];

function renderUsersTable() {
  const tbody = document.getElementById("users-tbody");
  tbody.innerHTML = "";

  usersDB.forEach((user, index) => {
    user.passwordHash = sha256Hex(user.plainName);
    const tr = document.createElement("tr");
    tr.innerHTML = `
                <td><input type="number" value="${user.id}" onchange="updateUser(${index}, 'id', this.value)"></td>
                <td><input type="text" value="${user.login}" onchange="updateUser(${index}, 'login', this.value)"></td>
                <td><input type="text" value="${user.plainName}" onchange="updateUser(${index}, 'plainName', this.value)"></td>
                <td class="hash-cell">${user.passwordHash}</td>
                <td><button onclick="fillLogin(${index})" style="padding: 6px 10px; font-size: 0.78rem;">Підставити</button></td>
            `;
    tbody.appendChild(tr);
  });
}

function updateUser(index, field, value) {
  usersDB[index][field] = field === "id" ? parseInt(value) || 1 : value.trim();
  renderUsersTable();
}

function fillLogin(index) {
  document.getElementById("login-username").value = usersDB[index].login;
  document.getElementById("login-password").value = usersDB[index].plainName;
}

function createJwt(payloadObj, secret) {
  const headerObj = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64UrlEncodeStr(JSON.stringify(headerObj));
  const payloadB64 = base64UrlEncodeStr(JSON.stringify(payloadObj));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signatureB64 = base64UrlEncodeBytes(
    hmacSha256Bytes(secret, signingInput),
  );
  return {
    token: `${headerB64}.${payloadB64}.${signatureB64}`,
    headerB64,
    payloadB64,
    signatureB64,
    headerObj,
    payloadObj,
  };
}

let lastGeneratedToken = "";

function handleLogin() {
  const loginInput = document.getElementById("login-username").value.trim();
  const passwordInput = document.getElementById("login-password").value.trim();
  const secret =
    document.getElementById("jwt-secret").value.trim() || "FirstnameLastname";
  const expMinutes =
    parseInt(document.getElementById("jwt-exp-minutes").value) || 1;
  const statusBox = document.getElementById("login-status");

  // Хешуємо введений пароль алгоритмом SHA-256 без солі
  const inputPasswordHash = sha256Hex(passwordInput);

  // Шукаємо користувача в базі
  const user = usersDB.find(
    (u) => u.login === loginInput && u.passwordHash === inputPasswordHash,
  );

  statusBox.style.display = "block";

  if (!user) {
    statusBox.className = "status-box error";
    statusBox.innerText =
      "Помилка 401: Невірний логін або пароль (SHA-256 хеші не збігаються).";
    return;
  }

  statusBox.className = "status-box success";
  statusBox.innerText = `Користувач ${user.login} (ID: ${user.id}) був успішно авторизований на /login!`;

  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    login: user.login,
    id: user.id,
    iat: nowSec,
    exp: nowSec + expMinutes * 60,
  };

  const jwtData = createJwt(payload, secret);
  lastGeneratedToken = jwtData.token;

  document.getElementById("jwt-output").innerHTML =
    `<span class="jwt-header">${jwtData.headerB64}</span>.` +
    `<span class="jwt-payload">${jwtData.payloadB64}</span>.` +
    `<span class="jwt-signature">${jwtData.signatureB64}</span>`;

  document.getElementById("jwt-payload-json").innerText = JSON.stringify(
    payload,
    null,
    2,
  );
  document.getElementById("bearer-input").value = jwtData.token;
}

function copyToken() {
  const token =
    document.getElementById("bearer-input").value.trim() || lastGeneratedToken;
  if (!token) {
    alert("Спочатку згенеруйте токен!");
    return;
  }
  navigator.clipboard.writeText(token);
  alert("JWT токен скопійовано в буфер обміну!");
}

function verifyProtectedRoute() {
  const rawInput = document.getElementById("bearer-input").value.trim();
  const secret =
    document.getElementById("jwt-secret").value.trim() || "FirstnameLastname";
  const statusBox = document.getElementById("protected-status");
  statusBox.style.display = "block";

  const token = rawInput.replace(/^Bearer\s+/i, "");
  const parts = token.split(".");

  if (parts.length !== 3) {
    statusBox.className = "status-box error";
    statusBox.innerText =
      "Помилка 400: Некоректний формат JWT токена (має складатися з 3 частин, розділених крапками).";
    return;
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const expectedSig = base64UrlEncodeBytes(
    hmacSha256Bytes(secret, `${headerB64}.${payloadB64}`),
  );

  if (signatureB64 !== expectedSig) {
    statusBox.className = "status-box error";
    statusBox.innerText =
      "Помилка 403 (Invalid Signature): Підпис токена недійсний або змінено дані/Secret!";
    return;
  }

  try {
    const payload = JSON.parse(base64UrlDecodeStr(payloadB64));
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && nowSec > payload.exp) {
      statusBox.className = "status-box error";
      statusBox.innerText =
        "Помилка 401 (Token Expired): Час дії токена минув!";
      return;
    }

    statusBox.className = "status-box success";
    statusBox.innerText = `Доступ дозволено (200 OK)! Вітаємо на захищеному шляху, користувачу "${payload.login}" (ID: ${payload.id}). Bearer-токен валідний.`;
  } catch (e) {
    statusBox.className = "status-box error";
    statusBox.innerText = "Помилка декодування Payload.";
  }
}

// Ініціалізація
updateHistograms();
renderUsersTable();

/* ==================== S-DES АЛГОРИТМ ==================== */
const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
const P8 = [6, 3, 7, 4, 8, 5, 10, 9];
const P4 = [2, 4, 3, 1];
const EP = [4, 1, 2, 3, 2, 3, 4, 1];
const IP = [2, 6, 3, 1, 4, 8, 5, 7];
const IP_INV = [4, 1, 3, 5, 7, 2, 8, 6];

const S0 = [
  [1, 0, 3, 2],
  [3, 2, 1, 0],
  [0, 2, 1, 3],
  [3, 1, 3, 1],
];
const S1 = [
  [1, 1, 2, 3],
  [2, 0, 1, 3],
  [3, 0, 1, 0],
  [2, 1, 0, 3],
];

let logHTML = "";
function log(msg) {
  logHTML += msg + "<br>";
}

function permute(bits, table) {
  let result = "";
  for (let i = 0; i < table.length; i++) result += bits[table[i] - 1];
  return result;
}

function shiftLeft(bits, shifts) {
  return bits.substring(shifts) + bits.substring(0, shifts);
}

function xor(a, b) {
  let result = "";
  for (let i = 0; i < a.length; i++) result += a[i] === b[i] ? "0" : "1";
  return result;
}

function generateKeys(key) {
  log(`[Генерація ключів]`);
  const p10Key = permute(key, P10);
  log(`P10(Key): ${p10Key.substring(0, 5)} ${p10Key.substring(5, 10)}`);

  let l = shiftLeft(p10Key.substring(0, 5), 1);
  let r = shiftLeft(p10Key.substring(5, 10), 1);
  const k1 = permute(l + r, P8);
  log(`Після LS-1: ${l} ${r}`);
  log(`<span class="key-color">Підключ K1 (через P8): ${k1}</span>`);

  l = shiftLeft(l, 2);
  r = shiftLeft(r, 2);
  const k2 = permute(l + r, P8);
  log(`Після LS-2: ${l} ${r}`);
  log(`<span class="key-color">Підключ K2 (через P8): ${k2}</span><br>`);

  return { k1, k2 };
}

function fK(bits, subkey) {
  const l = bits.substring(0, 4);
  const r = bits.substring(4, 8);

  const epR = permute(r, EP);
  log(`&nbsp;&nbsp;E/P(Right): ${epR}`);

  const xorRes = xor(epR, subkey);
  log(`&nbsp;&nbsp;XOR з підключем: ${xorRes}`);

  const lSbox = xorRes.substring(0, 4);
  const rSbox = xorRes.substring(4, 8);

  const row0 = parseInt(lSbox[0] + lSbox[3], 2);
  const col0 = parseInt(lSbox[1] + lSbox[2], 2);
  const val0 = S0[row0][col0].toString(2).padStart(2, "0");

  const row1 = parseInt(rSbox[0] + rSbox[3], 2);
  const col1 = parseInt(rSbox[1] + rSbox[2], 2);
  const val1 = S1[row1][col1].toString(2).padStart(2, "0");

  log(`&nbsp;&nbsp;S0 [ряд ${row0}, стовп ${col0}] -> ${val0}`);
  log(`&nbsp;&nbsp;S1 [ряд ${row1}, стовп ${col1}] -> ${val1}`);

  const p4Res = permute(val0 + val1, P4);
  log(`&nbsp;&nbsp;P4(S-блоки): ${p4Res}`);

  const finalXor = xor(l, p4Res);
  log(`&nbsp;&nbsp;XOR з лівою частиною (${l}): ${finalXor}`);

  return finalXor + r;
}

function processSDES(mode) {
  const key = document.getElementById("sdes-key").value.trim();
  const text = document.getElementById("sdes-text").value.trim();
  const logContainer = document.getElementById("sdes-log");
  logHTML = "";

  if (!/^[01]{10}$/.test(key)) {
    logContainer.innerHTML =
      '<span class="danger-text">Помилка: Ключ має складатись рівно з 10 біт (0 та 1).</span>';
    return;
  }
  if (!/^[01]{8}$/.test(text)) {
    logContainer.innerHTML =
      '<span class="danger-text">Помилка: Текст має складатись рівно з 8 біт (0 та 1).</span>';
    return;
  }

  const keys = generateKeys(key);
  let currentK1 = mode === "encrypt" ? keys.k1 : keys.k2;
  let currentK2 = mode === "encrypt" ? keys.k2 : keys.k1;

  log(`[Початок ${mode === "encrypt" ? "Шифрування" : "Розшифрування"}]`);
  log(`Вхідний блок: <span class="highlight">${text}</span>`);

  const ipText = permute(text, IP);
  log(
    `Після початкової перестановки IP: ${ipText.substring(0, 4)} ${ipText.substring(4, 8)}<br>`,
  );

  log(`--- Раунд 1 (з підключем ${mode === "encrypt" ? "K1" : "K2"}) ---`);
  const r1Text = fK(ipText, currentK1);
  log(
    `Результат Раунду 1: ${r1Text.substring(0, 4)} ${r1Text.substring(4, 8)}<br>`,
  );

  log(`--- Перемикач блоків SW ---`);
  const swText = r1Text.substring(4, 8) + r1Text.substring(0, 4);
  log(`Після SW: ${swText.substring(0, 4)} ${swText.substring(4, 8)}<br>`);

  log(`--- Раунд 2 (з підключем ${mode === "encrypt" ? "K2" : "K1"}) ---`);
  const r2Text = fK(swText, currentK2);
  log(
    `Результат Раунду 2: ${r2Text.substring(0, 4)} ${r2Text.substring(4, 8)}<br>`,
  );

  const finalText = permute(r2Text, IP_INV);
  log(`--- Кінцева перестановка IP⁻¹ ---`);
  log(
    `Двійковий результат: <span class="highlight result-color">${finalText}</span>`,
  );

  const decimalResult = parseInt(finalText, 2);
  log(
    `Десяткове значення: <span class="highlight result-color">${decimalResult}</span>`,
  );

  logContainer.innerHTML = logHTML;
}

/* ==================== ЛАБОРАТОРНА №4: DIFFIE-HELLMAN ==================== */

// Функція для обчислення (base^exponent) mod modulus з підтримкою великих чисел
function modPow(base, exponent, modulus) {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) result = (result * base) % modulus;
    exponent = exponent / 2n;
    base = (base * base) % modulus;
  }
  return result;
}

function toggleMITM() {
  const isMITM = document.getElementById("mitm-active").checked;
  document.getElementById("mitm-controls").style.display = isMITM
    ? "block"
    : "none";
}

function simulateDH() {
  // Зчитуємо параметри та конвертуємо в BigInt для запобігання переповнення
  const p = BigInt(document.getElementById("dh-p").value);
  const g = BigInt(document.getElementById("dh-g").value);
  const a = BigInt(document.getElementById("alice-a").value);
  const b = BigInt(document.getElementById("bob-b").value);

  const isMITM = document.getElementById("mitm-active").checked;

  const aliceLog = document.getElementById("alice-log");
  const bobLog = document.getElementById("bob-log");
  const eveLog = document.getElementById("eve-log");

  // Крок 1: Обчислення відкритих ключів
  const A = modPow(g, a, p); // A = g^a mod p
  const B = modPow(g, b, p); // B = g^b mod p

  if (!isMITM) {
    // --- НОРМАЛЬНИЙ ОБМІН ---
    // Крок 2: Обчислення спільного секрету
    const kAlice = modPow(B, a, p); // K = B^a mod p
    const kBob = modPow(A, b, p); // K = A^b mod p

    aliceLog.innerHTML = `
            Відомо: (p=${p}, g=${g}, <span class="highlight">a=${a}</span>)<br><br>
            Обчислює відкритий ключ <b>A</b>:<br>
            A = g<sup>a</sup> mod p<br>
            A = ${g}<sup>${a}</sup> mod ${p} = <span class="result-color">${A}</span><br><br>
            <i>Надсилає A Бобу -></i><br>
            <i><- Отримує B від Боба (${B})</i><br><br>
            Обчислює спільний ключ <b>K</b>:<br>
            K = B<sup>a</sup> mod p<br>
            K = ${B}<sup>${a}</sup> mod ${p} = <b style="color:var(--accent-orange)">${kAlice}</b>
        `;

    bobLog.innerHTML = `
            Відомо: (p=${p}, g=${g}, <span class="highlight">b=${b}</span>)<br><br>
            Обчислює відкритий ключ <b>B</b>:<br>
            B = g<sup>b</sup> mod p<br>
            B = ${g}<sup>${b}</sup> mod ${p} = <span class="result-color">${B}</span><br><br>
            <i><- Отримує A від Аліси (${A})</i><br>
            <i>Надсилає B Алісі -></i><br><br>
            Обчислює спільний ключ <b>K</b>:<br>
            K = A<sup>b</sup> mod p<br>
            K = ${A}<sup>${b}</sup> mod ${p} = <b style="color:var(--accent-green-text)">${kBob}</b>
        `;

    eveLog.innerHTML = `
            <i>Прослуховує канал...</i><br><br>
            Перехоплено від Аліси: <b>A = ${A}</b><br>
            Перехоплено від Боба: <b>B = ${B}</b><br><br>
            <span class="danger-text">Зловмисник бачить відкриті ключі, але не може обчислити спільний ключ K без знання 'a' або 'b'.</span>
        `;
  } else {
    // --- АТАКА "ЛЮДИНА ПОСЕРЕДИНІ" (MITM) ---
    const c = BigInt(document.getElementById("eve-c").value); // Секретний ключ зловмисника
    const C = modPow(g, c, p); // Відкритий ключ зловмисника: C = g^c mod p

    // Аліса обчислює секрет з ключем зловмисника (думаючи, що це Боб)
    const kAliceEve = modPow(C, a, p); // K1 = C^a mod p
    // Боб обчислює секрет з ключем зловмисника (думаючи, що це Аліса)
    const kBobEve = modPow(C, b, p); // K2 = C^b mod p

    // Зловмисник обчислює обидва секрети
    const kEveAlice = modPow(A, c, p); // K1 = A^c mod p
    const kEveBob = modPow(B, c, p); // K2 = B^c mod p

    aliceLog.innerHTML = `
            Відомо: (p=${p}, g=${g}, <span class="highlight">a=${a}</span>)<br><br>
            Обчислює відкритий ключ <b>A</b>:<br>
            A = g<sup>a</sup> mod p = <span class="result-color">${A}</span><br><br>
            <i>Надсилає A Бобу -> (перехоплено MITM)</i><br>
            <i><- Отримує підмінений ключ від MITM (${C})</i><br><br>
            Обчислює спільний ключ <b>K1</b>:<br>
            K1 = ${C}<sup>${a}</sup> mod ${p} = <b style="color:var(--accent-orange)">${kAliceEve}</b><br><br>
            <span class="danger-text">Аліса думає, що K1 (${kAliceEve}) — це секрет із Бобом.</span>
        `;

    bobLog.innerHTML = `
            Відомо: (p=${p}, g=${g}, <span class="highlight">b=${b}</span>)<br><br>
            Обчислює відкритий ключ <b>B</b>:<br>
            B = g<sup>b</sup> mod p = <span class="result-color">${B}</span><br><br>
            <i><- Отримує підмінений ключ від MITM (${C})</i><br>
            <i>Надсилає B Алісі -> (перехоплено MITM)</i><br><br>
            Обчислює спільний ключ <b>K2</b>:<br>
            K2 = ${C}<sup>${b}</sup> mod ${p} = <b style="color:var(--accent-green-text)">${kBobEve}</b><br><br>
            <span class="danger-text">Боб думає, що K2 (${kBobEve}) — це секрет із Алісою.</span>
        `;

    eveLog.innerHTML = `
            <span style="color:#ff6b8b; font-weight:bold;">УВАГА: Атака MITM активна!</span><br>
            Секретний ключ зловмисника: <span class="highlight">c = ${c}</span><br>
            Відкритий ключ зловмисника: <b>C</b> = g<sup>c</sup> mod p = ${C}<br><br>
            
            Перехопив <b>A=${A}</b> і надіслав Алісі <b>C=${C}</b><br>
            Перехопив <b>B=${B}</b> і надіслав Бобу <b>C=${C}</b><br><br>
            
            Зловмисник обчислює <b>K1</b> (з Алісою): ${A}<sup>${c}</sup> mod ${p} = <b style="color:#ff6b8b">${kEveAlice}</b><br>
            Зловмисник обчислює <b>K2</b> (з Бобом): ${B}<sup>${c}</sup> mod ${p} = <b style="color:#ff6b8b">${kEveBob}</b>
        `;
  }
}
