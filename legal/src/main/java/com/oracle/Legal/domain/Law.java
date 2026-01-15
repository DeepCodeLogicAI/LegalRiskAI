package com.oracle.Legal.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;


@Entity										//entity선언
@Data										//(getter setter tostring 등등 집합)
@Table(name ="law")							//law테이블에서 시퀀스 생성
@SequenceGenerator (
		name = "law_seq",
		sequenceName = "LAW_SEQ",
		initialValue = 100000,
		allocationSize = 1
		)

//법적위험 Entity
@EntityListeners(AuditingEntityListener.class)	//date때문에쓴건데 의미부여 x
public class Law {
	@Id
	@GeneratedValue(
			strategy = GenerationType.SEQUENCE,
			generator = "law_seq"		//법적위험사건ID-시퀀스 생성기
			)
	private int		law_code;			//법적위험사건코드
	private int		client_code;		//회원코드
	private String 	law_input;			//사건내용
	private String 	law_output;			//사건결과
	@CreatedDate
	private LocalDateTime law_date;		//입력일
	
	//검증용 코드
	public void changeLaw_code(int law_code) { 	
		this.law_code = law_code;	
	}
	public void changeClient_code(int client_code) {
		this.client_code = client_code;
	}
	public void changeLaw_input(String law_input) {
		this.law_input = law_input;
	}
	public void changeLaw_output(String law_output) {
		this.law_output = law_output;
	}
	public void changelaw_date(LocalDateTime law_date) {
		this.law_date = law_date;
	}
}
