package com.oracle.Legal.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.oracle.Legal.domain.Boonjang;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;

/**
 * 분쟁 데이터 저장소 구현체 (Repository Implementation)
 * 
 * 작성자: 김은혜
 * 설명: 메뉴판(인터페이스)에 적힌 대로 실제로 DB에 명령을 내리는 '주방'입니다.
 *       EntityManager(JPA)를 사용해서 데이터를 직접 저장하거나 꺼내옵니다.
 */
@Repository
@RequiredArgsConstructor
public class BoonjangRepositoryImpl implements BoonjangRepository {

	private final EntityManager em;
	
	@Override
	public Boonjang save(Boonjang boonjang) {
		em.persist(boonjang);
		return boonjang;
	}

	@Override
	public Boonjang findOne(int client_code, int boonjang_code) {
		try {
	        return em.createQuery(
	            "select b from Boonjang b where b.client_code = :cc and b.boonjang_code = :bc",
	            Boonjang.class
	        )
	        .setParameter("cc", client_code)
	        .setParameter("bc", boonjang_code)
	        .getSingleResult();
	    } catch (NoResultException e) {
	        return null;
	    }
	}

    @Override
    public List<Boonjang> findHistory(int clientCode) {
        return em.createQuery(
            "select b from Boonjang b where b.client_code = :cc order by b.boonjang_date desc",
            Boonjang.class
        )
        .setParameter("cc", clientCode)
        .getResultList();
    }

	@Override
	public void deleteById(int code) {
	    Boonjang boonjang = em.find(Boonjang.class, code);
	    if (boonjang != null) {
	        em.remove(boonjang);
	    }
	}

	@Override
    public void toggleMark(int code) {
        em.createQuery("""
            update Boonjang b
            set b.boonjang_mark =
                case when b.boonjang_mark = 1 then 0 else 1 end
            where b.boonjang_code = :code
        """)
        .setParameter("code", code)
        .executeUpdate();
    }
	
}
