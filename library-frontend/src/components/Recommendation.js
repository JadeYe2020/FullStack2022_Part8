import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GENRE_BOOKS } from "../queries";

const Recommendation = (props) => {
  const [genre, setGenre] = useState(null);
  const [booksToShow, setBooksToShow] = useState([]);
  const genreBookResult = useQuery(GENRE_BOOKS, { variables: { genre } });

  useEffect(() => {
    if (props.user) {
      setGenre(props.user.favouriteGenre);

      if (genreBookResult.data) {
        setBooksToShow(genreBookResult.data.allBooks);
      }
    }
  }, [props.user, genreBookResult.data]);

  if (genreBookResult.loading) {
    return <div>loading</div>;
  }

  if (!props.show || !props.user) {
    return null;
  }

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre <strong>{genre}</strong>
      </div>
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
    </div>
  );
};

export default Recommendation;
