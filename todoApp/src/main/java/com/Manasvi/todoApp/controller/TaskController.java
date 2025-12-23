package com.Manasvi.todoApp.controller;

import com.Manasvi.todoApp.entity.Task;
import com.Manasvi.todoApp.service.TaskService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5174")
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
