<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.springframework.security.core.context.SecurityContextHolder" %>
<%@ page import="org.springframework.security.core.Authentication" %>
<%@ page import="org.springframework.security.core.GrantedAuthority" %>
<%@ page import="com.oracle.Legal.dto.AccountDto" %>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>LEGALAI - 메인</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="d-flex flex-column min-vh-100">
<jsp:include page="/WEB-INF/views/common/header.jsp"/>

<%
  Authentication auth = SecurityContextHolder.getContext().getAuthentication();

  boolean loggedIn = false;
  boolean isAdmin = false;

  // ✅ 로그인 방식 유지 (principal이 AccountDto일 때만 로그인 처리)
  if (auth != null && auth.getPrincipal() instanceof AccountDto) {
      loggedIn = true;

      // ✅ ROLE_ADMIN 판단
      for (GrantedAuthority ga : auth.getAuthorities()) {
          if ("ROLE_ADMIN".equals(ga.getAuthority())) {
              isAdmin = true;
              break;
          }
      }
  }
%>

<%-- ✅ ROLE에 따라 다른 본문 include --%>
<% if (loggedIn && isAdmin) { %>
  <jsp:include page="/WEB-INF/views/main/main_admin.jsp"/>
<% } else { %>
  <jsp:include page="/WEB-INF/views/main/main_user.jsp"/>
<% } %>

<jsp:include page="/WEB-INF/views/common/footer.jsp"/>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
