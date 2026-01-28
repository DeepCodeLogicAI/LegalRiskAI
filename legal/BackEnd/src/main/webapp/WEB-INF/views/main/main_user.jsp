<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.springframework.security.core.context.SecurityContextHolder" %>
<%@ page import="org.springframework.security.core.Authentication" %>
<%@ page import="com.oracle.Legal.dto.AccountDto" %>

<%
  Authentication auth = SecurityContextHolder.getContext().getAuthentication();

  AccountDto loginUser = null;
  boolean loggedIn = false;

  if (auth != null && auth.getPrincipal() instanceof AccountDto) {
      loginUser = (AccountDto) auth.getPrincipal();
      loggedIn = true;
  }

  String ctx = request.getContextPath();

  String displayName = "";
  if (loggedIn) {
    try {
      displayName = loginUser.getClient_name();
      if (displayName == null || displayName.isBlank()) displayName = loginUser.getUsername();
    } catch(Exception e) {}
  }
%>

<div class="container py-4 py-md-5">

  <!-- Hero -->
  <div class="glass p-4 p-md-5 mb-4">
    <div class="row g-4 align-items-center">
      <div class="col-lg-7">
        <div class="badge text-bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2 mb-3">
          ⚖️ Legal Assistant
        </div>

        <% if (loggedIn) { %>
          <h1 class="fw-bold mb-2"><%= displayName %> 님, 환영합니다</h1>
          <p class="text-muted mb-0">
            LEGALAI에서 법적 위험 분석, 분쟁 유형 분류, 유사 판례 탐색, 조기중재를 빠르게 이용할 수 있습니다.
          </p>
        <% } else { %>
          <h1 class="fw-bold mb-2">LEGALAI 메인</h1>
          <p class="text-muted mb-0">
            로그인 후 더 많은 기능을 이용할 수 있습니다. 아래에서 원하는 기능으로 이동하세요.
          </p>
        <% } %>
      </div>

      <div class="col-lg-5">
        <div class="p-3 p-md-4 bg-white rounded-4 border">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="fw-bold">빠른 이동</div>
            <div class="text-muted small">원하는 기능 선택</div>
          </div>

          <div class="d-grid gap-2">
            <a class="btn btn-primary" href="<%= ctx %>/law">법적위험 분석</a>
            <a class="btn btn-outline-primary" href="<%= ctx %>/boonjang">분쟁유형 분류</a>
            <a class="btn btn-outline-primary" href="<%= ctx %>/yusa">유사판례 탐색</a>
            <a class="btn btn-outline-primary" href="<%= ctx %>/jogi">조기중재</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features -->
  <div class="row g-3 g-md-4">
    <div class="col-md-6 col-lg-3">
      <div class="card feature-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="icon-badge">⚠️</div>
            <div>
              <div class="fw-bold">법적위험</div>
              <div class="text-muted small">리스크 요약/가이드</div>
            </div>
          </div>
          <p class="text-muted mb-3">입력한 상황을 기반으로 쟁점과 위험 요소를 정리합니다.</p>
          <a class="btn btn-primary w-100" href="<%= ctx %>/law">열기</a>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-lg-3">
      <div class="card feature-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="icon-badge">🧩</div>
            <div>
              <div class="fw-bold">분쟁유형</div>
              <div class="text-muted small">카테고리 분류</div>
            </div>
          </div>
          <p class="text-muted mb-3">분쟁 내용을 유형별로 분류해 다음 액션을 제안합니다.</p>
          <a class="btn btn-primary w-100" href="<%= ctx %>/boonjang">열기</a>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-lg-3">
      <div class="card feature-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="icon-badge">📚</div>
            <div>
              <div class="fw-bold">유사판례</div>
              <div class="text-muted small">검색/비교</div>
            </div>
          </div>
          <p class="text-muted mb-3">유사한 케이스의 판례를 찾아 핵심 포인트를 비교합니다.</p>
          <a class="btn btn-primary w-100" href="<%= ctx %>/yusa">열기</a>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-lg-3">
      <div class="card feature-card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="icon-badge">⏱️</div>
            <div>
              <div class="fw-bold">조기중재</div>
              <div class="text-muted small">빠른 해결</div>
            </div>
          </div>
          <p class="text-muted mb-3">초기 대응 전략과 중재 방향을 빠르게 정리합니다.</p>
          <a class="btn btn-primary w-100" href="<%= ctx %>/jogi">열기</a>
        </div>
      </div>
    </div>
  </div>

</div>
