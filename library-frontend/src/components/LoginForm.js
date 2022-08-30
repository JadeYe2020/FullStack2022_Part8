import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { LOGIN, LOGGEDIN_USER } from "../queries";

const LoginForm = ({ show, setError, setToken, setPage, setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });
  const userResult = useQuery(LOGGEDIN_USER);

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("library-app-user-token", token);
      if (userResult.data) {
        setUser(userResult.data.me);
      }
    }
  }, [result.data, userResult.data]); // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault();

    login({ variables: { username, password } });
    setPage("authors");
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username{" "}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{" "}
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
