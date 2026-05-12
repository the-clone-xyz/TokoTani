import multer from "multer";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Initialize SQLite
const dbPath = path.join(process.cwd(), "tokotani.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    price INTEGER,
    image TEXT,
    category TEXT,
    stock INTEGER
  );
`);

// Insert default admin if not exists
const checkAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@gmail.com");
if (!checkAdmin) {
  db.prepare("INSERT INTO users (id, email, password) VALUES (?, ?, ?)").run("u1", "admin@gmail.com", "admin123");
}

// Insert default products if empty
const countProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (countProducts.count === 0) {
  const defaultProducts = [
    { id: 'p1', name: 'Benih Padi Inpari 32', description: 'Benih padi unggul Inpari 32 tahan hama dan penyakit', price: 85000, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800', category: 'Benih', stock: 50 },
    { id: 'p2', name: 'Pupuk NPK Mutiara 16-16-16', description: 'Pupuk majemuk lengkap', price: 18000, image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800', category: 'Pupuk', stock: 100 },
    { id: 'p3', name: 'Cangkul Baja Asli', description: 'Cangkul baja kuat dan tajam', price: 125000, image: 'https://images.unsplash.com/photo-1416879590620-80ea7b3c2e64?auto=format&fit=crop&q=80&w=800', category: 'Alat', stock: 25 },
    { id: 'p4', name: 'Pestisida Nabati Neem Oil', description: 'Pembasmi hama organik', price: 45000, image: 'https://images.unsplash.com/photo-1610476485896-1c7ef35d2543?auto=format&fit=crop&q=80&w=800', category: 'Obat', stock: 30 },
  ];
  const insertProduct = db.prepare("INSERT INTO products (id, name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)");
  for (const p of defaultProducts) {
    insertProduct.run(p.id, p.name, p.description, p.price, p.image, p.category, p.stock);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to authenticate
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      (req as any).user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ message: "Success", token, user: { id: user.id, email: user.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, (req, res) => {
    res.json({ user: (req as any).user });
  });

  // Product Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + path.extname(file.originalname))
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Hanya file gambar yang diperbolehkan.'));
      }
    }
  });

  app.use('/uploads', express.static(uploadDir));

  app.post("/api/products", authenticateToken, upload.single('image'), (req, res) => {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const id = "p" + Date.now();
    try {
      db.prepare("INSERT INTO products (id, name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, name, description, price, image, category, stock);
      res.json({ id, name, description, price, image, category, stock });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/products/:id", authenticateToken, upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { name, description, price, category, stock } = req.body;
    const newImage = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    try {
      if (newImage) {
        db.prepare("UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ? WHERE id = ?").run(name, description, price, newImage, category, stock, id);
      } else {
        db.prepare("UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ? WHERE id = ?").run(name, description, price, category, stock, id);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/products/:id", authenticateToken, (req, res) => {
    try {
      db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Correct way to serve static files in production after build
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
