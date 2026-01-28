<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.springframework.security.core.context.SecurityContextHolder" %>
<%@ page import="org.springframework.security.core.Authentication" %>
<%@ page import="com.oracle.Legal.dto.AccountDto" %>

<%
  String ctx = request.getContextPath();

  Authentication auth = SecurityContextHolder.getContext().getAuthentication();
  String displayName = "운영자";
  try {
    if (auth != null && auth.getPrincipal() instanceof AccountDto) {
      AccountDto u = (AccountDto) auth.getPrincipal();
      if (u.getClient_name() != null && !u.getClient_name().isBlank()) displayName = u.getClient_name();
      else if (u.getUsername() != null) displayName = u.getUsername();
    }
  } catch(Exception e) {}
%>

<div class="container py-4 py-md-5">

  <div class="glass p-4 p-md-5 mb-4">
    <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">
      <div>
        <div class="badge text-bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2 mb-3">
          🛠️ Admin
        </div>
        <h1 class="fw-bold mb-2"><%= displayName %> 님, 운영자 메인</h1>
        <p class="text-muted mb-0">운영자 전용 기능으로 이동하세요.</p>
      </div>

      <div class="d-flex gap-2">
        <a class="btn btn-primary" href="<%= ctx %>/admin/main">운영자 페이지</a>
        <a class="btn btn-outline-primary" href="<%= ctx %>/yusa">유사판례</a>
      </div>
    </div>
  </div>

  <div class="row g-3 g-md-4">
    <div class="col-md-6 col-lg-4">
      <div class="card feature-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="icon-badge">🛠️</div>
            <div>
              <div class="fw-bold">운영자 페이지</div>
              <div class="text-muted small">관리/운영</div>
            </div>
          </div>
          <p class="text-muted mb-3">운영자 전용 화면으로 이동합니다.</p>
          <a class="btn btn-primary w-100" href="<%= ctx %>/admin/main">열기</a>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-lg-4">
      <div class="card feature-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="icon-badge">📚</div>
            <div>
              <div class="fw-bold">유사판례</div>
              <div class="text-muted small">기능 확인</div>
            </div>
          </div>
          <p class="text-muted mb-3">유사판례 기능을 바로 실행합니다.</p>
          <a class="btn btn-outline-primary w-100" href="<%= ctx %>/yusa">열기</a>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-lg-4">
      <div class="card feature-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="icon-badge">👤</div>
            <div>
              <div class="fw-bold">마이페이지(참고)</div>
              <div class="text-muted small">일반 화면</div>
            </div>
          </div>
          <p class="text-muted mb-3">필요 시 일반 사용자 페이지 확인.</p>
          <a class="btn btn-outline-primary w-100" href="<%= ctx %>/mypage/main">열기</a>
        </div>
      </div>
    </div>
  </div>

</div>
