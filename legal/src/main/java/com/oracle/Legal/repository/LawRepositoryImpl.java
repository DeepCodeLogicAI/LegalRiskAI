package com.oracle.Legal.repository;

import org.springframework.stereotype.Repository;

import com.oracle.Legal.domain.Law;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class LawRepositoryImpl implements LawRepository {

	private final EntityManager em;
	
	@Override
	public Law lawSave(Law law) {
	
	em.persist(law);
	
	return law;
	}



}
