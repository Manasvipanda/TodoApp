# TodoApp Project - Interview Explanation Guide

## 📋 Project Overview

This is a **full-stack Todo Application** with a **Spring Boot backend** and **React frontend**. It's a task management application that allows users to create, read, update, and delete (CRUD) tasks with features like task completion tracking, dark mode, and a multi-view sidebar.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19)                      │
│                   Port: http://localhost:5173                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   App.jsx   │  │  Dashboard  │  │  Settings   │             │
│  └──────┬──────┘  └─────────────┘  └─────────────┘             │
└─────────┼───────────────────────────────────────────────────────┘
          │ HTTP (REST API)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Spring Boot 3.5.8)               │
│                   Port: http://localhost:8081                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Controller  │─▶│  Service    │─▶│ Repository  │             │
│  │(TaskController)│ (TaskService)│ (TaskRepository)│          │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                           │
│                  Database: todo_db                              │
│                  Port: 3306                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tools & Technologies Used

### Backend Technologies:

| Tool/Technology | Version | Purpose |
|-----------------|---------|---------|
| **Spring Boot** | 3.5.8 | Main framework for building REST API |
| **Java** | 17 | Programming language |
| **Spring Data JPA** | - | ORM (Object-Relational Mapping) for database operations |
| **Hibernate** | - | JPA implementation for database management |
| **MySQL** | - | Relational database |
| **Lombok** | - | Reduces boilerplate code (getters, setters, constructors) |
| **Maven** | - | Build tool and dependency management |
| **Validation** | - | Input validation for API requests |

### Frontend Technologies:

| Tool/Technology | Version | Purpose |
|-----------------|---------|---------|
| **React** | 19.2.0 | UI library for building user interface |
| **Vite** | 7.2.4 | Fast build tool and development server |
| **ESLint** | 9.39.1 | Code linting |
| **JavaScript** | ES6+ | Programming language |

---

## 📁 Project Structure

### Backend Structure (todoApp):

```
todoApp/
├── pom.xml                    # Maven configuration (dependencies)
├── src/main/
│   ├── java/com/Manasvi/todoApp/
│   │   ├── TodoAppApplication.java        # Main Spring Boot entry point
│   │   ├── Controller/
│   │   │   └── TaskController.java         # REST API endpoints
│   │   ├── Service/
│   │   │   └── TaskService.java            # Business logic
│   │   ├── Entity/
│   │   │   └── Task.java                   # Database entity model
│   │   └── Repository/
│   │       └── TaskRepository.java         # JPA Repository interface
│   └── resources/
│       └── application.properties          # Database & server config
```

### Frontend Structure (todo-react):

```
todo-frontend/todo-react/
├── package.json              # npm dependencies
├── vite.config.js            # Vite configuration
├── index.html                # Entry HTML file
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Main component with all views
    ├── App.css               # Styles
    └── index.css             # Global styles
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/tasks` | Fetch all tasks |
| **POST** | `/api/tasks` | Create a new task |
| **PUT** | `/api/tasks/{id}` | Update an existing task |
| **DELETE** | `/api/tasks/{id}` | Delete a task |
| **GET** | `/api/tasks/test` | Test endpoint |

---

## 💻 Key Code Components

### 1. Task Entity (Backend)

```
java
package com.Manasvi.todoApp.entity;

import jakarta.persistence.*;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private boolean completed;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
```

**Explanation:**
- `@Entity` - Marks this class as a JPA entity for database mapping
- `@Id` - Specifies the primary key
- `@GeneratedValue` - Auto-increments the ID
- Uses Jakarta Persistence (replaced javax in Spring Boot 3.x)

---

### 2. Task Repository

```
java
package com.Manasvi.todoApp.repository;

import com.Manasvi.todoApp.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
```

**Explanation:**
- Extends `JpaRepository` which provides built-in CRUD methods
- `JpaRepository<Task, Long>` - Entity type is Task, Primary key is Long
- Methods available: findAll(), findById(), save(), delete(), etc.

---

### 3. Task Service (Business Logic)

```
java
package com.Manasvi.todoApp.service;

import com.Manasvi.todoApp.entity.Task;
import com.Manasvi.todoApp.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // Create task
    @Transactional
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    // Get all tasks
    @Transactional(readOnly = true)
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Update task
    @Transactional
    public Task updateTask(Long id, Task updatedTask) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setCompleted(updatedTask.isCompleted());

        return taskRepository.save(existingTask);
    }

    // Delete task
    @Transactional
    public void deleteTask(Long id) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        taskRepository.delete(existingTask);
    }
}
```

**Explanation:**
- `@Service` - Marks this as a Spring service component
- `@Transactional` - Ensures database operations are atomic
- Constructor injection for dependency management
- `readOnly = true` - Optimizes for read operations

---

### 4. Task Controller (REST API)

```
java
package com.Manasvi.todoApp.controller;

import com.Manasvi.todoApp.entity.Task;
import com.Manasvi.todoApp.service.TaskService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Create task
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    // Get all tasks
    @GetMapping
    public List<Task> getTasks() {
        System.out.println("Getting all tasks");
        List<Task> tasks = taskService.getAllTasks();
        System.out.println("Found " + tasks.size() + " tasks");
        return tasks;
    }

    @GetMapping("/test")
    public String test() {
        return "test";
    }

    // Update task
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        return taskService.updateTask(id, task);
    }

    // Delete task
    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return "Task deleted successfully!";
    }
}
```

**Explanation:**
- `@RestController` - Combines @Controller and @ResponseBody
- `@RequestMapping("/api/tasks")` - Base URL for all endpoints
- `@CrossOrigin` - Enables CORS for frontend communication
- `@PostMapping`, `@GetMapping`, `@PutMapping`, `@DeleteMapping` - HTTP method mappings
- `@RequestBody` - Converts JSON to Java object
- `@PathVariable` - Extracts URL path variables

---

### 5. React Frontend (App.jsx) - Key Features

```
jsx
function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('tasks');

  // Fetch tasks from API
  const fetchTasks = () => {
    fetch("http://localhost:8081/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  };

  // Add new task
  const handleAddTask = () => {
    fetch("http://localhost:8081/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle, completed: false }),
    }).then(() => fetchTasks());
  };

  // Toggle task completion
  const handleToggleTask = (task) => {
    fetch(`http://localhost:8081/api/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...task, completed: !task.completed }),
    }).then(() => fetchTasks());
  };

  // Delete task
  const handleDeleteTask = (id) => {
    fetch(`http://localhost:8081/api/tasks/${id}`, { method: "DELETE" })
      .then(() => fetchTasks());
  };
}
```

**Explanation:**
- Uses **React Hooks** (`useState`, `useEffect`)
- `useState` - Manages component state
- `useEffect` - Performs side effects (fetching data on mount)
- Fetch API - Makes HTTP requests to backend
- State management for tasks, dark mode, and navigation

---

## 🗄️ Database Configuration

```
properties
# Server Port
server.port=8081

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/todo_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root123

# JPA & Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

**Explanation:**
- `ddl-auto=update` - Automatically creates/updates database schema
- `show-sql=true` - Logs SQL queries in console
- `createDatabaseIfNotExist=true` - Creates database if not exists

---

## ✨ Features Implemented

1. **Task Management** - Create, Read, Update, Delete tasks
2. **Completion Tracking** - Mark tasks as complete/incomplete
3. **Dark Mode** - Toggle between light and dark themes
4. **Multi-View Navigation** - Sidebar with Dashboard, Settings, Profile, Help
5. **Responsive Design** - Modern UI with CSS animations
6. **REST API** - Clean API design with CORS enabled

---

## 🚀 How to Run the Project

### Backend:
```
bash
cd todoApp
./mvnw spring-boot:run
# OR
mvnw.cmd spring-boot:run
```

### Frontend:
```
bash
cd todo-frontend/todo-react
npm install
npm run dev
```

---

## 🔗 API Communication Flow

```
1. User clicks "Add Task" in React
   ↓
2. React sends POST request to http://localhost:8081/api/tasks
   ↓
3. Spring Boot Controller receives request (@PostMapping)
   ↓
4. Controller calls TaskService.createTask()
   ↓
5. Service calls TaskRepository.save()
   ↓
6. JPA/Hibernate saves to MySQL database
   ↓
7. Response flows back: Repository → Service → Controller → React
   ↓
8. React updates state and re-renders UI
```

---

## 🎯 Key Interview Points

### What to highlight:
- ✅ **Full-stack development** - Both frontend and backend
- ✅ **RESTful API design** - Proper HTTP methods and status codes
- ✅ **Clean architecture** - Controller → Service → Repository pattern
- ✅ **Spring Boot expertise** - Annotations, dependency injection, JPA
- ✅ **React proficiency** - Hooks, state management, effects
- ✅ **Database integration** - MySQL, JPA/Hibernate
- ✅ **CORS handling** - Cross-origin requests
- ✅ **Modern tools** - Vite, Maven, npm

### Common interview questions and answers:

**Q: Why did you choose Spring Boot?**
A: Spring Boot provides auto-configuration, embedded servers, and rapid development capabilities. It's industry-standard for enterprise Java applications.

**Q: Why React for frontend?**
A: React offers component-based architecture, virtual DOM for performance, and strong ecosystem support. Version 19 brings modern features.

**Q: How does JPA/Hibernate work?**
A: JPA is the specification, Hibernate is the implementation. We map Java objects to database tables using annotations (@Entity, @Id, etc.)

**Q: What is CORS and why is it needed?**
A: Cross-Origin Resource Sharing (CORS) is a security mechanism. Our frontend (port 5173) communicates with backend (port 8081), which requires CORS configuration.

**Q: Explain your project architecture?**
A: We follow MVC-like pattern: Controller handles HTTP requests, Service contains business logic, Repository manages database operations. This separation of concerns makes code maintainable.

---

## 📝 Summary

This TodoApp project demonstrates your ability to build a complete web application from scratch, including:

- Backend API development with Spring Boot
- Database design and integration with MySQL
- Frontend development with React
- RESTful API communication
- Modern development practices with Vite and Maven
- Clean code architecture

Good luck with your interview! 🎉
