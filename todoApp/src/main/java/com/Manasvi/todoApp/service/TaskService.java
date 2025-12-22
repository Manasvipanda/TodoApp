package com.Manasvi.todoApp.service;

import com.Manasvi.todoApp.entity.Task;
import com.Manasvi.todoApp.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // Create task
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    // Get all tasks
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Update task
    public Task updateTask(Long id, Task updatedTask) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setCompleted(updatedTask.isCompleted());

        return taskRepository.save(existingTask);
    }

    // Delete task
    public void deleteTask(Long id) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        taskRepository.delete(existingTask);
    }
}
