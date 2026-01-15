<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>법적위험 페이지</title>

<!-- Bootstrap 5 (CDN) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
  body { background: #f6f7fb; }
  .card { border: 0; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
  .form-label { font-weight: 600; }
</style>
</head>

<body>
  <div class="container py-5">

    <div class="row justify-content-center">
      <div class="col-lg-8 col-xl-7">

        <div class="mb-4">
          <h2 class="fw-bold mb-1">⚖️ 법적위험 사건 등록</h2>
          <p class="text-muted mb-0">사건 정보를 입력하고 저장 버튼을 누르세요.</p>
        </div>

        <div class="card">
          <div class="card-body p-4 p-md-5">

            <!-- ✅ LawDto로 바인딩될 폼 -->
            <!-- 컨트롤러: @RequestMapping("/law") + @PostMapping("/saveLaw") -->
            <form action="${pageContext.request.contextPath}/law/saveLaw" method="post" class="needs-validation" novalidate>

              <!-- client_code -->
              <div class="mb-3">
                <label class="form-label" for="client_code">회원 코드 (client_code)</label>
                <input type="number" class="form-control" id="client_code" name="client_code"
                       placeholder="예: 1001" required>
                <div class="invalid-feedback">회원 코드를 입력하세요.</div>
              </div>

              <!-- law_input -->
              <div class="mb-3">
                <label class="form-label" for="law_input">사건 내용 (law_input)</label>
                <textarea class="form-control" id="law_input" name="law_input" rows="5"
                          placeholder="사건 내용을 입력하세요" required></textarea>
                <div class="invalid-feedback">사건 내용을 입력하세요.</div>
              </div>

              <!-- law_output -->
              <div class="mb-3">
                <label class="form-label" for="law_output">사건 결과 (law_output)</label>
                <textarea class="form-control" id="law_output" name="law_output" rows="3"
                          placeholder="분류/판단 결과 또는 메모(선택)"></textarea>
              </div>

              <!-- law_date -->
              <!-- DTO가 LocalDateTime이면 브라우저에서 datetime-local로 받는 게 제일 자연스러움 -->
              <div class="mb-4">
                <label class="form-label" for="law_date">입력일 (law_date)</label>
                <input type="datetime-local" class="form-control" id="law_date" name="law_date">
                <div class="form-text text-muted">
                  비워두면 서버에서 @CreatedDate로 자동 입력되게 할 수 있어요.
                </div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-dark px-4">저장하기</button>
                <button type="reset" class="btn btn-outline-secondary px-4">초기화</button>
                <a href="${pageContext.request.contextPath}/" class="btn btn-outline-primary px-4">
				  홈으로
				</a>
              </div>

            </form>

          </div>
        </div>

        <p class="text-muted small mt-3 mb-0">
          ※ law_code는 DB 시퀀스로 자동 생성되므로 입력하지 않습니다.
        </p>

      </div>
    </div>
  </div>

  <!-- Bootstrap JS (optional) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- 간단한 Bootstrap validation -->
  <script>
    (() => {
      'use strict';
      const forms = document.querySelectorAll('.needs-validation');
      Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    })();
  </script>
</body>
</html>
