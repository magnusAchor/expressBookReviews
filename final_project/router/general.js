const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }
  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', async (req, res) => {
  try {
    const response = await new Promise(resolve => resolve({ data: books }));
    return res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await new Promise(resolve => resolve(books[isbn]));
    if (book) {
      return res.send(JSON.stringify(book, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book" });
  }
});

public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const matchingBooks = await new Promise(resolve => {
      resolve(Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase()));
    });
    if (matchingBooks.length > 0) {
      return res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const matchingBooks = await new Promise(resolve => {
      resolve(Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase()));
    });
    if (matchingBooks.length > 0) {
      return res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/review/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await new Promise(resolve => resolve(books[isbn]));
    if (book && book.reviews) {
      return res.send(JSON.stringify(book.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching reviews" });
  }
});

module.exports.general = public_users;