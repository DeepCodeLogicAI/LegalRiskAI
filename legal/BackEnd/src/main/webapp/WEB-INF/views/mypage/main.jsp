<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.springframework.security.core.context.SecurityContextHolder" %>
<%@ page import="org.springframework.security.core.Authentication" %>
<%@ page import="com.oracle.Legal.dto.AccountDto" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>마이페이지</title>
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
    width: 72px; height: 72px;
    border-radius: 22px;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
    border: 1px solid rgba(15, 23, 42, .06);
  }

  .kv {
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding: 10px 0;
    border-top: 1px solid #f1f5f9;
    font-size: 14px;
  }
  .kv:first-child { border-top: 0; padding-top: 0; }
  .kv .k { color:#64748b; }
  .kv .v { font-weight:600; color:#0f172a; }

  .chip{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: #eef2ff;
    color: #1d4ed8;
  }

  .table thead th{
    font-size: 13px;
    color:#64748b;
    font-weight:700;
    white-space: nowrap;
    position: relative;    /* ✅ 클릭 막힘 방지 */
    z-index: 5;            /* ✅ 클릭 막힘 방지 */
  }
  .table tbody td{
    font-size: 14px;
    vertical-align: middle;
  }

  /* ★ 버튼 */
  .star-btn { border:0; background:transparent; padding:0; cursor:pointer; }
</style>
</head>

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
  String username = "";
  Integer clientCode = null;

  if (loggedIn) {
    try { displayName = loginUser.getClient_name(); } catch(Exception e) {}
    try { username = loginUser.getUsername(); } catch(Exception e) {}
    try { clientCode = loginUser.getClient_code(); } catch(Exception e) {}
    if (displayName == null || displayName.isBlank()) displayName = username;
  }
%>

<body class="d-flex flex-column min-vh-100">

<jsp:include page="/WEB-INF/views/common/header.jsp"/>

<div class="container py-4 py-md-5 flex-grow-1">
  <div class="row g-4">

    <!-- LEFT -->
    <div class="col-12 col-lg-4">
      <div class="glass p-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="avatar">👤</div>
          <div>
            <div class="fw-bold fs-4">${user.client_name}</div>
            <div class="text-muted small"><%= username %></div>
          </div>
        </div>

        <div class="mt-3">
          <div class="kv">
            <div class="k">회원 코드</div>
            <div class="v"><%= clientCode != null ? clientCode : "-" %></div>
          </div>
          <div class="kv">
            <div class="k">총 분석 횟수</div>
            <div class="v">${totalCount} 회</div>
          </div>
        </div>

        <div class="d-grid gap-2 mt-4">
          <a class="btn btn-outline-primary" href="<%= ctx %>/mypage/user">회원정보 수정</a>
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="col-12 col-lg-8">
      <div class="glass p-4">
        <div class="mb-3">
          <div class="fw-bold fs-4">내 사건 분석 이력</div>
          <div class="text-muted small">client_code 기준으로 분석 내역이 표시됩니다.</div>
        </div>

        <!-- 필터 + 선택삭제 -->
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div class="d-flex gap-2 align-items-center">
            <select class="form-select form-select-sm" style="width: 180px;"
              onchange="location.href='${pageContext.request.contextPath}/mypage/main?serviceType=' + this.value + '&page=1';">
              <option value="">전체</option>
              <option value="JOGI" ${param.serviceType == 'JOGI' ? 'selected' : ''}>조기위험</option>
              <option value="LAW" ${param.serviceType == 'LAW' ? 'selected' : ''}>법적위험</option>
              <option value="BOONJANG" ${param.serviceType == 'BOONJANG' ? 'selected' : ''}>분쟁위험</option>
              <option value="YUSA" ${param.serviceType == 'YUSA' ? 'selected' : ''}>유사판례</option>
            </select>
          </div>

          <!-- 삭제 버튼은 bulkForm submit -->
          <button type="submit" form="bulkForm" class="btn btn-sm btn-outline-danger"
                  onclick="return confirm('선택한 항목을 삭제하시겠습니까?');">
            선택 삭제
          </button>
        </div>

        <!-- ✅ 삭제용 FORM 하나만 사용 (중첩 form 금지) -->
        <form id="bulkForm" method="post" action="${pageContext.request.contextPath}/mypage/history/delete">
          <!-- 현재 페이지/필터 유지 -->
          <input type="hidden" name="page" value="${page}">
          <input type="hidden" name="serviceTypeFilter" value="${param.serviceType}">

          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th style="width:40px; text-align:center;">
                    <input type="checkbox" id="checkAll">
                  </th>
                  <th style="width:120px;">작성일자</th>
                  <th>사건 요약</th>
                  <th style="width:120px;">서비스 종류</th>
                  <th>관련 법률 요약</th>
                  <th style="width:60px; text-align:center;">★</th>
                  <th style="width:90px;">작업</th>
                </tr>
              </thead>

              <tbody>
                <c:choose>
                  <c:when test="${empty historyList}">
                    <tr>
                      <td colspan="7" class="text-muted text-center py-4">분석 이력이 없습니다.</td>
                    </tr>
                  </c:when>

                  <c:otherwise>
                    <c:forEach var="h" items="${historyList}">
                      <tr>
                        <!-- 체크 -->
                        <td class="text-center">
                          <input type="checkbox" name="selectedKeys" value="${h.serviceType}:${h.serviceCode}">
                        </td>

                        <!-- 작성일자 -->
                        <td class="text-muted" style="white-space:nowrap;">
                          <c:choose>
                            <c:when test="${not empty h.analysisDate}">
                              <fmt:formatDate value="${h.analysisDate}" pattern="yyyy-MM-dd"/>
                            </c:when>
                            <c:otherwise>-</c:otherwise>
                          </c:choose>
                        </td>

                        <!-- 사건 요약 -->
                        <td>
                          <c:choose>
                            <c:when test="${fn:length(h.input) > 10}">
                              <c:out value="${fn:substring(h.input, 0, 10)}"/>...
                            </c:when>
                            <c:otherwise>
                              <c:out value="${h.input}"/>
                            </c:otherwise>
                          </c:choose>
                        </td>

                        <!-- 서비스 종류 -->
                        <td>
                          <c:choose>
                            <c:when test="${h.serviceType == 'JOGI'}">
                              <span class="chip" style="background:#ecfeff; color:#0e7490;">조기위험</span>
                            </c:when>
                            <c:when test="${h.serviceType == 'LAW'}">
                              <span class="chip" style="background:#fef2f2; color:#b91c1c;">법적위험</span>
                            </c:when>
                            <c:when test="${h.serviceType == 'BOONJANG'}">
                              <span class="chip" style="background:#fefce8; color:#a16207;">분쟁위험</span>
                            </c:when>
                            <c:when test="${h.serviceType == 'YUSA'}">
                              <span class="chip" style="background:#eef2ff; color:#1d4ed8;">유사판례</span>
                            </c:when>
                            <c:otherwise>
                              <span class="chip">기타</span>
                            </c:otherwise>
                          </c:choose>
                        </td>

                        <!-- 관련 법률 요약 -->
                        <td class="text-muted">
                          <c:choose>
                            <c:when test="${fn:length(h.output) > 10}">
                              <c:out value="${fn:substring(h.output, 0, 10)}"/>...
                            </c:when>
                            <c:otherwise>
                              <c:out value="${h.output}"/>
                            </c:otherwise>
                          </c:choose>
                        </td>

                        <!-- ★ 토글 (✅ form 중첩 제거: JS로 POST) -->
                        <td class="text-center">
                          <button type="button" class="star-btn"
                                  onclick="toggleMark('${h.serviceType}', '${h.serviceCode}')"
                                  title="즐겨찾기 토글">
                            <c:choose>
                              <c:when test="${h.mark == 1}">
                                <span style="color:#f59e0b; font-size:18px;">★</span>
                              </c:when>
                              <c:otherwise>
                                <span style="color:#d1d5db; font-size:18px;">☆</span>
                              </c:otherwise>
                            </c:choose>
                          </button>
                        </td>

                        <!-- 작업 -->
                        <td>
                          <button type="button" class="btn btn-sm btn-outline-primary"
                            onclick="window.open(
                              '${pageContext.request.contextPath}/mypage/history/${h.serviceType}/${h.serviceCode}',
                              'detail_${h.serviceType}_${h.serviceCode}',
                              'width=900,height=700,scrollbars=yes'
                            )">
                            상세보기
                          </button>
                        </td>
                      </tr>
                    </c:forEach>
                  </c:otherwise>
                </c:choose>
              </tbody>
            </table>
          </div>
        </form>

        <!-- 페이징 (page + serviceType 유지) -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted small">총 ${totalCount}건</div>

          <ul class="pagination pagination-sm mb-0">
            <li class="page-item ${page <= 1 ? 'disabled' : ''}">
              <a class="page-link"
                 href="${pageContext.request.contextPath}/mypage?page=${page-1}&serviceType=${param.serviceType}">‹</a>
            </li>

            <c:forEach var="p" begin="1" end="${totalPages}">
              <li class="page-item ${p == page ? 'active' : ''}">
                <a class="page-link"
                   href="${pageContext.request.contextPath}/mypage?page=${p}&serviceType=${param.serviceType}">${p}</a>
              </li>
            </c:forEach>

            <li class="page-item ${page >= totalPages ? 'disabled' : ''}">
              <a class="page-link"
                 href="${pageContext.request.contextPath}/mypage?page=${page+1}&serviceType=${param.serviceType}">›</a>
            </li>
          </ul>
        </div>

      </div>
    </div>

  </div>
</div>

<jsp:include page="/WEB-INF/views/common/footer.jsp"/>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
/** ✅ ★ 토글: 현재 page/serviceType 유지해서 POST */
function toggleMark(serviceType, serviceCode) {
  const f = document.createElement("form");
  f.method = "post";
  f.action = "${pageContext.request.contextPath}/mypage/history/mark/toggle";

  const page = "${page}";
  const filter = "${param.serviceType}";

  const inputs = [
    ["serviceType", serviceType],
    ["serviceCode", serviceCode],
    ["page", page],
    ["serviceTypeFilter", filter]
  ];

  inputs.forEach(([k, v]) => {
    const i = document.createElement("input");
    i.type = "hidden";
    i.name = k;
    i.value = (v == null ? "" : v);
    f.appendChild(i);
  });

  document.body.appendChild(f);
  f.submit();
}

/** ✅ 체크박스 전체선택 */
document.addEventListener("DOMContentLoaded", function () {
  const checkAll = document.getElementById("checkAll");
  if (!checkAll) return;

  function syncCheckAll() {
    const all = document.querySelectorAll("input[name='selectedKeys']");
    const checked = document.querySelectorAll("input[name='selectedKeys']:checked");
    checkAll.checked = (all.length > 0 && all.length === checked.length);
  }

  checkAll.addEventListener("change", function () {
    const items = document.querySelectorAll("input[name='selectedKeys']");
    items.forEach(item => item.checked = checkAll.checked);
  });

  document.addEventListener("change", function (e) {
    if (e.target && e.target.name === "selectedKeys") {
      syncCheckAll();
    }
  });

  syncCheckAll();
});
</script>

</body>
</html>
