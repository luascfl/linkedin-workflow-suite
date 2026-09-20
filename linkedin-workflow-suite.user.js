// ==UserScript==
// @name         LinkedIn Workflow Suite
// @namespace    https://github.com/luascfl/linkedin-workflow-suite
// @version      1.3.4
// @description  Migração manual dos fluxos LinkedIn: vagas, alertas, notificações, pessoas e empresas.
// @author       luascfl
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/luascfl/linkedin-workflow-suite/main/linkedin-workflow-suite.user.js
// @downloadURL  https://raw.githubusercontent.com/luascfl/linkedin-workflow-suite/main/linkedin-workflow-suite.user.js
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
  const ROUTE_ACTION_BAR_ID = 'linkedin-workflow-suite-actions';
  const NOTIFICATION_PREFERENCE_ACTIONS = Object.freeze(JSON.parse('[["enter","Pesquisando vaga"],["toggle","Permitir notificações de pesquisa de vagas",true],["enter","Alertas de vaga"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",true],["back"],["enter","Vagas salvas"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",true],["back"],["enter","Recomendações de vagas"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Atualizações sobre candidaturas a vagas"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",true],["back"],["enter","Aconselhamento profissional"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Ocorrências em resultados de pesquisa"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Recomendações de avaliação de competências"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Atualizações de rotas de competências"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["back"],["enter","Contratação"],["toggle","Permitir notificações de anúncios de vaga",false],["enter","Projetos de Service Page"],["toggle","Permitir notificações de trabalho de projeto",false],["back"],["enter","Conexão com outras pessoas"],["toggle","Permitir notificações relacionadas a conexões",true],["enter","Convites para conexão"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Atualizações da sua rede"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Novas recomendações para conexão"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Novos seguidores e assinantes"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Atualizações de pessoas que você segue"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Novas recomendações para seguir"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Visualizações do perfil"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Atualizações dos seus leads de vendas"],["toggle","Notificações no aplicativo",true],["back"],["back"],["enter","Atualizações para ficar por dentro da rede"],["enter","Mudanças de emprego"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["back"],["enter","Contratando"],["toggle","Notificações no aplicativo",false],["back"],["enter","Aniversários"],["toggle","Notificações no aplicativo",true],["back"],["enter","Aniversários de empresa"],["toggle","Notificações no aplicativo",true],["back"],["enter","Formação acadêmica"],["toggle","Notificações no aplicativo",true],["back"],["enter","Resumo semanal"],["toggle","Notificações push",false],["toggle","E-mail",true],["back"],["back"],["enter","Publicar e comentar"],["toggle","Permitir notificações relacionadas a publicações",true],["enter","Comentários e reações"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Compartilhamentos"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Menções"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Conversas em alta"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Vídeos ao vivo"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Newsletters"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Lembretes para publicar"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Artigos colaborativos"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Sugestões de publicações"],["toggle","Notificações no aplicativo",false],["back"],["enter","Vídeos recomendados"],["toggle","Notificações no aplicativo",false],["back"],["back"],["enter","Mensagens"],["toggle","Permitir notificações de mensagens",true],["enter","Mensagens"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",true],["toggle","E-mail",false],["back"],["enter","Lembretes de mensagem"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","InMail"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Lembretes de InMail"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["back"],["enter","Grupos"],["toggle","Permitir notificações de grupos",false],["back"],["enter","Pages"],["toggle","Permitir notificações da Page",false],["back"],["enter","Participar de eventos"],["toggle","Permitir notificações de eventos",false],["back"],["enter","Notícias e relatórios"],["toggle","Permitir notificações dos editores",false],["enter","Relatórios e estatísticas"],["toggle","Permitir notificações sobre relatórios e estatísticas",false],["back"],["enter","Atualização do perfil"],["toggle","Permitir notificações de aprimoramento do perfil",true],["enter","Recomendações de perfis"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Novas recomendações de competências"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Dicas e ofertas para aproveitar o LinkedIn"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["back"],["enter","Verificações"],["toggle","Permitir notificações de verificação",true],["enter","Fazer verificação"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["back"],["enter","Jogos"],["toggle","Permitir notificações sobre jogos",false],["back"]]'));

  class LinkedInJobFilter {
    constructor() {
      this.filters = {
        dismissed: { count: 0, active: true, color: '#01754f', position: 114 },
        promoted: { count: 0, active: true, color: '#0a66c2', position: 175 },
        applied: { count: 0, active: true, color: '#e7a33e', position: 210 },
        viewed: { count: 0, active: false, color: '#cb112d', position: 245 },
        reposted: { count: 0, active: true, color: '#666666', position: 280 },
        keyword: { count: 0, active: false, color: '#666666', position: 315 },
        dismissAll: { active: true, color: '#01754f', position: 350 }
      };

      this.countedJobIds = {
        dismissed: new Set(), promoted: new Set(), applied: new Set(),
        viewed: new Set(), reposted: new Set(), keyword: new Set()
      };
      
      this.badges = {};
      const savedKeywords = typeof GM_getValue === 'function' ? GM_getValue('linkedinKeywords', '') : '';
      this.keywords = savedKeywords ? savedKeywords.split(',').map(k => k.trim()) : BLOCKED_JOB_TERMS;
      this.init();
    }

    isJobPage() {
      return window.location.href.includes('/jobs/search') || window.location.href.includes('/jobs/collections');
    }

    getPageLanguage() { return document.documentElement.lang || 'en'; }

    getLocalizedTerm(term, lang) {
      const terms = {
        dismissed: { pt: "Não exibiremos mais esta vaga a você.", en: "We won't show you this job again." },
        promoted: { pt: "Promovida", en: "Promoted" },
        applied: { pt: "Candidatou-se", en: "Applied" },
        viewed: { pt: "Visualizado", en: "Viewed" },
        reposted: { pt: "Repostado", en: "Ghost Jobs / Reposted" },
        keyword: { pt: "Por Palavras-chave", en: "By Keywords" },
        dismissAll: { pt: "Ignorar Todas", en: "Dismiss All" },
      };
      return terms[term]?.[lang] || terms[term]?.en;
    }

    init() {
      if (!this.isJobPage()) return;
      this.createAllBadges();
      this.applyAllFilters();
      this.setupMutationObserver();
    }

    createAllBadges() {
      Object.keys(this.filters).forEach(type => this.createBadge(type));
    }

    createBadge(type) {
      if (this.badges[type]) return this.badges[type];
      
      const badge = document.createElement('div');
      badge.id = `${type}Badge`;
      badge.className = 'linkedin-workflow-suite-filter-badge';
      badge.style.cssText = `position:fixed;top:${this.filters[type].position}px;right:5px;color:white;padding:4px 6px 4px 13px;border-radius:25px;z-index:22;font-weight:600;display:flex;align-items:center;cursor:pointer;user-select:none;box-shadow:0 4px 8px rgba(0,0,0,0.1);transition:opacity 0.5s, transform 0.6s;`;
      
      if (type === 'dismissAll') {
        badge.onclick = () => this.dismissAllJobs();
        badge.style.opacity = '0.85';
        badge.style.backgroundColor = this.filters[type].color;
      } else {
        badge.onclick = () => this.toggleFilter(type);
        if (type === 'keyword') {
          badge.title = "Clique com o botão direito para editar as palavras-chave";
          badge.oncontextmenu = (e) => {
            e.preventDefault();
            const newKeywords = prompt('Palavras-chave (separadas por vírgula):', this.keywords.join(', '));
            if (newKeywords !== null) {
              this.keywords = newKeywords.split(',').map(k => k.trim()).filter(Boolean);
              if (typeof GM_setValue === 'function') GM_setValue('linkedinKeywords', this.keywords.join(', '));
              this.countedJobIds.keyword.clear();
              this.filters.keyword.count = 0;
              this.applyAllFilters();
            }
          };
        }
      }
      
      this.updateBadgeContent(badge, type);
      document.body.appendChild(badge);
      this.badges[type] = badge;
      return badge;
    }

    updateBadgeContent(badge, type) {
      const filter = this.filters[type];
      badge.innerHTML = '';
      const badgeText = this.getLocalizedTerm(type, this.getPageLanguage());
      badge.appendChild(document.createTextNode(badgeText));
      
      if (type !== 'dismissAll') {
        const countDiv = document.createElement('div');
        countDiv.innerText = filter.active ? filter.count : 'OFF';
        countDiv.style.cssText = 'align-items:center;background-color:#f8fafd;border-radius:20px;color:#00000099;display:inline-flex;font-size:14px;height:20px;justify-content:center;margin-left:5px;min-width:20px;padding:5px;user-select:none;';
        badge.appendChild(countDiv);
        badge.style.opacity = filter.active && filter.count > 0 ? '0.85' : '0.5';
        badge.style.backgroundColor = filter.active ? filter.color : '#666666';
      }
      return badge;
    }

    toggleFilter(type) {
      if (type === 'dismissAll') return;
      const filter = this.filters[type];
      filter.active = !filter.active;
      if (filter.active) {
        filter.count = 0;
        this.countedJobIds[type].clear();
      }
      this.updateBadgeContent(this.badges[type], type);
      this.applyFilter(type);
    }

    setupMutationObserver() {
      let jobContainer = null;
      let timeout = null;
      const observer = new MutationObserver(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (this.isJobPage()) this.applyAllFilters();
        }, 300);
      });

      jobContainer = document.querySelector('.jobs-search-results-list, .jobs-search__results-list');
      observer.observe(jobContainer || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    applyAllFilters() {
      if (!this.isJobPage()) return;
      const allJobs = this.collectAllJobs();
      Object.keys(this.filters).forEach(type => {
        if (type !== 'dismissAll' && this.filters[type].active) {
          this.applyFilter(type, allJobs);
          this.updateBadgeContent(this.badges[type], type);
        }
      });
    }

    collectAllJobs() {
      return Array.from(document.querySelectorAll('li[data-job-id], li[data-occludable-job-id], .job-card-container, .jobs-search-results__list-item'));
    }

    dismissAllJobs() {
      const buttons = Array.from(document.querySelectorAll('button[aria-label^="Fechar vaga"], button[aria-label^="Close job"], button[aria-label^="Cerrar vacante"], button[aria-label^="Fermer loffre"]'));
      buttons.forEach(btn => btn.click());
      this.badges.dismissAll.style.transform = 'scale(1.1)';
      setTimeout(() => { this.badges.dismissAll.style.transform = 'scale(1)'; }, 200);
    }

    applyFilter(type, jobs = null) {
      if (!this.isJobPage()) return;
      const allJobs = jobs || this.collectAllJobs();
      const filterKeyword = this.getLocalizedTerm(type, this.getPageLanguage());
      
      switch(type) {
        case 'dismissed':
          this.filterJobs(allJobs, job => job.classList.contains('job-card-list--is-dismissed') || job.innerText.includes(filterKeyword), type);
          break;
        case 'keyword':
          this.filterJobs(allJobs, job => {
            const jobText = job.innerText.toLowerCase();
            return this.keywords.some(keyword => jobText.includes(keyword.toLowerCase()));
          }, type);
          break;
        default:
          this.filterJobs(allJobs, job => job.innerText.includes(filterKeyword), type);
          break;
      }
      this.updateBadgeContent(this.badges[type], type);
    }

    filterJobs(jobs, criteriaFn, type) {
      if (!this.filters[type].active) return;
      jobs.forEach(job => {
        if (job.style.display !== 'none' && criteriaFn(job)) {
          job.style.display = 'none';
          const parentLi = job.closest('li');
          if (parentLi) parentLi.style.display = 'none';
          
          let jobId = job.getAttribute('data-job-id') || job.getAttribute('data-occludable-job-id') || job.innerText.trim();
          if (!this.countedJobIds[type].has(jobId)) {
            this.countedJobIds[type].add(jobId);
            this.filters[type].count++;
          }
        }
      });
    }
  }

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
    document.getElementById(PANEL_ID)?.remove();
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
      #${ROUTE_ACTION_BAR_ID} { align-items:center; background:#fff; border:1px solid #d0d7de; border-radius:8px; display:flex; flex-wrap:wrap; gap:8px; margin:0 0 16px; padding:10px; }
      #${ROUTE_ACTION_BAR_ID} strong { color:#172033; font:600 14px system-ui,sans-serif; margin-right:4px; }
      #${ROUTE_ACTION_BAR_ID} button { background:#0a66c2; border:0; border-radius:16px; color:#fff; cursor:pointer; font:600 14px system-ui,sans-serif; padding:7px 12px; }
      #${ROUTE_ACTION_BAR_ID} button.danger { background:#b42318; }
      #${ROUTE_ACTION_BAR_ID} .status { color:#374151; flex-basis:100%; font:12px system-ui,sans-serif; min-height:16px; }
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
    const status = document.querySelector(`#${PANEL_ID} .status, #${ROUTE_ACTION_BAR_ID} .status`);
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

  // Removido filterJobs antigo em favor da LinkedInJobFilter

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

  function expandVisibleSectionsSilently() {
    const buttons = [...document.querySelectorAll('button')].filter((button) => /^(mostrar|exibir) mais(?:\b|$)/i.test(normalize(button.textContent)));
    buttons.forEach((button) => button.click());
  }

  function expandVisibleSections() {
    const buttons = [...document.querySelectorAll('button')].filter((button) => /^(mostrar|exibir) mais(?:\b|$)/i.test(normalize(button.textContent)));
    buttons.forEach((button) => button.click());
    setStatus(`${buttons.length} seção(ões) expandidas.`);
  }


  function firstButtonMatching(pattern, root = document) {
    return [...root.querySelectorAll('button')].find((button) => pattern.test(normalize(button.textContent)) || pattern.test(normalize(button.getAttribute('aria-label'))) || pattern.test(normalize(button.getAttribute('title'))));
  }

  async function waitForButton(pattern, timeout = 5000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const button = firstButtonMatching(pattern);
      if (button && !button.disabled) return button;
      await wait(200);
    }
    return null;
  }

  function jobAlertEditButtons() {
    return [...document.querySelectorAll('button')].filter((button) => /editar alerta de vaga/i.test(normalize(button.getAttribute('title'))) || /editar alerta de vaga/i.test(normalize(button.getAttribute('aria-label'))));
  }

  async function deleteAllJobAlerts() {
    const initialCount = jobAlertEditButtons().length;
    if (!initialCount) {
      setStatus('Nenhum alerta de vaga editável foi encontrado.');
      return;
    }
    if (!confirm(`Excluir definitivamente ${initialCount} alerta(s) de vaga? Esta ação não pode ser desfeita.`)) return;

    let deleted = 0;
    while (deleted < initialCount) {
      const editButton = jobAlertEditButtons()[0];
      if (!editButton) break;
      editButton.click();
      const deleteAlert = await waitForButton(/^excluir alerta de vaga$/i);
      if (!deleteAlert) break;
      deleteAlert.click();
      const confirmDelete = await waitForButton(/^excluir$/i);
      if (!confirmDelete) break;
      confirmDelete.click();
      deleted += 1;
      await wait(900);
    }
    setStatus(`${deleted}/${initialCount} alerta(s) de vaga excluído(s).`);
  }

  function frequencyText(alertItem) {
    return normalize(alertItem.querySelector('.display-flex.align-items-center.t-12.t-black--light')?.textContent || alertItem.textContent);
  }

  function clickLabelControl(labelText, inputType) {
    const label = [...document.querySelectorAll('label')].find((element) => normalize(element.textContent) === labelText);
    const controlId = label?.htmlFor;
    const directControl = controlId ? document.getElementById(controlId) : null;
    const nestedControl = label?.querySelector(`input[type="${inputType}"]`);
    const control = directControl || nestedControl;
    if (control && !control.checked) control.click();
    else if (label && !control) label.click();
    return Boolean(control || label);
  }

  async function updateJobAlertPreferences() {
    const alerts = [...document.querySelectorAll('.jam-index-modal--body ul.artdeco-list > li, ul.artdeco-list > li')]
      .filter((item) => frequencyText(item).includes('Frequência: Diário via e-mail e notificação'));
    if (!alerts.length) {
      setStatus('Nenhum alerta diário por e-mail e notificação foi encontrado.');
      return;
    }
    if (!confirm(`Atualizar ${alerts.length} alerta(s) para E-mail e desativar vagas semelhantes?`)) return;

    let updated = 0;
    for (let index = 0; index < alerts.length; index += 1) {
      const alertItem = [...document.querySelectorAll('.jam-index-modal--body ul.artdeco-list > li, ul.artdeco-list > li')]
        .find((item) => frequencyText(item).includes('Frequência: Diário via e-mail e notificação'));
      const editButton = alertItem && firstButtonMatching(/^editar alerta de vaga/i, alertItem);
      if (!editButton) break;
      editButton.click();
      const saveButton = await waitForButton(/^salvar$/i);
      if (!saveButton) break;
      clickLabelControl('E-mail', 'radio');
      const similarJobs = [...document.querySelectorAll('input[type="checkbox"]')].find((input) => {
        const container = input.closest('label, div, section');
        return /vagas semelhantes/i.test(normalize(container?.textContent));
      });
      if (similarJobs?.checked) similarJobs.click();
      saveButton.click();
      updated += 1;
      await wait(900);
    }
    setStatus(`${updated}/${alerts.length} alerta(s) atualizado(s).`);
  }

  function notificationCards() {
    const legacyCards = [...document.querySelectorAll('article.nt-card, .nt-card-list article')];
    if (legacyCards.length) return legacyCards;

    return [...new Set([...document.querySelectorAll('button[aria-label="Mais opções"]')]
      .map((button) => {
        let card = button;
        for (let level = 0; level < 4 && card; level += 1) card = card.parentElement;
        return card;
      })
      .filter(Boolean))];
  }

  function waitForElement(getElement, timeout = 4000) {
    return new Promise((resolve) => {
      let observer;
      const finish = (element) => {
        window.clearTimeout(timer);
        observer?.disconnect();
        resolve(element || null);
      };
      const check = () => {
        const element = getElement();
        if (element) finish(element);
      };
      const timer = window.setTimeout(() => finish(null), timeout);
      observer = new MutationObserver(check);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      check();
    });
  }

  function prepareNotifications(selected) {
    const cards = notificationCards();
    cards.forEach((card) => {
      let checkbox = card.previousElementSibling?.matches('input[data-linkedin-workflow-suite="notification"]')
        ? card.previousElementSibling
        : null;
      if (!checkbox) {
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.linkedinWorkflowSuite = 'notification';
        checkbox.setAttribute('aria-label', 'Selecionar notificação');
        checkbox.style.cssText = 'height:20px;margin:10px;width:20px;';
        card.style.marginLeft = '40px';
        card.before(checkbox);
      }
      if (typeof selected === 'boolean') checkbox.checked = selected;
    });
    setStatus(selected === true
      ? `${cards.length} notificação(ões) selecionada(s).`
      : `${cards.length} notificação(ões) preparada(s) para revisão.`);
  }

  function toggleNotificationSelection() {
    prepareNotifications();
    const checkboxes = [...document.querySelectorAll('input[data-linkedin-workflow-suite="notification"]')];
    const select = !checkboxes.length || !checkboxes.every((checkbox) => checkbox.checked);
    checkboxes.forEach((checkbox) => { checkbox.checked = select; });
    setStatus(select
      ? `${checkboxes.length} notificação(ões) selecionada(s).`
      : 'Seleção de notificações removida.');
  }

  function notificationMenuAnchor() {
    const legacy = document.querySelector('.artdeco-card.nt-pill-list.mb3');
    if (legacy) return legacy;
    const allFilter = [...document.querySelectorAll('[role="radio"]')]
      .find((element) => normalize(element.textContent) === 'Todas');
    return allFilter?.parentElement?.parentElement || null;
  }

  function installLegacyNotificationMenu() {
    installStyles();
    prepareNotifications();
    if (document.getElementById('linkedin-workflow-suite-notification-menu')) return;
    const anchor = notificationMenuAnchor();
    if (!anchor) return;

    const container = document.createElement('div');
    container.id = 'linkedin-workflow-suite-notification-menu';
    container.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;';
    const addLegacyButton = (label, handler, danger = false) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.type = 'button';
      button.dataset.linkedinWorkflowSuite = 'notification-menu';
      button.style.cssText = `background:${danger ? '#b42318' : '#0a66c2'};border:0;border-radius:16px;color:#fff;cursor:pointer;font:600 14px system-ui,sans-serif;padding:7px 12px;`;
      button.addEventListener('click', () => Promise.resolve(handler()).catch((error) => setStatus(error.message)));
      container.append(button);
    };

    addLegacyButton('Selecionar Tudo', toggleNotificationSelection);
    addLegacyButton('Excluir Notificações', deleteSelectedNotifications, true);
    anchor.after(container);
  }

  async function dismissNotification(card) {
    const legacyDismiss = card.querySelector('[data-control-name="dismiss"], [href="#trash-medium"]');
    if (legacyDismiss) {
      legacyDismiss.click();
      return true;
    }

    const more = card.querySelector('button[aria-label="Mais opções"]');
    if (!more) return false;
    more.click();
    const dismiss = await waitForElement(() => [...document.querySelectorAll('[role="menuitem"]')]
      .find((element) => normalize(element.textContent) === 'Excluir notificação'));
    if (!dismiss) return false;
    dismiss.click();
    await waitForElement(() => !document.querySelector('[role="menu"]') ? document.body : null);
    return true;
  }

  async function deleteSelectedNotifications() {
    const selected = [...document.querySelectorAll('input[data-linkedin-workflow-suite="notification"]:checked')];
    if (!selected.length) {
      setStatus('Selecione ao menos uma notificação antes de excluir.');
      return;
    }
    if (!confirm(`Excluir definitivamente ${selected.length} notificação(ões) selecionada(s)?`)) return;
    let deleted = 0;
    for (const checkbox of selected) {
      if (await dismissNotification(checkbox.nextElementSibling)) deleted += 1;
    }
    setStatus(`${deleted}/${selected.length} notificação(ões) excluída(s).`);
  }

  function jobIdFromInput(value) {
    const match = normalize(value).match(/(?:jobs\/view\/|\b)(\d{6,})\b/);
    return match ? match[1] : '';
  }

  async function dismissVisibleJob(jobId) {
    const card = [...document.querySelectorAll('li[data-job-id], li[data-occludable-job-id], .job-card-container, div[data-job-id]')]
      .find((element) => element.dataset.jobId === jobId || element.dataset.occludableJobId === jobId || element.querySelector(`a[href*="/jobs/view/${jobId}"]`));
    const dismiss = card?.querySelector('button[data-control-name="dismiss_job"], button[aria-label^="Fechar vaga"], button[aria-label^="Close job"], button.job-card-container__action');
    if (!dismiss) {
      setStatus(`A vaga ${jobId} não está visível ou não oferece ação para ignorar.`);
      return;
    }
    if (!confirm(`Ignorar a vaga ${jobId}?`)) return;
    dismiss.click();
    setStatus(`Vaga ${jobId} marcada para ignorar.`);
  }

  async function dismissJobById() {
    const requested = prompt('ID ou URL da vaga que deve ser ignorada:');
    if (requested === null) return;
    const jobId = jobIdFromInput(requested);
    if (!jobId) {
      setStatus('Informe um ID numérico ou uma URL de vaga válida.');
      return;
    }
    await dismissVisibleJob(jobId);
  }

  async function dismissJobFromLegacyCookie() {
    const value = document.cookie.split('; ')
      .find((entry) => entry.startsWith('vagaHref='))
      ?.split('=')
      .slice(1)
      .join('=');
    const jobId = jobIdFromInput(decodeURIComponent(value || ''));
    if (!jobId) {
      setStatus('O cookie legado vagaHref não contém uma vaga para ignorar.');
      return;
    }
    await dismissVisibleJob(jobId);
  }

  function preferenceToggle(labelText, desired) {
    const labels = [...document.querySelectorAll('span, p, label')]
      .filter((element) => normalize(element.textContent) === labelText);
    const label = labels[0];
    if (!label) return false;
    const container = label.closest('label, li, div, section') || label.parentElement;
    const input = container?.querySelector('input[type="checkbox"]');
    if (!input) return false;
    if (input.checked !== desired) input.click();
    return true;
  }

  async function enterPreferenceCategory(categoryName) {
    const category = [...document.querySelectorAll('p.category-text__name, span.category-text__name, [role="button"], a, button')]
      .find((element) => normalize(element.textContent) === categoryName);
    const target = category?.closest('a, button, [role="button"]') || category;
    if (!target) return false;
    target.click();
    await wait(500);
    return true;
  }

  async function goBackInPreferences() {
    const back = document.querySelector('a[data-control-name="back_link"], a.banner-link--back, button[aria-label="Voltar"]');
    if (!back) return false;
    back.click();
    await wait(500);
    return true;
  }

  async function applyArchivedNotificationPreferences() {
    if (!confirm('Aplicar o perfil legado de 209 ajustes de notificações? O LinkedIn poderá mudar preferências de e-mail, push e aplicativo.')) return;
    let applied = 0;
    for (const action of NOTIFICATION_PREFERENCE_ACTIONS) {
      const [type, label, desired] = action;
      const success = type === 'enter'
        ? await enterPreferenceCategory(label)
        : type === 'toggle'
          ? preferenceToggle(label, desired)
          : await goBackInPreferences();
      if (!success) {
        setStatus(`Perfil interrompido: “${label || 'Voltar'}” não foi encontrado após ${applied} ajuste(s).`);
        return;
      }
      applied += 1;
      await wait(300);
    }
    setStatus(`Perfil legado aplicado: ${applied} etapa(s).`);
  }

  function routeActionDefinitions() {
    if (location.pathname.startsWith('/jobs/search')) {
      return {
        title: 'Vagas',
        actions: [
          ['Salvar vagas visíveis na central', saveVisibleJobs],
          ['Ignorar vaga pelo ID', dismissJobById],
          ['Ignorar vaga marcada pelo fluxo legado', dismissJobFromLegacyCookie],
        ],
      };
    }
    if (location.pathname.startsWith('/jobs/jam') || location.pathname.startsWith('/jobs/alerts/manage')) {
      return {
        title: 'Alertas de vaga',
        actions: [
          ['Expandir alertas visíveis', expandVisibleSections],
          ['Atualizar preferências dos alertas', updateJobAlertPreferences],
          ['Excluir todos os alertas', deleteAllJobAlerts, 'danger'],
        ],
      };
    }
    if (location.pathname.startsWith('/search/results/companies')) {
      return { title: 'Empresas', actions: [['Seguir empresas visíveis', () => performVisibleButtonAction('Seguir', 'Seguir')]] };
    }
    if (location.pathname.startsWith('/search/results/people') || location.pathname.startsWith('/mynetwork')) {
      return { title: 'Pessoas', actions: [['Conectar com pessoas visíveis', () => performVisibleButtonAction('Conectar', 'Conectar')]] };
    }
    if (location.pathname.startsWith('/mypreferences/d/categories/notifications')) {
      return { title: 'Preferências de notificação', actions: [['Aplicar perfil legado de notificações', applyArchivedNotificationPreferences, 'danger']] };
    }
    return null;
  }

  function installRouteActionBar() {
    const definition = routeActionDefinitions();
    if (!definition || document.getElementById(ROUTE_ACTION_BAR_ID)) return;
    const main = document.querySelector('main, [role="main"]');
    if (!main) return;
    installStyles();
    const bar = document.createElement('section');
    bar.id = ROUTE_ACTION_BAR_ID;
    const title = document.createElement('strong');
    title.textContent = `LinkedIn: ${definition.title}`;
    bar.append(title);
    definition.actions.forEach(([label, handler, className = '']) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.className = className;
      button.addEventListener('click', () => Promise.resolve(handler()).catch((error) => setStatus(error.message)));
      bar.append(button);
    });
    const status = document.createElement('span');
    status.className = 'status';
    status.setAttribute('role', 'status');
    bar.append(status);
    main.prepend(bar);
  }

  function registerLegacyCommand(label, matchesCurrentRoute, destination, action) {
    GM_registerMenuCommand(label, () => {
      if (!matchesCurrentRoute()) {
        location.assign(`https://www.linkedin.com${destination}`);
        alert('A página necessária foi aberta. Execute novamente este comando após o carregamento.');
        return;
      }
      Promise.resolve(action()).catch((error) => alert(`LinkedIn Workflow Suite: ${error.message}`));
    });
  }

  function registerLegacyCommands() {
    registerLegacyCommand('LinkedIn: salvar vagas visíveis na central', () => location.pathname.startsWith('/jobs/search'), '/jobs/search/', saveVisibleJobs);
    registerLegacyCommand('LinkedIn: ignorar vaga marcada pelo fluxo legado', () => location.pathname.startsWith('/jobs/search'), '/jobs/search/', dismissJobFromLegacyCookie);
    registerLegacyCommand('LinkedIn: expandir alertas de vaga', () => location.pathname.startsWith('/jobs/jam') || location.pathname.startsWith('/jobs/alerts/manage'), '/jobs/jam/', expandVisibleSections);
    registerLegacyCommand('LinkedIn: atualizar preferências dos alertas', () => location.pathname.startsWith('/jobs/jam') || location.pathname.startsWith('/jobs/alerts/manage'), '/jobs/jam/', updateJobAlertPreferences);
    registerLegacyCommand('LinkedIn: excluir todos os alertas', () => location.pathname.startsWith('/jobs/jam') || location.pathname.startsWith('/jobs/alerts/manage'), '/jobs/jam/', deleteAllJobAlerts);
    registerLegacyCommand('LinkedIn: expandir tópicos em alta', () => location.pathname.startsWith('/feed'), '/feed/', expandVisibleSections);
    registerLegacyCommand('LinkedIn: seguir empresas visíveis', () => location.pathname.startsWith('/search/results/companies'), '/search/results/companies/', () => performVisibleButtonAction('Seguir', 'Seguir'));
    registerLegacyCommand('LinkedIn: conectar com pessoas visíveis', () => location.pathname.startsWith('/search/results/people') || location.pathname.startsWith('/mynetwork'), '/mynetwork/', () => performVisibleButtonAction('Conectar', 'Conectar'));
    registerLegacyCommand('LinkedIn: ativar seleção de notificações', () => location.pathname.startsWith('/notifications'), '/notifications/?filter=all', installLegacyNotificationMenu);
    registerLegacyCommand('LinkedIn: excluir notificações selecionadas', () => location.pathname.startsWith('/notifications'), '/notifications/?filter=all', deleteSelectedNotifications);
    registerLegacyCommand('LinkedIn: aplicar perfil legado de notificações', () => location.pathname.startsWith('/mypreferences/d/categories/notifications'), '/mypreferences/d/categories/notifications', applyArchivedNotificationPreferences);
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
      addButton('Salvar vagas visíveis na central', saveVisibleJobs);
      addButton('Ignorar vaga pelo ID', dismissJobById, 'secondary');
      addButton('Ignorar vaga marcada pelo fluxo legado', dismissJobFromLegacyCookie, 'secondary');
    }
    if (location.pathname.startsWith('/jobs/jam') || location.pathname.startsWith('/jobs/alerts/manage')) {
      addButton('Expandir alertas visíveis', expandVisibleSections);
      addButton('Atualizar preferências dos alertas', updateJobAlertPreferences, 'secondary');
      addButton('Excluir todos os alertas', deleteAllJobAlerts, 'danger');
    }
    if (location.pathname.startsWith('/feed')) {
      addButton('Expandir tópicos visíveis', expandVisibleSections);
    }
    if (location.pathname.startsWith('/search/results/companies')) {
      addButton('Seguir empresas visíveis', () => performVisibleButtonAction('Seguir', 'Seguir'));
    }
    if (location.pathname.startsWith('/search/results/people') || location.pathname.startsWith('/mynetwork')) {
      addButton('Conectar com pessoas visíveis', () => performVisibleButtonAction('Conectar', 'Conectar'));
    }
    if (!configuredAdapter()) addButton('Configurar adapter', configureAdapter, 'secondary');
    panel.append(actions);
    document.body.append(panel);
  }

  let previousPath = '';
  const renderForRoute = () => {
    const routeChanged = location.pathname !== previousPath;
    previousPath = location.pathname;
    if (location.pathname.startsWith('/feed')) expandVisibleSectionsSilently();
    
    // Garante inicialização das badges visuais na página de vagas
    if (location.pathname.startsWith('/jobs/search') && !document.querySelector('.linkedin-workflow-suite-filter-badge')) {
      new LinkedInJobFilter();
    }
    installRouteActionBar();
    if (!routeChanged) return;
    if (configuredAdapter()) {
      document.getElementById(PANEL_ID)?.remove();
      return;
    }
    mountPanel();
  };

  if (!configuredAdapter()) GM_registerMenuCommand('Configurar Workflow Sheets Adapter', configureAdapter);
  GM_registerMenuCommand('Reabrir painel LinkedIn Workflow Suite', mountPanel);
  registerLegacyCommands();
  renderForRoute();
  new MutationObserver(renderForRoute).observe(document.documentElement, { childList: true, subtree: true });
})();
