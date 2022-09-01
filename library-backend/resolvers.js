const { UserInputError, AuthenticationError } = require("apollo-server");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const resolvers = {
  Author: {
    bookCount: (root) => books.filter((b) => b.author === root.name).length,
  },

  Query: {
    bookCount: async () => {
      const books = await Book.find({});
      return books.length;
    },
    authorCount: async () => {
      const authors = await Author.find({});
      return authors.length;
    },
    allBooks: async (root, args) => {
      let books = null;

      if (!args.author && !args.genre) {
        books = await Book.find({}).populate("author");
      } else if (args.author) {
        const authorFound = await Author.findOne({ name: args.author });
        if (authorFound) {
          if (!args.genre) {
            books = await Book.find({ author: authorFound._id }).populate(
              "author"
            );
          } else {
            books = await Book.find({
              author: authorFound._id,
              genres: args.genre,
            }).populate("author");
          }
        }
      } else {
        books = await Book.find({ genres: args.genre }).populate("author");
      }

      return books;
    },
    allAuthors: async () => {
      return Author.find({});
    },
    allGenres: async () => {
      const books = await Book.find({});
      let allGenres = [];
      books.forEach((b) => {
        b.genres.forEach((g) => {
          if (!allGenres.includes(g)) {
            allGenres.push(g);
          }
        });
      });
      return allGenres;
    },
    me: async (root, args, context) => {
      return context.currentUser;
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      let newBooksAuthor = await Author.findOne({ name: args.author });
      if (!newBooksAuthor) {
        // add a new author
        const newAuthor = new Author({ name: args.author });
        try {
          await newAuthor.save();
          // authors = authors.concat(newAuthor);
          newBooksAuthor = await Author.findOne({ name: args.author });
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
      const newBook = new Book({ ...args, author: newBooksAuthor._id });

      try {
        await newBook.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      const newBookWithAuthor = newBook.populate("author");

      pubsub.publish("BOOK_ADDED", { bookAdded: newBookWithAuthor });

      return newBookWithAuthor;
    },

    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const authorToUpdate = await Author.findOne({ name: args.name });
      if (authorToUpdate) {
        authorToUpdate.born = args.setBornTo;
        try {
          await authorToUpdate.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
        return Author.findOne({ name: args.name });
      } else {
        return null;
      }
    },

    createUser: async (root, args) => {
      const user = new User({ ...args });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
