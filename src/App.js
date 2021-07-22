import "./App.css";
import { useState, useEffect } from "react";
import firebase from "./Firebase";
import uniqid from "uniqid";
import { ReactSortable } from "react-sortablejs";
import ForkMeOnGithub from "fork-me-on-github";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrash, faArrowUp } from "@fortawesome/free-solid-svg-icons";

function App() {
  // set initial states
  const [textInput, setTextInput] = useState("");
  const [activeTodos, setActiveTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const activeList = !showCompleted ? activeTodos : completedTodos;
  const activeState = !showCompleted ? setActiveTodos : setCompletedTodos;
  const activeStorage = !showCompleted ? "activeTodos" : "completedTodos";

  // check if there are todos in localStorage
  useEffect(() => {
    if (localStorage.getItem("activeTodos") !== null) {
      setActiveTodos(JSON.parse(localStorage.getItem("activeTodos")));
    }
    if (localStorage.getItem("completedTodos") !== null) {
      setCompletedTodos(JSON.parse(localStorage.getItem("completedTodos")));
    }
  }, []);

  // handle the text input changes
  const handleNewTodoInputChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleNewTodoEnter = (e) => {
    const id = uniqid();
    if (e.key === "Enter") {
      activeState([...activeList, { id, task: textInput }]);
      localStorage.setItem(
        activeStorage,
        JSON.stringify([...activeList, { id, task: textInput }])
      );
      setTextInput("");
    }
  };

  const handleDeleteTodo = (id) => {
    const newArray = activeList.filter((todo) => todo.id !== id);
    activeState(newArray);
    localStorage.setItem(activeStorage, JSON.stringify(newArray));
  };

  const handleEditTodo = (e, todo) => {
    const newArray = activeList.map((x) =>
      x.id === todo.id ? { ...x, task: e.target.value } : { ...x }
    );
    activeState(newArray);
    localStorage.setItem(activeStorage, JSON.stringify(newArray));
  };

  const handleToggleTodo = (todo) => {
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
    localStorage.setItem(originStorage, JSON.stringify(newOriginArray));

    targetState(newTargetArray);
    localStorage.setItem(targetStorage, JSON.stringify(newTargetArray));
  };

  function saveToFirebaseFirestore(id, activeTodos, completedTodos) {
    firebase.firestore().collection("users").doc(id).set({
      activeTodos,
      completedTodos,
    });
    console.log(id, activeTodos, completedTodos);
  }

  const loginWithGoogle = () => {
    firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => {
        setUser(firebase.auth().currentUser);
        saveToFirebaseFirestore(
          firebase.auth().currentUser.uid,
          activeTodos,
          completedTodos
        );
      })
      .catch((error) => {
        console.error("Google login failed: " + error);
      });
  };

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  });

  return (
    <div className="container">
      <div className="app">
        {user === null ? (
          <button onClick={loginWithGoogle}>Login with Google</button>
        ) : (
          <button
            onClick={() => {
              firebase.auth().signOut();
            }}
          >
            Logout
          </button>
        )}

        <h1 className="app-title">Dan's Todo List App</h1>
        <input
          type="text"
          name="new-todo"
          className="new-todo-input"
          placeholder="Enter a task..."
          onChange={handleNewTodoInputChange}
          onKeyUp={handleNewTodoEnter}
          value={textInput}
          autoFocus
        />
        <ReactSortable
          list={activeList}
          setList={activeState}
          onEnd={() => {
            localStorage.setItem(activeStorage, JSON.stringify(activeList));
          }}
          animation={0}
          className="todo-list"
          ghostClass="ghost"
        >
          {activeList.map((todo) => (
            <div key={todo.id} className="todo-list-item" focus="true">
              <span
                onClick={() => {
                  handleToggleTodo(todo);
                }}
                className={!showCompleted ? "complete-btn" : "restore-btn"}
              >
                {!showCompleted ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <FontAwesomeIcon icon={faArrowUp} />
                )}
              </span>
              <input
                type="text"
                defaultValue={todo.task}
                style={showCompleted ? { textDecoration: "line-through" } : {}}
                className="tasks"
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                onBlur={(e) => {
                  handleEditTodo(e, todo);
                }}
              />
              <span
                onClick={() => {
                  handleDeleteTodo(todo.id);
                }}
                className="delete-btn"
              >
                <FontAwesomeIcon icon={faTrash} />
              </span>
            </div>
          ))}
        </ReactSortable>
      </div>
      <div className="bottom-panel">
        <div className="stats">
          <span>
            Todos:
            {" " + activeList.length}
          </span>
          <br />
          <span>
            Storage:
            {user ? " Firebase" : " LocalStorage"}
          </span>
        </div>
        <button
          className="show-completed-btn"
          onClick={() => {
            setShowCompleted(!showCompleted);
          }}
          style={
            showCompleted
              ? { background: "rgb(53, 185, 97)" }
              : { background: "rgb(255, 217, 0)" }
          }
        >
          {showCompleted ? "Show Active" : "Show Completed"}
        </button>
        <button
          className="clear-storage-btn"
          onClick={() => {
            localStorage.clear();
            setActiveTodos([]);
            setCompletedTodos([]);
          }}
        >
          Clear Storage
        </button>
      </div>
      <ForkMeOnGithub
        repo="https://github.com/danieldbird/dans-todo-list.git"
        text="View source on GitHub"
        colorBackground="#705194"
      />
    </div>
  );
}

export default App;
