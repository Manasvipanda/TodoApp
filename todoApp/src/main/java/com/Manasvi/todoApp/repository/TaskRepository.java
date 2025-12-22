package com.Manasvi.todoApp.repository;

import com.Manasvi.todoApp.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
