package com.oracle.Legal.service;

import com.oracle.Legal.dto.ClientDto;

public interface ClientService {

	void informSave(ClientDto clientDto);

	ClientDto getSingleClient(int client_code);

	void updateUser(ClientDto clientDto);

	void clientDel(int clientCode);

	


}
