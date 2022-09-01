import { useState, useEffect } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { ALL_BOOKS, ALL_GENRES, GENRE_BOOKS } from "../queries";

const Books = ({ show, genrePicked, setGenrePicked }) => {
  const client = useApolloClient();

  const [booksToShow, setBooksToShow] = useState([]);
  const booksResult = useQuery(ALL_BOOKS);
  const genresResult = useQuery(ALL_GENRES);
  const genreBookResult = useQuery(GENRE_BOOKS, {
    variables: { genre: genrePicked },
  });

  useEffect(() => {
    let books = [];
    if (booksResult.data) {
      books = booksResult.data.allBooks;
      if (genrePicked) {
        if (genreBookResult.data) {
          books = genreBookResult.data.allBooks;
        }
      }
    }
    setBooksToShow(books);
  }, [booksResult.data, genreBookResult.data, genrePicked]);

  if (booksResult.loading || genresResult.loading || genreBookResult.loading) {
    return <div>loading</div>;
  }

  const genres = genresResult.data.allGenres;

  const pickGenre = (genre) => {
    client.resetStore();
    setGenrePicked(genre);
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>
      {genrePicked ? (
        <div>
          in genre <strong>{genrePicked}</strong>
        </div>
      ) : null}
      <div></div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => pickGenre("")}>show all</button>
      {genres.map((g) => (
        <button key={g} onClick={() => pickGenre(g)}>
          {g}
        </button>
      ))}
    </div>
  );
};

export default Books;
