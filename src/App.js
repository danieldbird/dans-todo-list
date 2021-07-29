import React, { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import firebase from "./Firebase";
import uniqid from "uniqid";
import ForkMeOnGithub from "fork-me-on-github";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTrash,
  faArrowUp,
  faSignOutAlt,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [activeTodos, setActiveTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const currentList = !showCompleted ? activeTodos : completedTodos;
  const currentState = !showCompleted ? setActiveTodos : setCompletedTodos;
  const currentStorage = !showCompleted ? "activeTodos" : "completedTodos";

  useEffect(() => {
    const userChanged = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => userChanged();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .onSnapshot((snapshot) => {
          setActiveTodos(snapshot.data().activeTodos);
          setCompletedTodos(snapshot.data().completedTodos);
        });
      return () => unsubscribe();
    }
  }, [user]);

  const login = () => {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };

  const logout = () => {
    firebase.auth().signOut();
    resetAllState();
  };

  const resetAllState = () => {
    setUser(null);
    setActiveTodos([]);
    setCompletedTodos([]);
    setShowCompleted(false);
  };

  const inputChange = (e) => {
    setTextInput(e.target.value);
  };

  const addTodo = (e) => {
    const id = uniqid();
    if (e.key === "Enter") {
      currentState([...currentList, { id, task: textInput }]);
      setTextInput("");
      firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          [currentStorage]: [...currentList, { id, task: textInput }],
        });
    }
  };

  const deleteTodo = (id) => {
    const newArray = currentList.filter((todo) => todo.id !== id);
    currentState(newArray);
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .update({
        [currentStorage]: newArray,
      });
  };

  const arrangeTodo = () => {
    currentList.forEach((item) => {
      delete item.chosen;
    });
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .update({
        [currentStorage]: currentList,
      });
  };

  const changeList = (todo) => {
    const originList = !showCompleted ? activeTodos : completedTodos;
    const targetList = !showCompleted ? completedTodos : activeTodos;
    const originState = !showCompleted ? setActiveTodos : setCompletedTodos;
    const targetState = !showCompleted ? setCompletedTodos : setActiveTodos;
    const originStorage = !showCompleted ? "activeTodos" : "completedTodos";
    const targetStorage = !showCompleted ? "completedTodos" : "activeTodos";
    const newOriginArray = originList.filter((x) => x.id !== todo.id);
    const newTargetArray = [
      ...targetList,
      {
        id: todo.id,
        task: todo.task,
      },
    ];
    originState(newOriginArray);
    targetState(newTargetArray);

    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .set({
        [originStorage]: newOriginArray,
        [targetStorage]: newTargetArray,
      });
  };

  const editTodo = (e, todo) => {
    const newArray = currentList.map((x) =>
      x.id === todo.id
        ? { id: x.id, task: e.target.innerText }
        : { id: x.id, task: x.task }
    );
    currentState(newArray);
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .update({
        [currentStorage]: newArray,
      });
  };

  return (
    <div className="container">
      <ForkMeOnGithub
        repo="https://github.com/danieldbird/dans-todo-list.git"
        text="View source on GitHub"
        colorBackground="#705194"
        side="left"
      />
      <div className="top">
        <header className="header">
          {user ? (
            <>
              <button className="logout-btn" onClick={logout}>
                Logout <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </>
          ) : (
            <>
              <button className="login-btn" onClick={login}>
                Login <FontAwesomeIcon icon={faSignInAlt} />
              </button>
            </>
          )}
        </header>
        <h1>Dan's Todo List App</h1>
        {user ? (
          <>
            <input
              type="text"
              name="new-todo"
              className="new-todo-input"
              placeholder="Enter a task..."
              onChange={inputChange}
              onKeyUp={addTodo}
              value={textInput}
              autoFocus
            />
            <ReactSortable
              list={currentList}
              setList={currentState}
              onEnd={arrangeTodo}
              className="todo-list"
            >
              {currentList.map((todo) => (
                <div className="todo-item-wrapper" key={todo.id}>
                  <button
                    className="todo-toggle-btn"
                    onClick={() => {
                      changeList(todo);
                    }}
                    onTouchStart={() => {
                      changeList(todo);
                    }}
                  >
                    {showCompleted ? (
                      <FontAwesomeIcon icon={faArrowUp} />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} />
                    )}
                  </button>
                  <span
                    className="todo-item"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    style={
                      showCompleted ? { textDecoration: "line-through" } : {}
                    }
                    onBlur={(e) => {
                      editTodo(e, todo);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.target.blur();
                      }
                    }}
                  >
                    {todo.task}
                  </span>
                  <button
                    className="todo-delete-btn"
                    onClick={() => {
                      deleteTodo(todo.id);
                    }}
                    onTouchStart={() => {
                      deleteTodo(todo.id);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </ReactSortable>
          </>
        ) : null}
      </div>
      <div className="bottom">
        <span className="todo-count">Todos: {currentList.length}</span>
        <button
          className="show-completed-toggle-btn"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? "Show Active" : "Show Completed"}
        </button>
      </div>
    </div>
  );
}

export default App;
