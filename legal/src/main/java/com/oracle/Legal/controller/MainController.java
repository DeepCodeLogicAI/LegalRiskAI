package com.oracle.Legal.controller;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MainController {
	
	@GetMapping("/")
	//메인 페이지 실행 
	public String mainPage(Model model)  {
	System.out.println("메인컨트롤러 실행중");
	return "main";
	}
	
	
}