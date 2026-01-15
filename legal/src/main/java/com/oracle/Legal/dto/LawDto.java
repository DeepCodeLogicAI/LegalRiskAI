package com.oracle.Legal.dto;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import com.oracle.Legal.domain.Law;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LawDto {
	
	private int 	 law_code;						//법적위험사건코드
	private int 	 client_code;					//회원 코드
	private String	 law_input;						//사건내용
	private String 	 law_output;					//사건결과
	@DateTimeFormat(pattern = "yyyy-MM-dd")			//date 2xxx-xx-xx형태 
	private LocalDateTime	law_date;				//법적위험입력일
	
	public LawDto(Law law) {
		this.law_code = law.getLaw_code();
		this.client_code = law.getClient_code();
		this.law_input = law.getLaw_input();
		this.law_output = law.getLaw_output();
		this.law_date = law.getLaw_date();
			
	}
	
	//등록일 yyyy-MM-dd로 변경
	public String getLaw_dateFormatted() {
	    if (law_date != null) {
	        return new java.text.SimpleDateFormat("yyyy-MM-dd").format(law_date);
	    }
	    return "";
	}
	

}
