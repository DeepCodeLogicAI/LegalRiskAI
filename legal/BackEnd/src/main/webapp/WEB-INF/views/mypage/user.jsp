<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.springframework.security.core.context.SecurityContextHolder" %>
<%@ page import="org.springframework.security.core.Authentication" %>
<%@ page import="com.oracle.Legal.dto.AccountDto" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>회원정보</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
  body { background: #f6f7fb; }
  .glass{
    background: rgba(255,255,255,.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(15, 23, 42, .06);
    border-radius: 18px;
    box-shadow: 0 12px 34px rgba(0,0,0,.06);
  }
  .avatar{
    width: 72px;
    height: 72px;
    border-radius: 22px;
    background: #eef2ff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size: 34px;
    border: 1px solid rgba(15, 23, 42, .06);
  }
  .kv {
    display:flex;
    justify-content:space-between;
    padding:10px 0;
    border-top:1px solid #f1f5f9;
    font-size:14px;
  }
  .kv:first-child{ border-top:0; }
  .kv .k{ color:#64748b; }
  .kv .v{ font-weight:600; color:#0f172a; }
  .help{ font-size:12px; color:#64748b; }
  .toggle-btn{
    border: 1px solid rgba(15, 23, 42, .08);
    border-radius: 14px;
    background: #f8fafc;
  }
</style>
</head>

<%
  Authentication auth = SecurityContextHolder.getContext().getAuthentication();
  AccountDto loginUser = null;
  String username = "";
  Integer clientCode = null;

  if (auth != null && auth.getPrincipal() instanceof AccountDto) {
    loginUser = (AccountDto) auth.getPrincipal();
    username = loginUser.getUsername();
    clientCode = loginUser.getClient_code();
  }
  String ctx = request.getContextPath();
%>

<body class="d-flex flex-column min-vh-100">
<jsp:include page="/WEB-INF/views/common/header.jsp"/>

<div class="container py-4 py-md-5 flex-grow-1">
  <div class="row g-4">

    <!-- LEFT : 마이페이지 / 탈퇴 -->
    <div class="col-12 col-lg-4">
      <div class="glass p-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="avatar">👤</div>
          <div>
            <div class="fw-bold fs-4">${user.client_name}</div>
            <div class="text-muted small"><%= username %></div>
          </div>
        </div>

        <div class="kv">
          <div class="k">회원 코드</div>
          <div class="v"><%= clientCode %></div>
        </div>

        <div class="d-grid gap-2 mt-4">
          <a class="btn btn-outline-secondary" href="<%= ctx %>/mypage">
            ← 마이페이지
          </a>

          <form method="post"
                action="<%= ctx %>/mypage/clientDel"
                onsubmit="return confirm('정말 회원탈퇴 하시겠습니까?\n탈퇴 후에는 복구할 수 없습니다.');">

            <input type="hidden" name="client_code" value="<%= clientCode %>"/>
            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>

            <button type="submit" class="btn btn-outline-danger">
              회원탈퇴
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- RIGHT : 정보 수정 -->
    <div class="col-12 col-lg-8">
      <div class="glass p-4">

        <!-- 회원정보 수정 -->
        <button class="btn w-100 text-start d-flex justify-content-between align-items-center px-3 py-3 toggle-btn"
                data-bs-toggle="collapse" data-bs-target="#profileCollapse">
          <div>
            <div class="fw-bold fs-4">회원정보 수정</div>
            <div class="text-muted small">이름 / 이메일 / 전화번호 / 직업</div>
          </div>
          <span class="fs-4">⌄</span>
        </button>

        <div class="collapse show mt-3" id="profileCollapse">
          <form method="post"
                action="<%= ctx %>/mypage/user/update"
                class="row g-3">

            <input type="hidden" name="client_code" value="<%= clientCode %>"/>

            <div class="col-12">
              <label class="form-label">이름</label>
              <input type="text" class="form-control" name="client_name"
                     value="${user.client_name}">
            </div>

            <div class="col-12">
              <label class="form-label">이메일</label>
              <input type="email" class="form-control" name="client_email"
                     value="${user.client_email}">
            </div>

            <div class="col-12">
              <label class="form-label">전화번호</label>
              <input type="text" class="form-control" name="client_tel"
                     value="${user.client_tel}">
            </div>

            <div class="col-12">
              <label class="form-label">직업</label>
              <input type="text" class="form-control" name="client_job"
                     value="${user.client_job}">
            </div>

            <div class="col-12 text-end">
              <button type="submit" class="btn btn-primary">저장</button>
            </div>
          </form>
        </div>

        <hr class="my-4">

        <!-- 비밀번호 변경 -->
        <button class="btn w-100 text-start d-flex justify-content-between align-items-center px-3 py-3 toggle-btn"
                data-bs-toggle="collapse" data-bs-target="#passwordCollapse">
          <div>
            <div class="fw-bold fs-4">비밀번호 변경</div>
            <div class="text-muted small">현재 비밀번호 확인 후 변경</div>
          </div>
          <span class="fs-4">⌄</span>
        </button>

        <div class="collapse mt-3" id="passwordCollapse">
          <form method="post"
                action="<%= ctx %>/mypage/password/change"
                class="row g-3">

            <div class="col-12">
              <label class="form-label">현재 비밀번호</label>
              <input type="password" class="form-control" name="currentPassword" required>
            </div>

            <div class="col-12">
              <label class="form-label">새 비밀번호</label>
              <input type="password" class="form-control" name="newPassword" required>
            </div>

            <div class="col-12">
              <label class="form-label">새 비밀번호 확인</label>
              <input type="password" class="form-control" name="confirmPassword" required>
            </div>

            <div class="col-12 text-end">
              <button type="submit" class="btn btn-outline-primary">
                비밀번호 변경
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>

  </div>
</div>

<jsp:include page="/WEB-INF/views/common/footer.jsp"/>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
