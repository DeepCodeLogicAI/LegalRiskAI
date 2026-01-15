package com.oracle.Legal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.oracle.Legal.dto.LawDto;
import com.oracle.Legal.service.LawService;

import lombok.RequiredArgsConstructor;

@Controller						//컨트롤러
@RequiredArgsConstructor		//의존성 주입(위에서 한번 private final로 선언해두면 아래에서 쓰면됨)
@RequestMapping("/law")			//url 공통 매핑
public class LawController {
	
	private final LawService lawService;		//의존성 주입(한번 선언해 두면 아래에서 쭉 사용가능)
	
	@GetMapping("/lawMain")//테스트용 법적위험 페이지
	public String predictPage(Model model) {	
		System.out.println("법적메인페이지 실행중");
	return "law/lawMain";	//페이지 반환
	}
	
	//법적위험 사건 저장 
	@PostMapping("/saveLaw")
	public String saveLaw (LawDto lawDto) {
		lawService.lawSave(lawDto);
		System.out.println("사건 내용 저장");	
		return "redirect:lawMain";
	}
	
	
}
