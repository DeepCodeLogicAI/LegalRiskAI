package com.oracle.Legal.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.oracle.Legal.domain.Yusa;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class YusaRepositoryImpl implements YusaRepository {

	private final EntityManager em;
	
	@Override
	public Yusa yusaSave(Yusa yusa) {
		
	em.persist(yusa);
	
	return yusa;
	}

	@Override
	public Yusa findOne(int client_code, int yusa_code) {
	    try {
	        return em.createQuery(
	            "select y from Yusa y where y.client_code = :cc and y.yusa_code = :yc",
	            Yusa.class
	        )
	        .setParameter("cc", client_code)
	        .setParameter("yc", yusa_code)
	        .getSingleResult();

	    } catch (NoResultException e) {
	        return null;
	    }
	}

    @Override
    public List<Yusa> findHistory(int clientCode) {
        return em.createQuery(
            "select y from Yusa y where y.client_code = :cc order by y.yusa_date desc",
            Yusa.class
        )
        .setParameter("cc", clientCode)
        .getResultList();
    }
    
    @Override
    public void deleteById(int code) {
        Yusa yusa = em.find(Yusa.class, code);
        if (yusa != null) {
            em.remove(yusa);
        }
    }

	@Override
	public void toggleMark(int code) {
	        em.createQuery("""
	            update Yusa y
	            set y.yusa_mark =
	                case when y.yusa_mark = 1 then 0 else 1 end
	            where y.yusa_code = :code
	        """)
	        .setParameter("code", code)
	        .executeUpdate();
	    }
}
