<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>메인 페이지</title>

<!-- Bootstrap 5 (CDN) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
  body { background: #f6f7fb; }
  .hero {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,.06);
  }
</style>
</head>

<body>
<div class="container py-5">

  <!-- Header / Hero -->
  <div class="hero p-4 p-md-5 mb-4">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div>
        <h1 class="fw-bold mb-1">메인 페이지</h1>
        <p class="text-muted mb-0">원하는 페이지로 이동하세요.</p>
      </div>

      <div class="d-flex gap-2">
        <a class="btn btn-primary btn-lg" href="${pageContext.request.contextPath}/test">
          Test로 이동
        </a>
        <a class="btn btn-outline-primary btn-lg" href="${pageContext.request.contextPath}/test2">
          Test2로 이동
        </a>
      </div>
    </div>
  </div>

  <!-- Cards -->
  <div class="row g-3">
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title fw-bold">Test</h5>
          <p class="card-text text-muted">/test 로 이동하는 테스트 페이지입니다.</p>
          <a class="btn btn-primary" href="${pageContext.request.contextPath}/test">열기</a>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title fw-bold">Test2</h5>
          <p class="card-text text-muted">/test2 로 이동하는 테스트 페이지입니다.</p>
          <a class="btn btn-outline-primary" href="${pageContext.request.contextPath}/test2">열기</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="text-center text-muted mt-5">
  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
