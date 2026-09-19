// ==UserScript==
// @name         LinkedIn Workflow Suite
// @namespace    https://github.com/luascfl/linkedin-workflow-suite
// @version      1.0.0
// @description  Controles manuais para filtrar vagas, salvar vagas na central e gerenciar ações visíveis do LinkedIn.
// @author       luascfl
// @license      MIT
// @match        https://www.linkedin.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect       script.google.com
// @run-at        document-idle
// ==/UserScript==

(() => {
  'use strict';

  const STORAGE_KEYS = Object.freeze({
    endpoint: 'workflowSheetsEndpoint',
    token: 'workflowSheetsAccessToken',
  });
  const BLOCKED_JOB_TERMS = Object.freeze([
    'assistente', 'auxiliar', 'recepcionista', 'atendente', 'trainee', 'caixa',
    'teleatendente', 'passador', 'enfermagem', 'especialista', 'farmácia',
    'lauro de freitas', 'professor', 'recepção', 'técnico', 'temporário', 'voluntário',
  ]);
  const MAX_BULK_ACTIONS = 20;
  const PANEL_ID = 'linkedin-workflow-suite-panel';
  const HIDDEN_CLASS = 'linkedin-workflow-suite-hidden';

  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

  function configuredAdapter() {
    const endpoint = GM_getValue(STORAGE_KEYS.endpoint, '');
    const accessToken = GM_getValue(STORAGE_KEYS.token, '');
    return endpoint && accessToken ? { endpoint, accessToken } : null;
  }

  function configureAdapter() {
    const current = configuredAdapter() || { endpoint: '', accessToken: '' };
    const endpoint = prompt('URL /exec do Workflow Sheets Adapter:', current.endpoint);
    if (endpoint === null) return;
    const accessToken = prompt('Token de acesso do adapter:', current.accessToken);
    if (accessToken === null) return;
    GM_setValue(STORAGE_KEYS.endpoint, endpoint.trim());
    GM_setValue(STORAGE_KEYS.token, accessToken.trim());
    setStatus('Adapter configurado neste navegador.');
  }

  function requestAdapter(operation, payload) {
    const adapter = configuredAdapter();
    if (!adapter) {
      return Promise.reject(new Error('Configure o Workflow Sheets Adapter pelo menu do userscript antes de salvar vagas.'));
    }

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: adapter.endpoint,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ operation, accessToken: adapter.accessToken, ...payload }),
        onload: ({ status, responseText }) => {
          if (status < 200 || status >= 300) {
            reject(new Error(`Adapter retornou HTTP ${status}.`));
            return;
          }
          try {
            const response = JSON.parse(responseText);
            if (!response.ok) throw new Error(response.error || 'Adapter recusou a operação.');
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        onerror: () => reject(new Error('Não foi possível alcançar o Workflow Sheets Adapter.')),
      });
    });
  }

  function installStyles() {
    if (document.getElementById(`${PANEL_ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${PANEL_ID}-styles`;
    style.textContent = `
      .${HIDDEN_CLASS} { display: none !important; }
      #${PANEL_ID} { background: #fff; border: 1px solid #d0d7de; border-radius: 10px; box-shadow: 0 4px 20px #0002; color: #172033; font: 14px system-ui, sans-serif; inset: auto 18px 18px auto; padding: 12px; position: fixed; width: 280px; z-index: 2147483647; }
      #${PANEL_ID} h2 { font-size: 15px; margin: 0 0 8px; }
      #${PANEL_ID} p { font-size: 12px; line-height: 1.4; margin: 8px 0; }
      #${PANEL_ID} .actions { display: grid; gap: 6px; }
      #${PANEL_ID} button { background: #0a66c2; border: 0; border-radius: 6px; color: #fff; cursor: pointer; font: inherit; padding: 8px; text-align: left; }
      #${PANEL_ID} button.secondary { background: #4b5563; }
      #${PANEL_ID} button.danger { background: #b42318; }
      #${PANEL_ID} .status { color: #374151; min-height: 18px; }
    `;
    document.head.append(style);
  }

  function currentSurface() {
    const path = location.pathname;
    if (path.startsWith('/jobs/search')) return 'Busca de vagas';
    if (path.startsWith('/jobs/jam') || path.startsWith('/jobs/alerts/manage')) return 'Alertas de vagas';
    if (path.startsWith('/notifications')) return 'Notificações';
    if (path.startsWith('/feed')) return 'Feed';
    if (path.startsWith('/search/results/companies')) return 'Empresas';
    if (path.startsWith('/search/results/people') || path.startsWith('/mynetwork')) return 'Pessoas';
    if (path.startsWith('/mypreferences/d/categories/notifications')) return 'Preferências de notificação';
    return 'LinkedIn';
  }

  function setStatus(message) {
    const status = document.querySelector(`#${PANEL_ID} .status`);
    if (status) status.textContent = message;
  }

  function matchingButtons(label) {
    return [...document.querySelectorAll('button')]
      .filter((button) => normalize(button.textContent).toLocaleLowerCase('pt-BR') === label.toLocaleLowerCase('pt-BR'));
  }

  async function performVisibleButtonAction(label, verb) {
    const buttons = matchingButtons(label).slice(0, MAX_BULK_ACTIONS);
    if (!buttons.length) {
      setStatus(`Nenhum botão “${label}” visível.`);
      return;
    }
    if (!confirm(`${verb} ${buttons.length} item(ns) visível(is)? Esta ação será enviada ao LinkedIn.`)) return;
    for (const button of buttons) {
      if (button.isConnected && !button.disabled) {
        button.click();
        await wait(850);
      }
    }
    setStatus(`${verb}: ${buttons.length} ação(ões) solicitada(s).`);
  }

  function jobCards() {
    return [...document.querySelectorAll('li.jobs-search-results__list-item, .job-card-container, .jobs-search-results__list-item')]
      .filter((card) => card.querySelector('a[href*="/jobs/view/"]'));
  }

  function jobData(card) {
    const link = card.querySelector('a[href*="/jobs/view/"]');
    const text = normalize(card.textContent);
    const title = normalize(card.querySelector('[class*="job-card-list__title"], [class*="job-card-container__link"], strong')?.textContent || link?.textContent);
    const company = normalize(card.querySelector('[class*="primary-description"], [class*="job-card-container__company-name"]')?.textContent);
    const location = normalize(card.querySelector('[class*="secondary-description"], [class*="job-card-container__metadata-item"]')?.textContent);
    return { card, text, title, company, location, url: link ? new URL(link.href, window.location.origin).href.split('?')[0] : '' };
  }

  function filterJobs() {
    let hidden = 0;
    jobCards().forEach((card) => {
      const job = jobData(card);
      const shouldHide = BLOCKED_JOB_TERMS.some((term) => job.text.toLocaleLowerCase('pt-BR').includes(term));
      card.classList.toggle(HIDDEN_CLASS, shouldHide);
      if (shouldHide) hidden += 1;
    });
    setStatus(`${hidden} vaga(s) filtrada(s) nesta página.`);
  }

  async function saveVisibleJobs() {
    const jobs = jobCards().map(jobData).filter((job) => job.title && job.url);
    if (!jobs.length) {
      setStatus('Nenhuma vaga visível com título e link para salvar.');
      return;
    }
    if (!confirm(`Salvar ${jobs.length} vaga(s) visível(is) na aba Alertas LinkedIn da planilha central?`)) return;
    let saved = 0;
    for (const job of jobs) {
      await requestAdapter('appendJobAlert', { alert: job });
      saved += 1;
    }
    setStatus(`${saved} vaga(s) salva(s) na planilha central.`);
  }

  function expandVisibleSections() {
    const buttons = [...document.querySelectorAll('button')].filter((button) => /^(mostrar|exibir) mais$/i.test(normalize(button.textContent)));
    buttons.forEach((button) => button.click());
    setStatus(`${buttons.length} seção(ões) expandidas.`);
  }

  function selectNotifications() {
    const cards = document.querySelectorAll('article.nt-card, .nt-card-list article');
    cards.forEach((card) => {
      if (card.previousElementSibling?.matches('input[data-linkedin-workflow-suite]')) return;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.linkedinWorkflowSuite = 'notification';
      checkbox.setAttribute('aria-label', 'Selecionar notificação');
      checkbox.style.cssText = 'height:20px;margin:10px;width:20px;';
      card.before(checkbox);
    });
    setStatus(`${cards.length} notificação(ões) marcável(is). A remoção continua manual no menu de cada item.`);
  }

  function mountPanel() {
    installStyles();
    const oldPanel = document.getElementById(PANEL_ID);
    if (oldPanel) oldPanel.remove();
    const panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.innerHTML = `<h2>LinkedIn Workflow Suite</h2><p>${currentSurface()}</p><div class="actions"></div><p class="status"></p>`;
    const actions = panel.querySelector('.actions');
    const addButton = (label, handler, className = '') => {
      const button = document.createElement('button');
      button.textContent = label;
      button.className = className;
      button.addEventListener('click', () => Promise.resolve(handler()).catch((error) => setStatus(error.message)));
      actions.append(button);
    };

    if (location.pathname.startsWith('/jobs/search')) {
      addButton('Filtrar vagas visíveis', filterJobs);
      addButton('Salvar vagas visíveis na central', saveVisibleJobs);
    }
    if (location.pathname.startsWith('/jobs/jam') || location.pathname.startsWith('/jobs/alerts/manage') || location.pathname.startsWith('/feed')) {
      addButton('Expandir seções visíveis', expandVisibleSections);
    }
    if (location.pathname.startsWith('/search/results/companies')) {
      addButton('Seguir empresas visíveis', () => performVisibleButtonAction('Seguir', 'Seguir'));
    }
    if (location.pathname.startsWith('/search/results/people') || location.pathname.startsWith('/mynetwork')) {
      addButton('Conectar com pessoas visíveis', () => performVisibleButtonAction('Conectar', 'Conectar'));
    }
    if (location.pathname.startsWith('/notifications')) {
      addButton('Marcar notificações visíveis', selectNotifications);
    }
    addButton('Configurar adapter', configureAdapter, 'secondary');
    panel.append(actions);
    document.body.append(panel);
  }

  let previousPath = '';
  const renderForRoute = () => {
    if (location.pathname === previousPath && document.getElementById(PANEL_ID)) return;
    previousPath = location.pathname;
    mountPanel();
  };

  GM_registerMenuCommand('Configurar Workflow Sheets Adapter', configureAdapter);
  GM_registerMenuCommand('Reabrir painel LinkedIn Workflow Suite', mountPanel);
  renderForRoute();
  new MutationObserver(renderForRoute).observe(document.documentElement, { childList: true, subtree: true });
})();
