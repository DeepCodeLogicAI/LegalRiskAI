package com.oracle.Legal.domain;

import org.hibernate.annotations.ColumnDefault;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "client")					//테이블명 
@SequenceGenerator (
		name = "client_seq",				//JPA 시퀀스명
		sequenceName = "CLIENT_SEQ",		//DB에서 쓰는 시퀀스명 
		initialValue = 1000,				//시퀀스 시작 1000~
		allocationSize = 1					//시퀀스 단위(보통 1)
		)

public class Client {
	@Id
	@GeneratedValue(
			strategy = GenerationType.SEQUENCE,
			generator = "client_seq"		//회원-시퀀스 생성기
			)
	
	private int 	client_code;			//회원코드
	private String  client_name;			//이름
	private String 	client_email;			//이메일
	private String	client_tel;				//전화번호
	private String 	client_job;				//직업
	@ColumnDefault("0")		//default column을 1로 두겠다: 0-> 탈퇴, 1-> 회원
	private int 	client_is_del;			//삭제 여부 
	
	//검증용 코드 
	public void changeClient_code(int client_code) {
		this.client_code = client_code;
	}
	public void changeClient_name(String client_name) {
		this.client_name = client_name;
	}
	public void changeClient_email (String client_email) {
		this.client_email = client_email;
	}
	public void changeClient_tel (String client_tel) {
		this.client_tel = client_tel;
	}
	public void changeClient_job (String client_job) {
		this.client_job = client_job;
	}
	public void changeClient_is_del (int client_is_del) {
		this.client_is_del = client_is_del;
	}

	
}
