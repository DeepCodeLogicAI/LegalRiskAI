package com.oracle.Legal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontEndController {

    @GetMapping({"/test","/test2"})
    public String forward() {
        return "forward:/index.html";
    }
}
