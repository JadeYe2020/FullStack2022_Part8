import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ALL_GENRES } from "../queries";

const Books = (props) => {
  const [genre, setGenre] = useState(null);
  const [booksToShow, setBooksToShow] = useState([]);
  const booksResult = useQuery(ALL_BOOKS);
  const genresResult = useQuery(ALL_GENRES);

  useEffect(() => {
    let books = [];
    if (booksResult.data) {
      books = booksResult.data.allBooks;
      if (genre) {
        books = books.filter((b) => {
          console.log("each book", b);
          return b.genres.includes(genre);
        });
      }
    }
    setBooksToShow(books);
  }, [booksResult.data, genre]);

  if (booksResult.loading || genresResult.loading) {
    return <div>loading</div>;
  }

  const genres = genresResult.data.allGenres;

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>
      {genre ? (
        <div>
          in genre <strong>{genre}</strong>
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
      {genres.map((g) => (
        <button key={g} onClick={() => setGenre(g)}>
          {g}
        </button>
      ))}
    </div>
  );
};

export default Books;
