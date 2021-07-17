import "./App.css";
import { useState, useEffect } from "react";
import uniqid from "uniqid";
import { ReactSortable } from "react-sortablejs";
import ForkMeOnGithub from "fork-me-on-github";

function App() {
  // set initial states
  const [textInput, setTextInput] = useState("");
  const [todos, setTodos] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedTodos, setCompletedTodos] = useState([
    { id: 122, task: "completed todo" },
  ]);

  // check if there are todos in localStorage
  useEffect(() => {
    if (localStorage.getItem("todos") !== null) {
      setTodos(JSON.parse(localStorage.getItem("todos")));
    }
  }, []);

  //detect enter key
  const handleNewTodoChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleNewTodoEnter = (e) => {
    const id = uniqid();
    if (e.key === "Enter") {
      setTodos([...todos, { id, task: textInput }]);
      localStorage.setItem(
        "todos",
        JSON.stringify([...todos, { id, task: textInput }])
      );
      setTextInput("");
    }
  };

  const handleDeleteTodo = (id) => {
    const newArray = todos.filter((todo) => todo.id !== id);
    setTodos(newArray);
    localStorage.setItem("todos", JSON.stringify(newArray));
  };

  const handleEditTodo = (e, todo) => {
    const newArray = todos.map((x) =>
      x.id === todo.id ? { ...x, task: e.target.value } : { ...x }
    );
    setTodos(newArray);
    localStorage.setItem("todos", JSON.stringify(newArray));
  };

  const handleCompletedTodo = (e, todo) => {
    // const newArray = todos.map((x) =>
    //   x.id === todo.id ? { ...x, task: e.target.value } : { ...x }
    // );
    // setTodos(newArray);
    // localStorage.setItem("todos", JSON.stringify(newArray));
  };

  return (
    <div className="container">
      <div className="app">
        <h1 className="app-title">Dan's Todo List App</h1>
        <input
          type="text"
          name="new-todo"
          className="new-todo-input"
          placeholder="Enter a task..."
          onChange={handleNewTodoChange}
          onKeyUp={handleNewTodoEnter}
          value={textInput}
          autoFocus
        />
        <ReactSortable
          list={todos}
          setList={setTodos}
          onEnd={() => {
            localStorage.setItem("todos", JSON.stringify(todos));
          }}
          animation={0}
          className="todo-list"
          ghostClass="ghost"
        >
          {!showCompleted
            ? todos.map((todo) => (
                <div key={todo.id} className="todo-list-item" focus="true">
                  <span
                    onClick={(e) => {
                      handleCompletedTodo(e, todo);
                    }}
                    className="completed-btn"
                  >
                    ✓
                  </span>
                  <input
                    type="text"
                    defaultValue={todo.task}
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
                    &times;
                  </span>
                </div>
              ))
            : completedTodos.map((todo) => (
                <div key={todo.id} className="todo-list-item" focus="true">
                  <span
                    onClick={(e) => {
                      handleCompletedTodo(e, todo);
                    }}
                    className="completed-btn"
                  >
                    ✓
                  </span>
                  <input
                    type="text"
                    defaultValue={todo.task}
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
                    &times;
                  </span>
                </div>
              ))}
        </ReactSortable>
      </div>
      <div className="bottom-panel">
        <div className="stats">
          <span>
            Todos: {!showCompleted ? todos.length : completedTodos.length}
          </span>
        </div>
        <button
          onClick={() => {
            setShowCompleted(!showCompleted);
          }}
        >
          {showCompleted ? "Show Active" : "Show Completed"}
        </button>
        <button
          className="clear-storage-btn"
          onClick={() => {
            localStorage.clear();
            setTodos([]);
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
