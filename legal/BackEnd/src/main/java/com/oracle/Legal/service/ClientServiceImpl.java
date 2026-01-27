package com.oracle.Legal.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.oracle.Legal.domain.Account;
import com.oracle.Legal.domain.Client;
import com.oracle.Legal.dto.ClientDto;
import com.oracle.Legal.repository.AccountRepository;
import com.oracle.Legal.repository.ClientRepository;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

	private final ClientRepository clientRepository;
	private final AccountRepository accountRepository;
	private final ModelMapper modelMapper;
	private final PasswordEncoder passwordEncoder;
	private final EntityManager em;

	
	@Override
	public void informSave(ClientDto clientDto) {
	    // 1) Client 저장
	    Client client = modelMapper.map(clientDto, Client.class);
	    clientRepository.save(client);

	    // 2) username null/공백 방지 
	    String username = clientDto.getUsername();
	    if (username == null || username.trim().isEmpty()) {
	        throw new IllegalArgumentException("username is required");
	    }

	    // 3) Account 저장 
	    Account account = new Account();
	    account.setClient_code(client.getClient_code());
	    account.setUsername(username.trim());

	    // 비밀번호공백 방지
	    String rawPw = clientDto.getPassword();
	    if (rawPw == null || rawPw.trim().isEmpty()) {
	        throw new IllegalArgumentException("password is required");
	    }
	    account.setPassword(passwordEncoder.encode(rawPw));
	    account.setRoles("ROLE_USER");

	    accountRepository.save(account);
	    
	}

	//회원정보로 찾기 
	@Override
	public ClientDto getSingleClient(int client_code) {
	return clientRepository.findByClient_code(client_code); 

	}

	//업데이트
	@Override
	public void updateUser(ClientDto clientDto) {
	    Client client = clientRepository.findEntityByClient_code(clientDto.getClient_code());
	    client.changeClient_name(clientDto.getClient_name());
	    client.changeClient_email(clientDto.getClient_email());
	    client.changeClient_tel(clientDto.getClient_tel());
	    client.changeClient_job(clientDto.getClient_job());
	    
	}


    @Override
    public void clientDel(int clientCode) {
        em.createQuery(
            "update Client c set c.client_is_del = 1 where c.client_code = :clientCode"
        )
        .setParameter("clientCode", clientCode)
        .executeUpdate();
    }
	

}
