// Generates the standard app shell HTML (sidebar + topbar + content area)
export function appShell(title, contentHtml, extraHead = '') {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Prêmio por Indicação</title>
  <link rel="stylesheet" href="../css/main.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
  ${extraHead}
</head>
<body>
  <div class="app-layout">
    <aside class="sidebar" id="sidebar"></aside>
    <div class="main-content">
      <header class="topbar">
        <div class="flex items-center gap-3">
          <button class="hamburger" id="hamburger">☰</button>
          <span class="topbar-title">${title}</span>
        </div>
        <div class="topbar-actions" id="topbar-actions"></div>
      </header>
      <main class="page-content" id="page-content">
        ${contentHtml}
      </main>
    </div>
  </div>
`;
}
