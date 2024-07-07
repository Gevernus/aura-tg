
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8000;

// Парсер для обработки JSON данных
app.use(bodyParser.json());

// Настройки для подключения к базе данных MySQL
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: 'sT5lG1pM8c',
  database: 'telegramm_aura'
};


// Создаем соединение с базой данных
const connection = mysql.createConnection(dbConfig);

connection.connect(error => {
  if (error) {
    console.error('Ошибка подключения к базе данных:', error);
    return;
  }
  console.log('Успешно подключено к базе данных MySQL');
});

// Маршрут для проверки существования пользователя
app.post('/api/check-user', (req, res) => {
  const { username } = req.body;

  connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Ошибка при выполнении запроса к базе данных:', error);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
      return;
    }

    if (results.length === 0) {
      res.json({ exists: false });
    } else {
      res.json({ exists: true, user: results[0] });
    }
  });
});

// Маршрут для регистрации пользователя
app.post('/api/register', (req, res) => {
  const { username } = req.body;

  connection.query('INSERT INTO users (username) VALUES (?)', [username], (error, results) => {
    if (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      res.status(500).send('Ошибка при регистрации пользователя');
      return;
    }

    res.json({ id: results.insertId, username });
  });
});

// Маршрут для получения данных пользователя
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;

  connection.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
    if (error) {
      console.error('Ошибка при выполнении запроса к базе данных:', error);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Пользователь не найден');
      return;
    }

    res.json(results[0]);
  });
});

// Маршрут для обновления энергии пользователя
app.post('/api/user/:id/energy', (req, res) => {
  const userId = req.params.id;
  const { energy } = req.body;

  connection.query('UPDATE users SET energy = ? WHERE id = ?', [energy, userId], (error, results) => {
    if (error) {
      console.error('Ошибка при обновлении энергии пользователя:', error);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
      return;
    }

    res.send('Энергия пользователя успешно обновлена');
  });
});

// Маршрут для обновления монет и силы тапов пользователя
app.post('/api/user/:id/update', (req, res) => {
  const userId = req.params.id;
  const { coins, tap_power } = req.body;

  connection.query('UPDATE users SET coins = ?, tap_power = ? WHERE id = ?', [coins, tap_power, userId], (error, results) => {
    if (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
      return;
    }

    res.send('Данные пользователя успешно обновлены');
  });
});

// Маршрут для получения списка рефералов
app.get('/api/user/:id/referrals', (req, res) => {
  const userId = req.params.id;

  connection.query('SELECT * FROM referrals WHERE inviter_id = ?', [userId], (error, results) => {
    if (error) {
      console.error('Ошибка при выполнении запроса к базе данных:', error);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
      return;
    }

    res.json(results);
  });
});

// Маршрут для обновления статуса реферала
app.post('/api/referral/:id/status', (req, res) => {
  const referralId = req.params.id;
  const { status } = req.body;

  connection.query('UPDATE referrals SET status = ? WHERE id = ?', [status, referralId], (error, results) => {
    if (error) {
      console.error('Ошибка при обновлении статуса реферала:', error);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
      return;
    }

    res.send('Статус реферала успешно обновлен');
  });
});

// Маршрут для получения бонуса за реферала
app.post('/api/user/:id/claim', (req, res) => {
  const userId = req.params.id;
  const { referralId, bonus } = req.body;

  connection.query('UPDATE users SET coins = coins + ? WHERE id = ?', [bonus, userId], (error, results) => {
    if (error) {
      console.error('Ошибка при получении бонуса за реферала:', error);
      res.status(500).send('Ошибка при выполнении запроса к базе данных');
      return;
    }

    connection.query('UPDATE referrals SET status = "claimed" WHERE id = ?', [referralId], (error, results) => {
      if (error) {
        console.error('Ошибка при обновлении статуса реферала:', error);
        res.status(500).send('Ошибка при выполнении запроса к базе данных');
        return;
      }

      res.send('Бонус успешно получен');
    });
  });
});

// Маршрут для получения статического контента
app.use(express.static(__dirname));

// Маршрут по умолчанию для перенаправления на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
