const express = require("express");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

// Initialize the SQLite database
const db = new sqlite3.Database("data/database.db");

const createTablesQueries = [
  "CREATE TABLE IF NOT EXISTS users ( UserID INTEGER PRIMARY KEY AUTOINCREMENT,FirstName TEXT, LastName TEXT,Email TEXT,  Password TEXT);",
  "CREATE TABLE IF NOT EXISTS products (ProductID INTEGER PRIMARY KEY AUTOINCREMENT, ProductName TEXT, Price REAL, Category TEXT, StoreID INTEGER, ListID INTEGER, FOREIGN KEY(StoreID) REFERENCES stores(StoreID), FOREIGN KEY(ListID) REFERENCES lists(ListID));",
  "CREATE TABLE IF NOT EXISTS stores (StoreID INTEGER PRIMARY KEY AUTOINCREMENT, StoreName TEXT, Location TEXT);",
  "CREATE TABLE IF NOT EXISTS lists (ListID INTEGER PRIMARY KEY AUTOINCREMENT, UserID INTEGER, ListName TEXT, FOREIGN KEY(UserID) REFERENCES users(UserID));",
];

createTablesQueries.forEach((query) => {
  db.run(query, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("Table created successfully");
    }
  });
});

app.use(express.json());
app.use(cors());

const jsonData = require("./data/supermarkets.json");

app.post("/lists", (req, res) => {
  const { name, items, userId } = req.body;

  // Begin transaction for atomicity
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Insert the new list into the 'lists' table with references to user
    db.run(
      "INSERT INTO lists (UserID, ListName) VALUES (?, ?)",
      [userId, name],
      function (err) {
        if (err) {
          console.error(err);
          db.run("ROLLBACK");
          return res.status(500).json({ error: "Failed to create list" });
        }

        const listId = this.lastID;

        // Iterate through each item and insert into the 'stores' table
        items.forEach((item, index) => {
          db.run(
            "INSERT INTO stores (StoreName, Location) VALUES (?, ?)",
            [item.store, item.location],
            function (err) {
              if (err) {
                console.error(err);
                db.run("ROLLBACK");
                return res
                  .status(500)
                  .json({ error: "Failed to create store" });
              }

              const storeId = this.lastID;

              // Insert into the 'products' table with a reference to the store
              db.run(
                "INSERT INTO products (ProductName, Price, Category, StoreID, ListID) VALUES (?, ?, ?, ?, ?)",
                [item.name, item.price, item.description, storeId, listId],
                function (err) {
                  if (err) {
                    console.error(err);
                    db.run("ROLLBACK");
                    return res
                      .status(500)
                      .json({ error: "Failed to create product" });
                  }
                  // If this is the last item, commit the transaction and respond with success
                  if (index === items.length - 1) {
                    db.run("COMMIT", (err) => {
                      if (err) {
                        console.error(err);
                        return res
                          .status(500)
                          .json({ error: "Failed to commit transaction" });
                      }

                      res.status(201).json({
                        listId,
                        userId: "0",
                        productId: this.lastID,
                        quantity: items.length,
                      });
                    });
                  }
                }
              );
            }
          );
        });
      }
    );
  });
});

app.get("/lists", (req, res) => {
  const query = `SELECT * FROM lists`;

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve lists" });
    }
    res.json(rows);
  });
});

app.get("/lists/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM lists WHERE UserID = ?", [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve lists" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Lists not found" });
    }
    res.json(rows);
  });
});

app.put("/lists/:id", (req, res) => {
  const { id } = req.params;
  const { userId, productId, quantity } = req.body;
  db.run(
    "UPDATE lists SET UserID = ?, ProductID = ?, Quantity = ? WHERE ListID = ?",
    [userId, productId, quantity, id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update list" });
      }
      res.json({ id: Number(id), userId, productId, quantity });
    }
  );
});

app.delete("/lists/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM lists WHERE ListID = ?", [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete list" });
    }
    res.json({ id: Number(id) });
  });
});

// Define the endpoint to create a new product for a specific ListID
app.post("/products/:id", async (req, res) => {
  const listID = req.params.id;
  const { productName, price, category, storeName } = req.body;

  // Validate the incoming data
  if (!productName || !price || !category || !storeName) {
    res.status(400).json({ error: "Product information is incomplete" });
    return;
  }

  try {
    let storesID;

    // Insert the new store into the stores table
    const storeQuery = "INSERT INTO stores (StoreName, Location) VALUES (?, ?)";
    const storeValues = [storeName, "Some Location"];

    await db.run(storeQuery, storeValues, function (err) {
      if (err) {
        throw err;
      }
      storesID = this.lastID;
      console.log("storesID:", storesID);

      // Insert the new product into the products table
      const productQuery =
        "INSERT INTO products (ProductName, Price, Category, ListID, StoreID) VALUES (?, ?, ?, ?, ?)";
      const productValues = [productName, price, category, listID, storesID];

      db.run(productQuery, productValues, function (err) {
        if (err) {
          throw err;
        }

        // Return the details of the newly created product
        const productID = this.lastID;
        console.log("productID:", productID);

        res.json({
          productID,
          productName,
          price,
          category,
          listID,
          storesID,
        });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Define the endpoint to get products based on ListID
app.get("/products/:id", (req, res) => {
  const id = req.params.id;

  // Query the database to get products for the specified ListID
  db.all("SELECT * FROM products WHERE ListID = ?", [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

app.get("/api/data", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(jsonData);
});

app.get("/api/image", async (req, res) => {
  const query = "people";
  client.photos
    .search({ query, per_page: 1 })
    .then((photos) => res.send(photos));
});

// Create a new user
app.post("/users", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to hash password" });
    }

    // Insert the new user with the hashed password
    db.run(
      "INSERT INTO users (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to create user" });
        }
        res.status(201).json({ id: this.lastID, firstName, lastName, email });
      }
    );
  });
});

// Get all users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve users" });
    }
    res.json(rows);
  });
});

// Get a user by ID
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve user" });
    }
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(row);
  });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // app.post("/login", (req, res) => {
  //   const { email, password } = req.body;
  //   console.log("Received login request:", { email, password });

  //   // ... rest of the code
  // });

  // Check if the user exists
  db.get("SELECT * FROM users WHERE Email = ?", [email], (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if the password is correct
    bcrypt.compare(password, user.Password, (bcryptErr, passwordMatch) => {
      if (bcryptErr) {
        console.error("Bcrypt error:", bcryptErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        userId: JSON.stringify(user.UserID),
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
      });
    });
  });
});

// Update user information
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;

  // Update the user information in the database
  db.run(
    "UPDATE users SET FirstName = ?, LastName = ?, Email = ? WHERE UserID = ?",
    [firstName, lastName, email, id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update user" });
      }

      // Fetch and return the updated user information
      db.get("SELECT * FROM users WHERE UserID = ?", [id], (err, user) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Failed to retrieve updated user" });
        }

        res.json({ success: true });
      });
    }
  );
});

app.get("/combinedData/:id", (req, res) => {
  const listID = req.params.id;

  // Query the database to get combined data for the specified ListID
  db.all(
    `
    SELECT p.ProductID, p.ProductName, p.Price, p.Category, s.StoreID, s.StoreName, s.Location
    FROM products p
    JOIN stores s ON p.StoreID = s.StoreID
    WHERE p.ListID = ?
    `,
    [listID],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json(rows);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
