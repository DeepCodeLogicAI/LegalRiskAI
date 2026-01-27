package com.oracle.Legal.service;

import java.util.*;
import org.springframework.stereotype.Service;

import com.oracle.Legal.domain.Jogi;
import com.oracle.Legal.domain.Law;
import com.oracle.Legal.domain.Yusa;
import com.oracle.Legal.dto.HistoryDto;
import com.oracle.Legal.dto.HistoryPageDto;
import com.oracle.Legal.repository.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class MyPageService {

	private final LawRepository lawRepository;
	private final YusaRepository yusaRepository;
	private final JogiRepository jogiRepository;
    private final BoonjangRepository boonjangRepository;

    public List<HistoryDto> getAllHistory(int client_code) {

        List<HistoryDto> list = new ArrayList<>();

	     // LAW
	        lawRepository.findHistory(client_code).forEach(l -> {
	            list.add(HistoryDto.builder()
	                .serviceType("LAW")
	                .serviceCode((long) l.getLaw_code())
	                .analysisDate(java.sql.Timestamp.valueOf(l.getLaw_date()))
	                .input(l.getLaw_input())
	                .output(l.getLaw_output())
	                .mark(l.getLaw_mark())
	                .build());
	        });


        // YUSA
        yusaRepository.findHistory(client_code).forEach(y -> {
            list.add(HistoryDto.builder()
                .serviceType("YUSA")
                .serviceCode((long) y.getYusa_code())
                .analysisDate(java.sql.Timestamp.valueOf(y.getYusa_date())) 
                .input(y.getYusa_input())
                .output(y.getYusa_output())
                .mark(y.getYusa_mark())
                .build());
        });

        // JOGI
        jogiRepository.findHistory(client_code).forEach(j -> {
            list.add(HistoryDto.builder()
                .serviceType("JOGI")
                .serviceCode((long) j.getJogi_code())
                .analysisDate(java.sql.Timestamp.valueOf(j.getJogi_date())) 
                .input(j.getJogi_input())
                .output(j.getJogi_output())
                .mark(j.getJogi_mark())
                .build());
        });

        // BOONJANG
        boonjangRepository.findHistory(client_code).forEach(b -> {
            list.add(HistoryDto.builder()
                .serviceType("BOONJANG")
                .serviceCode((long) b.getBoonjang_code())
                .analysisDate(java.sql.Timestamp.valueOf(b.getBoonjang_date()))
                .input(b.getBoonjang_input())
                .output(b.getBoonjang_output())
                .mark(b.getBoonjang_mark())
                .build());
        });

        list.sort((a, b) -> b.getAnalysisDate().compareTo(a.getAnalysisDate())); return list;
    }
    
    //페이징
    public HistoryPageDto getHistoryPage(int client_code, int page, int size) {
        // 1) 전체 목록 만들기(지금 작성하신 getAllHistory 재사용)
        List<HistoryDto> all = getAllHistory(client_code);

        int totalCount = all.size();
        int totalPages = (int) Math.ceil((double) totalCount / size);

        // page 보정(1~totalPages)
        if (page < 1) page = 1;
        if (totalPages > 0 && page > totalPages) page = totalPages;

        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, totalCount);

        List<HistoryDto> content =
                (totalCount == 0) ? java.util.Collections.emptyList()
                                  : all.subList(fromIndex, toIndex);

        return new HistoryPageDto(content, totalCount, page, size, totalPages);
    }

    //법적위험 서비스코드로 찾기
    public HistoryDto getLawHistoryDetail(int clientCode, String serviceType, Long serviceCode) {

        Law l = lawRepository.findOne(clientCode, serviceCode.intValue());

        return HistoryDto.builder()
                .serviceType("LAW")
                .serviceCode(serviceCode)
                .analysisDate(java.sql.Timestamp.valueOf(l.getLaw_date()))
                .input(l.getLaw_input())
                .output(l.getLaw_output())
                .mark(l.getLaw_mark())
                .build();
    }
    //유사위험 서비스코드로 찾기
    public HistoryDto getYusaHistoryDetail(int clientCode, String serviceType, Long serviceCode) {

        Yusa l = yusaRepository.findOne(clientCode, serviceCode.intValue());

        return HistoryDto.builder()
                .serviceType("YUSA")
                .serviceCode(serviceCode)
                .analysisDate(java.sql.Timestamp.valueOf(l.getYusa_date()))
                .input(l.getYusa_input())
                .output(l.getYusa_output())
                .mark(l.getYusa_mark())
                .build();
    }
    //조기위험 서비스코드로 찾기
    public HistoryDto getJogiHistoryDetail(int clientCode, String serviceType, Long serviceCode) {

        Jogi l = jogiRepository.findOne(clientCode, serviceCode.intValue());

        return HistoryDto.builder()
                .serviceType("JOGI")
                .serviceCode(serviceCode)
                .analysisDate(java.sql.Timestamp.valueOf(l.getJogi_date()))
                .input(l.getJogi_input())
                .output(l.getJogi_output())
                .mark(l.getJogi_mark())
                .build();
    }

    //분쟁위험 서비스코드로 찾기
    public HistoryDto getBoonjangHistoryDetail(int clientCode, String serviceType, Long serviceCode) {

        com.oracle.Legal.domain.Boonjang l = boonjangRepository.findOne(clientCode, serviceCode.intValue());

        return HistoryDto.builder()
                .serviceType("BOONJANG")
                .serviceCode(serviceCode)
                .analysisDate(java.sql.Timestamp.valueOf(l.getBoonjang_date()))
                .input(l.getBoonjang_input())
                .output(l.getBoonjang_output())
                .mark(l.getBoonjang_mark())
                .build();
    }

	public HistoryDto getHistoryDetail(int clientCode, String type, Long code) {
		   String t = type.toUpperCase(); // 소문자 들어와도 대비

		    if ("LAW".equals(t)) {
		        return getLawHistoryDetail(clientCode, t, code);
		    } else if ("YUSA".equals(t)) {
		        return getYusaHistoryDetail(clientCode, t, code);
		    } else if ("JOGI".equals(t)) {
		        return getJogiHistoryDetail(clientCode, t, code);
		    } else if ("BOONJANG".equals(t)) {
		        return getBoonjangHistoryDetail(clientCode, t, code);
		    }

		    throw new IllegalArgumentException("unknown type: " + type);
    


	}
	
	

    @Transactional
    public void deleteLaw(int code) {
        lawRepository.deleteById(code);
    }

    @Transactional
    public void deleteYusa(int code) {
        yusaRepository.deleteById(code);
    }

    @Transactional
    public void deleteJogi(int code) {
        jogiRepository.deleteById(code);
    }

    @Transactional
    public void deleteBoonjang(int code) {
        boonjangRepository.deleteById(code);
    }
    
	@Transactional
	public void bulkDelete(List<String> selectedKeys) {
	    if (selectedKeys == null || selectedKeys.isEmpty()) return;

	    for (String key : selectedKeys) {
	        String[] parts = key.split(":");
	        if (parts.length != 2) continue;

	        String type = parts[0].toUpperCase();
	        int code = Integer.parseInt(parts[1]);

	        switch (type) {
	            case "LAW" -> deleteLaw(code);
	            case "YUSA" -> deleteYusa(code);
	            case "JOGI" -> deleteJogi(code);
	            case "BOONJANG" -> deleteBoonjang(code);
	        }
	    }
	}

	@Transactional
	public void toggleMark(String type, int code) {
	    String t = type.toUpperCase();

	    switch (t) {
	        case "LAW" -> lawRepository.toggleMark(code);
	        case "YUSA" -> yusaRepository.toggleMark(code);
	        case "JOGI" -> jogiRepository.toggleMark(code);
	        case "BOONJANG" -> boonjangRepository.toggleMark(code);
	        default -> throw new IllegalArgumentException("unknown type: " + type);
	    }
	}

}
