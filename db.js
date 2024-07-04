//Database
import pg from 'pg';
import dotenv from 'dotenv';
import chalk from 'chalk';

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/Block37');

dotenv.config();

const createTables = async () => {
  try {
    await client.connect();
    const SQL = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    DROP TABLE IF EXISTS Order_Products;
    DROP TABLE IF EXISTS Reviews;
    DROP TABLE IF EXISTS Cart;
    DROP TABLE IF EXISTS Products;
    DROP TABLE IF EXISTS Orders;
    DROP TABLE IF EXISTS Users;

    CREATE TABLE Users(
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Username VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Wishlist VARCHAR(255) NOT NULL,
    isAdmin Boolean
    );

    CREATE TABLE Products(
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Category TEXT, 
    Price NUMERIC (10, 2) NOT NULL,
    Availability Boolean NOT NULL,
    Inventory INT NOT NULL,
    Details TEXT
    );

    CREATE TABLE Cart(
    UserID UUID,
    ProductID INT,
    Quantity INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(ID),
    FOREIGN KEY (ProductID) REFERENCES Products(ID),
    PRIMARY KEY (UserID, ProductID)
    );

    CREATE TABLE Orders(
    ID SERIAL PRIMARY KEY,
    UserID UUID,
    Order_Time TIMESTAMP DEFAULT NOW(),
    Order_Total NUMERIC (10, 2) NOT NULL,
    Status TEXT,
    FOREIGN KEY (UserID) REFERENCES Users(ID)
    );

    CREATE TABLE Order_Products(
    Order_ID INT,
    Product_ID INT,
    Quantity INT NOT NULL,
    Unit_Price NUMERIC (10, 2) NOT NULL,
    FOREIGN KEY (Order_ID) REFERENCES Orders(ID),
    FOREIGN KEY (Product_ID) REFERENCES Products(ID),
    PRIMARY KEY (Order_ID, Product_ID)
    );

    CREATE TABLE Reviews (
    ID SERIAL PRIMARY KEY,
    UserID UUID,
    ProductID INT, 
    Rate INT NOT NULL,
    Comment TEXT,
    FOREIGN KEY (UserID) REFERENCES Users(ID),
    FOREIGN KEY (ProductID) REFERENCES Products(ID)
    );
    `;

    await client.query(SQL);
    console.log(chalk.green('Database has been succesfully created!'));
  } catch (error) {
    console.log(chalk.red('Failed to create DB?!', error));
  }
};

const createUsers = async () => {
  //create users
  try {
    //try block
    await client.connect(); //connect to database
    const SQL = ` 
    INSERT INTO Users (Username, Password, Address, Wishlist, isAdmin)
    VALUES ('admin', 'admin', 'admin', 'admin', true);
    `; //SQL query
    await client.query(SQL); //execute SQL
    console.log(chalk.green('User has been succesfully created!'));
  } catch (error) {
    //if error occurs
    console.log(chalk.red('Failed to create User!', error));
  } finally {
    //finally block
    await client.end(); //disconnect client
    console.log(chalk.blue('Client has been disconnected!'));
  }
};

const createProducts = async () => {
  const SQL = `
  INSERT INTO Products(Name, Category, Price, Availability, Inventory, Details)
  VALUES 
  ('Apple', 'fruit', 4.99, true, 10, 'Pretty Sweet'),
  ('iPhone', 'electronic', 1099, true, 5, 'Brand New'),
  ('Tomato', 'vegetable', 0.99, true, 15, 'Very Nice'),
  ('Chair', 'furniture', 97, true, 3, 'Open-boxed'),
  ('Coke', 'drink', 1.99, true, 25, 'Heavy weight')
  RETURNING *
  `;
  try {
    const response = await client.query(SQL);
    return response.rows;
  } catch (err) {
    console.log('created Pruducts table error: ', err);
  }
};

const createCart = async (UserID, ProductID, Quantity) => {
  //create cart
  let client; //define client
  try {
    client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/Block37'); //create new client

    await client.connect(); //connect to database

    const SQL = `
    INSERT INTO Cart (UserID, ProductID, Quantity)
    VALUES ('${UserID}', '${ProductID}', '${Quantity}');
    `; //SQL query
    await client.query(SQL); //execute SQL
    console.log(chalk.green('Cart has been succesfully created!'));
  } catch (error) {
    //if error occurs
    console.log(chalk.red('Failed to create Cart!', error));
  } finally {
    //finally block
    if (client) {
      //if client is defined
      await client.end();
      console.log(chalk.blue('Client has been disconnected!'));
    }
  }
};

const createOrders = async (userId, orderTotal) => {
  const SQL = `
  INSERT INTO Orders(User_ID, Order_Total)
  VALUES('${userId}','${orderTotal}')
  RETURNIN *
  `;
  try {
    const response = await client.query(SQL);
    return response.rows;
  } catch (err) {
    console.log('created Orders table error: ', err);
  }
};

const createOrder_Products = async (orderID, productID, quantity, unitPrice) => {
  let client; //define client

  try {
    client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/Block37'); //create new client

    await client.connect(); //connect to database

    const SQL = `
    INSERT INTO Order_Products (Order_ID, Product_ID, Quantity, Unit_Price)
    VALUES ('${orderID}', '${productID}', '${quantity}', '${unitPrice}');
    `; //SQL query
    await client.query(SQL); //execute SQL
    console.log(chalk.green('Order_Products has been succesfully created!'));
  } catch (error) {
    //if error occurs
    console.log(chalk.red('Failed to create Order_Products!', error));
  } finally {
    //finally block
    if (client) {
      //if client is defined
      await client.end();
      console.log(chalk.blue('Client has been disconnected!'));
    }
  }
};

const createReviews = async (userID, productId, rate, comment) => {
  const SQL = `
  INSERT INTO Reviews(User_ID, Product_ID, Rate, Comment)
  VALUES ('${userID}', '${productId}', '${rate}', '${comment}')
  RETURNIN *
  `;
  try {
    const response = await client.query(SQL);
    return response.rows;
  } catch (err) {
    console.log('created Reviews table error: ', err);
  }
};

export { client, createTables, createUsers, createProducts, createCart, createOrders, createOrder_Products, createReviews };
