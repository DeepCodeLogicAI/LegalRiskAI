package com.oracle.Legal.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.oracle.Legal.domain.Law;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
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

	@Override
	public Law findOne(int client_code, int law_code) {
	    try {
	        return em.createQuery(
	            "select l from Law l where l.client_code = :cc and l.law_code = :lc",
	            Law.class
	        )
	        .setParameter("cc", client_code)
	        .setParameter("lc", law_code)
	        .getSingleResult();
	    } catch (NoResultException e) {
	        return null;
	    }
	}


    @Override
    public List<Law> findHistory(int clientCode) {
        return em.createQuery(
            "select l from Law l where l.client_code = :cc order by l.law_date desc",
            Law.class
        )
        .setParameter("cc", clientCode)
        .getResultList();
    }

    @Override
    public void deleteById(int code) {
        Law law = em.find(Law.class, code);
        if (law != null) {
            em.remove(law);
        }
    }

	@Override
    public void toggleMark(int code) {
        em.createQuery("""
            update Law l
            set l.law_mark =
                case when l.law_mark = 1 then 0 else 1 end
            where l.law_code = :code
        """)
        .setParameter("code", code)
        .executeUpdate();
    }
}
