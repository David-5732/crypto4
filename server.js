const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = 3000;

// Дозволяємо серверу приймати дані у форматі JSON та форм
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роздаємо також ваш візуальний сайт index.html
app.use(express.static(path.join(__dirname)));

// =========================================================================
// КРОК 1: ЗАМІНІТЬ ЦІ ДАНІ НА СВОЇ ТА СВОЇХ ОДНОГРУПНИКІВ ЗА СПИСКОМ ГРУПИ
// =========================================================================

// Ваше Ім'я та Прізвище англійською без пробілу (вимога: формат FirstnameLastname)
const JWT_SECRET = "DavidNovak";

// Ваш порядковий номер у списку групи (визначає час дії токена у хвилинах)
const MY_LIST_NUMBER = 13;

// Функція простого хешування SHA256 без солі (вимога п. 3.г' та 3.д)
function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

// База з 3 користувачів (вимога п. 3.в, 3.г, 3.г'):
// 1) Одногрупник на 1 вище вас у списку
// 2) Ви
// 3) Одногрупник наступний за вами по списку
// Логін - прізвище, пароль - ім'я (зберігається захешованим через SHA256!), id - номер у списку
const usersDB = [
  { id: 12, login: "Марчук", passwordHash: sha256("Дмитро") },
  { id: 13, login: "Новак", passwordHash: sha256("Давид") },
  { id: 14, login: "Паздерська", passwordHash: sha256("Марія") },
];

// =========================================================================
// ЗАВДАННЯ 3 та 4: Шлях /login (перевірка хешу пароля + генерація JWT)
// =========================================================================
app.all("/login", (req, res) => {
  // Отримуємо логін та пароль (з Body JSON, Query-параметрів або Basic Auth у Postman)
  let login = (req.body && req.body.login) || req.query.login;
  let password = (req.body && req.body.password) || req.query.password;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Basic ")) {
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf8",
    );
    [login, password] = credentials.split(":");
  }

  // Пункт 3.б: для доступу до шляху користувач повинен бути авторизований
  if (!login || !password) {
    return res.status(401).json({
      status: "Помилка 401",
      message:
        "Для доступу до шляху /login необхідно передати login (прізвище) та password (ім'я)!",
    });
  }

  // Пункт 3.г': під час перевірки логіну/паролю також використовується хеш SHA256
  const inputPasswordHash = sha256(password);

  // Шукаємо користувача в базі за логіном та порівнюємо хеші паролів
  const user = usersDB.find(
    (u) => u.login === login && u.passwordHash === inputPasswordHash,
  );

  if (!user) {
    return res.status(401).json({
      status: "Помилка 401",
      message: "Невірний логін або пароль (хеші SHA256 не збігаються)!",
    });
  }

  // Пункт 4.б та 4.в: генеруємо JWT токен за допомогою бібліотеки jsonwebtoken
  // У токені: логін користувача, id. Алгоритм: HS256 (SHA256). Secret: FirstnameLastname.
  // Час дії токена: ваш номер у списку (у хвилинах, щоб ви встигли його перевірити)
  const token = jwt.sign({ login: user.login, id: user.id }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: `${MY_LIST_NUMBER}m`,
  });

  // Пункт 3.е: сторінка повідомляє, що користувач був успішно авторизований + видає токен
  return res.status(200).json({
    message: `Користувач ${user.login} (ID: ${user.id}) був успішно авторизований!`,
    token: token,
  });
});

// =========================================================================
// ЗАВДАННЯ 4.г' та 4.д: Захищений шлях (доступ тільки з валідним Bearer токеном)
// =========================================================================
app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization;

  // Перевіряємо, чи передано заголовок Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "Помилка 401",
      message:
        "Доступ заборонено! Передайте Bearer Token у вкладці Authorization.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Перевіряємо валідність токена та секретний ключ
    const decodedData = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    return res.status(200).json({
      message: "Доступ до захищеного шляху успішно надано (токен валідний)!",
      userFromToken: decodedData,
    });
  } catch (error) {
    return res.status(403).json({
      status: "Помилка 403",
      message: "Токен невалідний або час його дії минув!",
      error: error.message,
    });
  }
});

// Запуск веб-сервера (Пункт 1)
app.listen(PORT, () => {
  console.log("====================================================");
  console.log(`Веб-сервер успішно запущено: http://localhost:${PORT}`);
  console.log(`Шлях авторизації:            http://localhost:${PORT}/login`);
  console.log(
    `Захищений шлях (JWT):        http://localhost:${PORT}/protected`,
  );
  console.log("====================================================");
  console.log("База користувачів (паролі захешовані у SHA256):");
  console.table(usersDB);
});
