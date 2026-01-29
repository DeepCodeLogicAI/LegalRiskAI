package com.oracle.Legal.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.oracle.Legal.dto.AccountDto;
import com.oracle.Legal.dto.ClientDto;
import com.oracle.Legal.dto.HistoryDto;
import com.oracle.Legal.dto.PageDto;
import com.oracle.Legal.service.ClientService;
import com.oracle.Legal.service.MyPageService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MypageController {
	
	//회원가입페이지 이동
    private final MyPageService myPageService;
    private final ClientService clientService;

    // 페이징
    @GetMapping("")
    public String mypageRootRedirect(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        return "redirect:/mypage/main?page=" + page + "&size=" + size;
    }

    // 마이페이지 메인
    @GetMapping("/main")
    public String mypageMain(
            Model model,
            @RequestParam(name="page", defaultValue="1") int page,
            @RequestParam(name="size", defaultValue="10") int size,
            @RequestParam(name="serviceType", required=false) String serviceType 

    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        AccountDto loginUser = (AccountDto) auth.getPrincipal();
        
        //로그인 유저 가져오기
        int clientCode = loginUser.getClient_code();

        PageDto<HistoryDto> result =
                myPageService.getHistoryPage(clientCode, page, size, serviceType);
        
        //최신 이름 가져오기 
        ClientDto user = clientService.getSingleClient(clientCode);
        model.addAttribute("user", user);

        model.addAttribute("historyList", result.getContent());
        model.addAttribute("totalCount", result.getTotalCount());
        model.addAttribute("page", result.getPage());
        model.addAttribute("size", result.getSize());
        model.addAttribute("totalPages", result.getTotalPages());
        model.addAttribute("serviceType", serviceType); 


        return "mypage/main";
    }

    //상세보기 
    @GetMapping("/history/{type}/{code}")
    public String historyDetailPage(@PathVariable("type") String type,
                                    @PathVariable("code") Long code,
                                    Authentication authentication,
                                    Model model) {

        AccountDto loginUser = (AccountDto) authentication.getPrincipal();
        int clientCode = loginUser.getClient_code();

        HistoryDto detail = myPageService.getHistoryDetail(clientCode, type, code);

        model.addAttribute("detail", detail);
        return "mypage/detail";
    }

    

	//회원정보 조회,수정 페이지 이동
    @GetMapping("/user")
    public String userPage(Model model, Authentication authentication) {
        AccountDto account = (AccountDto) authentication.getPrincipal();
        Integer clientCode = account.getClient_code();

        ClientDto user = clientService.getSingleClient(clientCode);
        model.addAttribute("user", user);
        return "mypage/user";
    }
    
    //회원정보 수정 실행
    @PostMapping("/user/update")
    public String updateUser(ClientDto clientDto, Authentication authentication, RedirectAttributes ra) {
        AccountDto account = (AccountDto) authentication.getPrincipal();

        clientDto.setClient_code(account.getClient_code());

        clientService.updateUser(clientDto);
        return "redirect:/mypage/user";
    }
    
    //회원 탈퇴 
    @PostMapping("/clientDel")
    public String clientDel(
            @RequestParam("client_code") int clientCode,
            HttpServletRequest request) {

        clientService.clientDel(clientCode);

        request.getSession().invalidate();

        return "redirect:/logout";
    }
    
    //이력 삭제
    @PostMapping("/history/delete")
    public String delete(
            @RequestParam(value="selectedKeys", required=false) List<String> selectedKeys,
            @RequestParam(name="page", defaultValue="1") int page,
            @RequestParam(name="serviceType", required=false) String serviceType
    ) {
        myPageService.bulkDelete(selectedKeys);
        return "redirect:/mypage/main?page=" + page
             + (serviceType != null && !serviceType.isBlank() ? "&serviceType=" + serviceType : "");
    }

    //즐겨찾기 
    @PostMapping("/history/mark/toggle")
    public String toggleMark(@RequestParam("serviceType") String serviceType,
                             @RequestParam("serviceCode") int serviceCode,
                             @RequestParam(name="page", defaultValue="1") int page,
                             @RequestParam(name="serviceTypeFilter", required=false) String filter) {

        myPageService.toggleMark(serviceType, serviceCode);

        return "redirect:/mypage/main?page=" + page
             + (filter != null && !filter.isBlank() ? "&serviceType=" + filter : "");
    }



}
