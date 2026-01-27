package com.oracle.Legal.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.oracle.Legal.domain.Jogi;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class JogiRepositoryImpl implements JogiRepository {

	private final EntityManager em; 
	
	@Override
	public Jogi jogiSave(Jogi jogi) {
		
		em.persist(jogi);
		
		return jogi;
	}

	@Override
	public Jogi findOne(int client_code, int jogi_code) {
	    try {
	        return em.createQuery(
	            "select j from Jogi j where j.client_code = :cc and j.jogi_code = :jc",
	            Jogi.class
	        )
	        .setParameter("cc", client_code)
	        .setParameter("jc", jogi_code)
	        .getSingleResult();

	    } catch (NoResultException e) {
	        return null;
	    }
	}

    @Override
    public List<Jogi> findHistory(int clientCode) {
        return em.createQuery(
            "select j from Jogi j where j.client_code = :cc order by j.jogi_date desc",
            Jogi.class
        )
        .setParameter("cc", clientCode)
        .getResultList();
    }
    
    @Override
    public void deleteById(int code) {
        Jogi jogi = em.find(Jogi.class, code);
        if (jogi != null) {
            em.remove(jogi);
        }
    }

	@Override
    public void toggleMark(int code) {
        em.createQuery("""
            update Jogi j
            set j.jogi_mark =
                case when j.jogi_mark = 1 then 0 else 1 end
            where j.jogi_code = :code
        """)
        .setParameter("code", code)
        .executeUpdate();
    }
}
