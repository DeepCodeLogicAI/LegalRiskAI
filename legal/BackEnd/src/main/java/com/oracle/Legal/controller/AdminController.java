package com.oracle.Legal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
	
	@GetMapping("/main")
	public String AdminClientPage(Model model) {
	System.out.println("운영자 페이지 실행중");
    return "admin/clientPage";           	
	}
	


	
}
