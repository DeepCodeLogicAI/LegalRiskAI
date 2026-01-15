package com.oracle.Legal.service;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.oracle.Legal.domain.Law;
import com.oracle.Legal.dto.LawDto;
import com.oracle.Legal.repository.LawRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class LawServiceImpl implements LawService {

	private final LawRepository lawRepository; //DI
	private final ModelMapper modelMapper;	//DI
	
	@Override
	public int lawSave(LawDto lawDto) {
		Law law = modelMapper.map(lawDto, Law.class);
		Law saveLaw = lawRepository.lawSave(law);
		
		return saveLaw.getLaw_code();
	}

}
