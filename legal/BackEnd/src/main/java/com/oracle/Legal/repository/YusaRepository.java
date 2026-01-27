package com.oracle.Legal.repository;

import java.util.List;
import com.oracle.Legal.domain.Yusa;

public interface YusaRepository {

	//유사판례 분석 저장
	Yusa yusaSave(Yusa yusa);
	//유사판례 찾기
	Yusa findOne(int clientCode, int intValue);
	//유사판례 리스트
	List<Yusa> findHistory(int clientCode);
	//이력삭제
	void deleteById(int code);
	//즐겨찾기 토글
	void toggleMark(int code);

}
