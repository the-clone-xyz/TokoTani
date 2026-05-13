import multer from "multer";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import midtransClient from 'midtrans-client';

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

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    address TEXT,
    total_amount INTEGER,
    status TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_token TEXT,
    payment_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try { db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'"); } catch(e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN payment_token TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN payment_url TEXT"); } catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    product_id INTEGER,
    product_name TEXT,
    quantity INTEGER,
    price INTEGER,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS midtrans_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id TEXT,
    client_key TEXT,
    server_key TEXT,
    is_production BOOLEAN DEFAULT 0
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

  // Midtrans Config Routes
  app.get("/api/admin/midtrans", authenticateToken, (req, res) => {
    try {
      let config = db.prepare("SELECT * FROM midtrans_config LIMIT 1").get();
      if (!config) {
        config = { merchant_id: '', client_key: '', server_key: '', is_production: 0 };
      }
      res.json(config);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/midtrans", authenticateToken, (req, res) => {
    const { merchant_id, client_key, server_key, is_production } = req.body;
    try {
      const existing = db.prepare("SELECT id FROM midtrans_config LIMIT 1").get() as any;
      if (existing) {
        db.prepare("UPDATE midtrans_config SET merchant_id = ?, client_key = ?, server_key = ?, is_production = ? WHERE id = ?")
          .run(merchant_id, client_key, server_key, is_production ? 1 : 0, existing.id);
      } else {
        db.prepare("INSERT INTO midtrans_config (merchant_id, client_key, server_key, is_production) VALUES (?, ?, ?, ?)")
          .run(merchant_id, client_key, server_key, is_production ? 1 : 0);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Order & Checkout Routes
  app.post("/api/checkout", async (req, res) => {
    const { customer_name, customer_email, customer_phone, address, items, total_amount } = req.body;
    const order_id = "ORDER-" + Date.now();

    try {
      // Save order
      db.prepare("INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, total_amount, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(order_id, customer_name, customer_email, customer_phone, address, total_amount, 'pending', 'pending');

      // Save order items
      if (items && Array.isArray(items)) {
        const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)");
        items.forEach((item: any) => {
          insertItem.run(order_id, item.id || item.product_id, item.name, item.quantity, item.price);
        });
      }

      // Get Midtrans config
      const config = db.prepare("SELECT * FROM midtrans_config LIMIT 1").get() as any;
      if (!config || !config.server_key) {
        // If not configured, just return the order without a token
        return res.json({ order_id, message: "Order created successfully without payment token (Gateway not configured)" });
      }

      // Create SNAP transaction
      let snap = new midtransClient.Snap({
        isProduction: config.is_production === 1,
        serverKey: config.server_key,
        clientKey: config.client_key
      });

      let parameter: any = {
        "transaction_details": {
          "order_id": order_id,
          "gross_amount": total_amount
        },
        "customer_details": {
          "first_name": customer_name,
          "email": customer_email,
          "phone": customer_phone,
          "shipping_address": {
            "first_name": customer_name,
            "phone": customer_phone,
            "address": address
          }
        }
      };

      if (items && Array.isArray(items)) {
        parameter.item_details = items.map((item: any) => ({
          id: item.id || item.product_id,
          price: item.price,
          quantity: item.quantity,
          name: item.name.substring(0, 50) // Midtrans has length limit
        }));
      }

      const transaction = await snap.createTransaction(parameter);
      
      // Update order with payment token
      db.prepare("UPDATE orders SET payment_token = ?, payment_url = ? WHERE id = ?")
        .run(transaction.token, transaction.redirect_url, order_id);

      res.json({ token: transaction.token, redirect_url: transaction.redirect_url, order_id });
    } catch (e: any) {
      console.error("Checkout error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/midtrans/client-key", (req, res) => {
    try {
      const config = db.prepare("SELECT client_key, is_production FROM midtrans_config LIMIT 1").get() as any;
      if (config) {
        res.json({ client_key: config.client_key, is_production: config.is_production === 1 });
      } else {
        res.json({ client_key: null });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/orders/update-status", (req, res) => {
    const { order_id, transaction_status } = req.body;
    try {
      let paymentStatus = 'pending';
      if (transaction_status === 'capture' || transaction_status === 'settlement') {
          paymentStatus = 'success';
      } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
          paymentStatus = 'failed';
      } else if (transaction_status === 'pending') {
          paymentStatus = 'pending';
      }
      db.prepare("UPDATE orders SET payment_status = ? WHERE id = ?").run(paymentStatus, order_id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Midtrans Notification URL (Webhook)
  app.post("/api/webhook/midtrans", (req, res) => {
    try {
      const config = db.prepare("SELECT * FROM midtrans_config LIMIT 1").get() as any;
      if (!config) {
        return res.status(400).json({ error: "Midtrans is not configured" });
      }

      const apiClient = new midtransClient.Snap({
        isProduction: config.is_production === 1,
        serverKey: config.server_key,
        clientKey: config.client_key
      });

      apiClient.transaction.notification(req.body)
        .then((statusResponse: any) => {
          let orderId = statusResponse.order_id;
          let transactionStatus = statusResponse.transaction_status;
          let fraudStatus = statusResponse.fraud_status;

          console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

          let paymentStatus = 'pending';
          if (transactionStatus == 'capture') {
              if (fraudStatus == 'challenge') {
                  paymentStatus = 'pending';
              } else if (fraudStatus == 'accept') {
                  paymentStatus = 'success';
              }
          } else if (transactionStatus == 'settlement') {
              paymentStatus = 'success';
          } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
              paymentStatus = 'failed';
          } else if (transactionStatus == 'pending') {
              paymentStatus = 'pending';
          }
          
          db.prepare("UPDATE orders SET payment_status = ? WHERE id = ?").run(paymentStatus, orderId);
          res.status(200).json({ status: "ok" });
        });
    } catch (e: any) {
      console.error("Webhook error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Customer get order
  app.get("/api/orders/:id", (req, res) => {
    try {
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id) as any;
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
      res.json({ ...order, items });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin orders
  app.get("/api/admin/orders", authenticateToken, (req, res) => {
    try {
      const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
      res.json(orders);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/admin/orders/:id/status", authenticateToken, (req, res) => {
    try {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(req.body.status, req.params.id);
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
