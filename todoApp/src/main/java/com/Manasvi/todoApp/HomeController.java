package com.Manasvi.todoApp;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HomeController {

     @GetMapping("/")
     public String home(){
        return "✅ Spring Boot ToDo App is Running Successfully!";
     }
    
}
