require('dotenv').config(); // Load environment variables early

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser'); // To parse incoming request bodies
const Joi = require('joi');
const path = require('path');
const cors = require('cors');  // Import CORS
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // Use JWT secret from .env file

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://task-management-system-amber.vercel.app/', // Replace with your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
})); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectTimeout: 20000,
    connectionLimit: 10 // Adjust based on your needs
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    if (connection) connection.release(); // Release the connection back to the pool
    console.log('Connected to the MySQL database via connection pool.');
});

// Task schema validation
const taskSchema = Joi.object({
    user_id: Joi.number().integer().required(),
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High').required(),
    deadline: Joi.date().optional(),
    status: Joi.string().valid('Pending', 'In Progress', 'Completed').required()
});

// Get all tasks
app.get('/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Add a new task
app.post('/task', (req, res) => {
    // Validate the request body
    const { error } = taskSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const newTask = {
        user_id: req.body.user_id,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        deadline: req.body.deadline,
        status: req.body.status
    };

    const sql = 'INSERT INTO tasks SET ?';

    db.query(sql, newTask, (err, result) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json({ message: 'Task added', taskId: result.insertId });
    });
});

// Update a task
app.put('/task/:id', (req, res) => {
    // Validate the request body
    const { error } = taskSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const taskId = req.params.id;
    const updatedTask = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        deadline: req.body.deadline,
        status: req.body.status
    };

    const sql = 'UPDATE tasks SET ? WHERE id = ?';

    db.query(sql, [updatedTask, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json({ message: 'Task updated' });
    });
});

// Delete a task
app.delete('/task/:id', (req, res) => {
    const taskId = req.params.id;
    const userId = req.body.user_id; // Assuming you pass user_id in the body

    const findTaskSql = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
    db.query(findTaskSql, [taskId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Task not found or you do not own this task.' });
        }

        const deleteTaskSql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
        db.query(deleteTaskSql, [taskId, userId], (err, result) => {
            if (err) {
                console.error('Error deleting task:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            res.json({ message: 'Task deleted' });
        });
    });
});

// Search for tasks
app.get('/tasks/search', (req, res) => {
    const { title, priority, status, user_id } = req.query;

    let sql = 'SELECT * FROM tasks WHERE 1=1';  // 1=1 allows easy appending of conditions

    if (title) {
        sql += ` AND title LIKE '%${title}%'`;
    }
    if (priority) {
        sql += ` AND priority = '${priority}'`;
    }
    if (status) {
        sql += ` AND status = '${status}'`;
    }
    if (user_id) {
        sql += ` AND user_id = ${user_id}`;
    }

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error searching tasks:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.json(results);
    });
});

// Add a new user with duplicate check
app.post('/user', async (req, res) => {
    const { username, password, email } = req.body;

    // Validate the request body
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const checkUserSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkUserSql, [username, email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking for existing user' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';

        db.query(sql, [username, hashedPassword, email], (err, result) => {
            if (err) {
                console.error('Error adding user:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            res.json({ message: 'User added', userId: result.insertId });
        });
    });
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user.id, message: 'Login successful' });
    });
});

// Fetch tasks for a specific user
app.get('/tasks/user/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = 'SELECT * FROM tasks WHERE user_id = ?';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results); // Return tasks for the user
    });
});

// Serve static HTML pages
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/delete', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'delete.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

app.get('/update', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'update.html'));
});

// Start the server
app.listen(3000, '::', () => {
    console.log('Server is running on port 3000');
});
