const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}
// Middleware

app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db2'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});
const verifyTokenAndRole = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send('Access Denied: No Token Provided!');
    }
    const roles = req.requiredroles || ["admin", "client"]
    try {
      const decoded = jwt.verify(token, 'OEKFNEZKkF78EZFH93023NOEAF');
      req.user = decoded;
      const sql = 'SELECT role FROM users WHERE id = ?';
      db.query(sql, [req.user.id], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }

        if (results.length === 0) {
          return res.status(404).send('User not found');
        }

        const userRole = results[0].role;
        if (!roles.includes(userRole)) {
        return res.status(403).send('Access Denied: You do not have the required role!');
      }

      next();
    })
    } catch (error) {
      res.status(400).send('Invalid Token');
    }
  };
// Routes
app.post('/api/signup', (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword)
  const sql = 'INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('User registered');
  });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign({ id: user.id }, 'OEKFNEZKkF78EZFH93023NOEAF', { expiresIn: 86400 });
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 86400000 ms = 24 heures

    res.status(200).send({ auth: true, role: user.role});
  });
});

app.get('/api/clients/count', (req,_res, next) => {
  req.requiredroles = ["admin"]
  next()
},  verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results[0]);
  });
});

app.get('/api/clients', (req, _res, next) => {
  req.requiredroles = ["admin"]
  next()
}, verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT * FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results);
  });
});

app.get('/api/client/:id', (req, _res, next) => {
  req.requiredroles = ["admin", "client"]
  next()
}, verifyTokenAndRole, (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Client not found');
      return;
    }

    res.status(200).json(results[0]);
  });
}
);

app.get('/api/vehicules', (req, res) => {
  req.requiredroles = ["admin"];
  verifyTokenAndRole(req, res, () => {
    const sql = `
      SELECT v.id, v.marque, v.modele, v.annee, c.firstname, c.lastname
      FROM vehicules v
      LEFT JOIN users c ON v.client_id = c.id WHERE c.role = 'client'
    `;
    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      res.status(200).json(results);
    });
  });
});


app.post('/api/vehicules', (req, _res, next) => {
  req.requiredroles = ["admin"]
  next()
}, verifyTokenAndRole, (req, res) => {
  const { id, marque, modele, annee, client_id } = req.body;

  const sql = 'INSERT INTO vehicules (id, marque, modele, annee, client_id) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [id, marque, modele, annee, client_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(201).send('Vehicule added');
  });
})

app.get('/api/vehicule/:id', (req, _res, next) => {
  req.requiredroles = ["admin"]
  next()
}, verifyTokenAndRole, (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM vehicules WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Vehicule not found');
      return;
    }

    res.status(200).json(results[0]);
  });
});

app.put('/api/vehicule/:id', (req, _res, next) => {
  req.requiredroles = ["admin"]
  next()
}, verifyTokenAndRole, (req, res) => {
  const { id } = req.params;
  const { newid, marque, modele, annee, client_id } = req.body;

  const sql = 'UPDATE vehicules SET id = ?, marque = ?, modele = ?, annee = ?, client_id = ? WHERE id = ?';
  db.query(sql, [newid, marque, modele, annee, client_id, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).send('Vehicule updated');
  });
});

app.delete('/api/vehicule/:id', (req, _res, next) => {
  req.requiredroles = ["admin"]
  next()
}, verifyTokenAndRole, (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM vehicules WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).send('Vehicule deleted');
  });
});



app.use(express.static(path.join(__dirname, "./client/dist")))
app.get("*", (_, res) => {
    res.sendFile(
      path.join(__dirname, "./client/dist/index.html")
    )
})
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;