import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Select from "react-select";
import { ALL_AUTHORS, UPDATE_AUTHOR_BORN } from "../queries";

const AuthorForm = (props) => {
  return (
    <div>
      <h3>Set Birthyear</h3>
      <form onSubmit={props.handleUpdate}>
        <Select
          value={props.selectedOption}
          onChange={props.setSelectedOption}
          options={props.options}
        />
        <div>
          born
          <input
            value={props.born}
            onChange={({ target }) => props.setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

const Authors = (props) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [born, setBorn] = useState("");

  const [updateAuthorBorn] = useMutation(UPDATE_AUTHOR_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });
  const result = useQuery(ALL_AUTHORS);

  if (result.loading) {
    return <div>loading</div>;
  }
  const authors = result.data.allAuthors;

  // for react-select
  const options = authors.map((a) => {
    return { value: a.name, label: a.name };
  });

  if (!props.show) {
    return null;
  }

  const handleUpdate = (e) => {
    e.preventDefault();

    updateAuthorBorn({
      variables: { name: selectedOption.value, setBornTo: Number(born) },
    });
    setSelectedOption(null);
    setBorn("");
  };

  const propsOfAuthorForm = {
    handleUpdate,
    born,
    setBorn,
    options,
    selectedOption,
    setSelectedOption,
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AuthorForm {...propsOfAuthorForm} />
    </div>
  );
};

export default Authors;
