package com.oracle.Legal.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationDetailsSource;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

import com.oracle.Legal.security.handler.FormAccessDeniedHandler;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
	private final AuthenticationProvider	authenticationProvider;
	private final AuthenticationDetailsSource<HttpServletRequest, WebAuthenticationDetails> 
	                     authenticationDetailsSource;
	private final AuthenticationSuccessHandler successHandler;
	private final AuthenticationFailureHandler failureHandler;
	private final UserDetailsService userDetailsService;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http
			.csrf(AbstractHttpConfigurer::disable)
			// 인가
        	.authorizeHttpRequests(auth->auth
                    .requestMatchers( "/css/**", "/images/**", "/js/**", "/favicon.*", "/*/icon-*"
                    	         	, "/WEB-INF/views/**").permitAll()
            //login
                    .requestMatchers("/", "/login", "/error**", "/assets/**").permitAll()
                    .requestMatchers("/client/**").permitAll()
            //운영자                    
                    .requestMatchers("/admin/**").hasAnyAuthority("ROLE_ADMIN")

                   
                    // 그 외는 로그인 필요
                    .anyRequest().authenticated()
               
			)
			
        	.formLogin(form -> form
        		    .loginPage("/login").permitAll()
        		    .loginProcessingUrl("/login")
        		    .authenticationDetailsSource(authenticationDetailsSource)
        		    .successHandler(successHandler)
        		    .failureHandler(failureHandler)
        		    .permitAll()
        		)

            .authenticationProvider(authenticationProvider)
            .exceptionHandling(
         		   exception -> exception
                                     .accessDeniedHandler(new FormAccessDeniedHandler("/denied"))
                              )
             ;

  		
 		
		return http.build();
	}
	
}
