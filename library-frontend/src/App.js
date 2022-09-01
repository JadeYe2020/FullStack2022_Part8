import { useState } from "react";
import { useApolloClient, useSubscription } from "@apollo/client";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommendation from "./components/Recommendation";

import { BOOK_ADDED } from "./queries";

const App = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("authors");
  const [genrePicked, setGenrePicked] = useState("");

  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      window.alert(`${addedBook.title} added`);
    },
  });

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
    client.resetStore();
    setPage("authors");
  };

  return (
    <div>
      {token ? (
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("add")}>add book</button>
          <button onClick={() => setPage("recommend")}>recommend</button>

          <button onClick={logout}>logout</button>
        </div>
      ) : (
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>
      )}

      <Authors show={page === "authors"} />

      <Books
        show={page === "books"}
        genrePicked={genrePicked}
        setGenrePicked={setGenrePicked}
      />

      <NewBook
        show={page === "add"}
        setPage={setPage}
        setGenrePicked={setGenrePicked}
      />

      <LoginForm
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
        setUser={setUser}
      />

      <Recommendation show={page === "recommend"} user={user} />
    </div>
  );
};

export default App;
