package com.oracle.Legal.security.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oracle.Legal.security.user.repository.UserRepository;
import com.oracle.Legal.domain.Account;
import com.oracle.Legal.dto.AccountContext;
import com.oracle.Legal.dto.AccountDto;
import com.oracle.Legal.dto.ClientDto;
import com.oracle.Legal.repository.ClientRepository;

import lombok.RequiredArgsConstructor;

@Service("userDetailService") 
@RequiredArgsConstructor
public class FormUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper = new ModelMapper();
    private final ClientRepository clientRepository; 


    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = userRepository.findByUsername(username);
        if (account == null) {
            throw new UsernameNotFoundException("No user with username: " + username);
        }

        String rolesStr = account.getRoles();
        if (rolesStr == null || rolesStr.isBlank()) {
            rolesStr = "ROLE_USER";
        }
        List<GrantedAuthority> authorities = Arrays.stream(rolesStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(SimpleGrantedAuthority::new) 
                .collect(Collectors.toList());

        AccountDto accountDto = modelMapper.map(account, AccountDto.class);        
        String displayName = accountDto.getUsername();
        int clientCode = accountDto.getClient_code();

        if (clientCode != 0) {
            ClientDto clientDto = clientRepository.findByClient_code(clientCode);

            if (clientDto != null 
                && clientDto.getClient_name() != null 
                && !clientDto.getClient_name().isBlank()) {

                displayName = clientDto.getClient_name();
            }
            
            if (clientDto == null || clientDto.getClient_is_del() != 0) {
                throw new UsernameNotFoundException("아이디나 비밀번호를 확인해주세요.");
            }
        }

        accountDto.setDisplayName(displayName);
        return new AccountContext(accountDto, authorities);
    }
}
