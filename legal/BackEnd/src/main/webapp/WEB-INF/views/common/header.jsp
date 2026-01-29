<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
  <%@ page import="org.springframework.security.core.context.SecurityContextHolder" %>
    <%@ page import="org.springframework.security.core.Authentication" %>
      <%@ page import="com.oracle.Legal.dto.AccountDto" %>
        <%@ page import="org.springframework.security.web.csrf.CsrfToken" %>

          <style>
            body {
              background: #f6f7fb;
            }

            .glass {
              background: rgba(255, 255, 255, .9);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(15, 23, 42, .06);
              border-radius: 18px;
              box-shadow: 0 12px 34px rgba(0, 0, 0, .06);
            }

            .feature-card {
              border: 0;
              border-radius: 18px;
              box-shadow: 0 12px 26px rgba(0, 0, 0, .06);
              transition: transform .12s ease, box-shadow .12s ease;
            }

            .feature-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 18px 36px rgba(0, 0, 0, .10);
            }

            .icon-badge {
              width: 44px;
              height: 44px;
              border-radius: 14px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              background: #f1f5ff;
            }

            .header {
              background: #fff;
              border-bottom: 1px solid #e5e7eb;
            }

            .header-inner {
              position: relative;
              max-width: 1600px;
              margin: 0 auto;
              padding: 0 80px;
              height: 72px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .logo {
              flex-shrink: 0;
            }

            .logo {
              display: flex;
              align-items: center;
              gap: 10px;
              text-decoration: none;
            }

            .logo-icon {
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            }

            .logo-text {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
            }

            .logo-text span {
              color: #3b82f6;
            }

            .nav {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              align-items: center;
              gap: 8px;
              background: #f1f5f9;
              padding: 4px;
              border-radius: 12px;
            }

            .nav a {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px 20px;
              font-size: 14px;
              font-weight: 500;
              color: #64748b;
              text-decoration: none;
              border-radius: 8px;
              transition: all 0.2s;
              white-space: nowrap;
            }

            .nav a:hover {
              background: rgba(255, 255, 255, 0.7);
              color: #3b82f6;
            }

            .nav a.active {
              background: white;
              color: #3b82f6;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .header-user {
              display: flex;
              align-items: center;
              gap: 10px;
              flex-shrink: 0;
            }

            .header-user .hello {
              color: #374151;
              font-weight: 600;
              padding: 0 6px;
              white-space: nowrap;
            }

            .header-user a {
              font-size: 14px;
              text-decoration: none;
              padding: 6px 10px;
              border-radius: 10px;
              color: #4b5563;
              transition: all .15s ease;
            }

            .header-user a:hover {
              background: #f3f4f6;
              color: #111827;
            }

            .btn-join {
              background: #2563eb !important;
              color: #fff !important;
              padding: 8px 14px !important;
              border-radius: 14px !important;
              font-weight: 600;
              box-shadow: 0 6px 14px rgba(37, 99, 235, .22);
            }

            .btn-join:hover {
              filter: brightness(.95);
            }

            .logout-btn {
              border: 0;
              background: transparent;
              font-size: 14px;
              padding: 6px 10px;
              border-radius: 10px;
              color: #4b5563;
              transition: all .15s ease;
            }

            .logout-btn:hover {
              background: #fee2e2;
              color: #dc2626;
            }

            /* ===== User Dropdown (React-like) ===== */
            .header-user {
              position: relative;
            }

            .user-btn {
              border: 0;
              background: transparent;
              padding: 6px 10px;
              border-radius: 10px;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all .15s ease;
            }

            .user-btn:hover {
              background: #f3f4f6;
            }

            .user-btn .user-name {
              color: #374151;
              font-weight: 500;
              padding: 0 8px;
              white-space: nowrap;
            }

            .user-menu {
              position: absolute;
              right: 0;
              top: 100%;
              margin-top: 8px;
              width: 224px;
              /* w-56 */
              border-radius: 12px;
              /* rounded-xl */
              background: #fff;
              border: 1px solid #f3f4f6;
              /* border-gray-100 느낌 */
              box-shadow: 0 18px 36px rgba(0, 0, 0, .10);
              /* shadow-lg */
              padding: 4px 0;
              /* py-1 */
              z-index: 9999;
            }

            .user-menu .menu-head {
              padding: 12px 16px;
              /* px-4 py-3 */
              border-bottom: 1px solid #f3f4f6;
            }

            .user-menu .menu-head .name {
              font-weight: 600;
              color: #111827;
              margin: 0;
            }

            .user-menu .menu-head .sub {
              margin: 2px 0 0 0;
              font-size: 13px;
              color: #6b7280;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .user-menu .menu-item {
              display: flex;
              align-items: center;
              gap: 12px;
              /* gap-3 */
              padding: 10px 16px;
              /* px-4 py-2.5 */
              text-decoration: none;
              color: #374151;
              transition: background .15s ease, color .15s ease;
              width: 100%;
              background: transparent;
              border: 0;
              cursor: pointer;
              font-size: 14px;
            }

            .user-menu .menu-item:hover {
              background: #f9fafb;
              /* hover:bg-gray-50 */
            }

            .user-menu .icon {
              width: 20px;
              height: 20px;
              color: #9ca3af;
              /* text-gray-400 */
              flex: 0 0 20px;
            }

            .user-menu .logout {
              color: #dc2626;
              /* text-red-600 */
            }

            .user-menu .logout:hover {
              background: #fee2e2;
              /* hover:bg-red-50 */
            }

            .user-menu .logout .icon {
              color: #dc2626;
            }
          </style>

          <% Authentication auth=SecurityContextHolder.getContext().getAuthentication(); AccountDto loginUser=null;
            boolean loggedIn=false; if (auth !=null && auth.getPrincipal() instanceof AccountDto) {
            loginUser=(AccountDto) auth.getPrincipal(); loggedIn=true; } String ctx=request.getContextPath(); String
            uri=request.getRequestURI(); String path=uri; if (ctx !=null && !ctx.isBlank() && uri.startsWith(ctx)) {
            path=uri.substring(ctx.length()); } CsrfToken csrf=(CsrfToken) request.getAttribute("_csrf"); String
            activeBoonjang=path.startsWith("/ai-analysis") ? "active" : "" ; String activeLaw=path.startsWith("/law")
            ? "active" : "" ; String activeYusa=path.startsWith("/yusa") ? "active" : "" ; String
            activeJogi=path.startsWith("/jogi") ? "active" : "" ; String displayName="" ; if (loggedIn) {
            displayName=loginUser.getClient_name(); if (displayName==null || displayName.isBlank()) {
            displayName=loginUser.getUsername(); } } %>

            <header class="header">
              <div class="header-inner">
                <a href="<%= ctx %>/" class="logo">
                  <div class="logo-icon">
                    <!-- 레이어 아이콘 (React와 동일) -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="4" rx="1" fill="white" />
                      <rect x="3" y="10" width="18" height="4" rx="1" fill="white" opacity="0.7" />
                      <rect x="3" y="17" width="18" height="4" rx="1" fill="white" opacity="0.4" />
                    </svg>
                  </div>
                  <div class="logo-text">LegalRisk <span>AI</span></div>
                </a>

                <nav class="nav">
                  <a href="<%= ctx %>/ai-analysis">📋 법률 종합 검과</a>
                  <a href="<%= ctx %>/mypage/main">👤 마이페이지</a>
                </nav>

                <div class="header-user" id="userArea">
                  <% if (loggedIn) { %>

                    <button type="button" class="user-btn" id="userBtn">
                      <span class="user-name">👋 <%= displayName %> 님</span>
                    </button>

                    <div class="user-menu" id="userMenu" style="display:none;">
                      <div class="menu-head">
                        <p class="name">
                          <%= displayName %> 님
                        </p>
                        <p class="sub">
                          <%= loginUser.getUsername() %>
                        </p>
                      </div>

                      <a class="menu-item" href="<%= ctx %>/mypage/main">
                        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span>마이페이지</span>
                      </a>

                      <form method="post" action="<%= ctx %>/logout" class="m-0">
                        <% if (csrf !=null) { %>
                          <input type="hidden" name="<%= csrf.getParameterName() %>" value="<%= csrf.getToken() %>" />
                          <% } %>

                            <button type="submit" class="menu-item logout">
                              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                              </svg>
                              <span>로그아웃</span>
                            </button>
                      </form>
                    </div>

                    <% } else { %>
                      <a href="<%= ctx %>/login">로그인</a>
                      <a href="<%= ctx %>/client/join" class="btn-join">회원가입</a>
                      <% } %>
                </div>

              </div>
            </header>

            <script>
              (function () {
                const btn = document.getElementById("userBtn");
                const menu = document.getElementById("userMenu");
                const area = document.getElementById("userArea");

                if (!btn || !menu || !area) return;

                btn.addEventListener("click", function (e) {
                  e.stopPropagation();
                  menu.style.display = (menu.style.display === "none" || !menu.style.display) ? "block" : "none";
                });

                document.addEventListener("mousedown", function (e) {
                  if (!area.contains(e.target)) {
                    menu.style.display = "none";
                  }
                });
              })();
            </script>
            </header>