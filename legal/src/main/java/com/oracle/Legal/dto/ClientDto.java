package com.oracle.Legal.dto;

import com.oracle.Legal.domain.Client;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDto {

	private int    client_code;				//회원 코드
	private String client_name;				//이름
	private String client_email;			//이메일
	private int    client_tel;				//전화번호
	private String client_job;				//직업
	private int    client_is_del;			//삭제여부
	
	public ClientDto(Client client){
		this.client_code = getClient_code();
		this.client_name = getClient_name();
		this.client_email = getClient_email();
		this.client_tel = getClient_tel();
		this.client_job = getClient_job();
		this.client_is_del = getClient_is_del();
		
		
	}
	
}
