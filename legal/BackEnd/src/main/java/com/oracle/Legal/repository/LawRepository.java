package com.oracle.Legal.repository;

import java.util.List;

import com.oracle.Legal.domain.Law;

public interface LawRepository {

	//법적위험 분석 저장
	Law lawSave(Law law);
	//법적위험 찾기
	Law findOne(int clientCode, int intValue);
	//법적위험 리스트
	List<Law> findHistory(int clientCode);
	//이력삭제
	void deleteById(int code);
	//즐겨찾기 토글
    void toggleMark(int code);


}
