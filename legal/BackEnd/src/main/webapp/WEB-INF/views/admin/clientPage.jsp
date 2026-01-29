<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>회원 목록</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="d-flex flex-column min-vh-100">

    <!-- ✅ 공통 헤더 -->
    <jsp:include page="/WEB-INF/views/common/header.jsp"/>

    <!-- ✅ 메인 컨텐츠 -->
    <main class="container my-5 flex-grow-1">
        <h2 class="fw-bold mb-4">회원 목록</h2>

        <!-- 나중에 테이블 들어갈 자리 -->
        <div class="card shadow-sm">
            <div class="card-body">
                <p class="text-muted mb-0">
                    회원 목록이 여기에 표시됩니다.
                </p>
            </div>
        </div>
    </main>

    <!-- ✅ 공통 푸터 -->
    <jsp:include page="/WEB-INF/views/common/footer.jsp"/>

</body>
</html>
