// ==UserScript==
// @name         LinkedIn Workflow Suite
// @namespace    https://github.com/luascfl/linkedin-workflow-suite
// @version      1.1.0
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
  const HIDDEN_CLASS = 'linkedin-workflow-suite-hidden';
  const NOTIFICATION_PREFERENCE_ACTIONS = Object.freeze(JSON.parse('[["enter","Pesquisando vaga"],["toggle","Permitir notificações de pesquisa de vagas",true],["enter","Alertas de vaga"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",true],["back"],["enter","Vagas salvas"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",true],["back"],["enter","Recomendações de vagas"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Atualizações sobre candidaturas a vagas"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",true],["back"],["enter","Aconselhamento profissional"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Ocorrências em resultados de pesquisa"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Recomendações de avaliação de competências"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Atualizações de rotas de competências"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["back"],["enter","Contratação"],["toggle","Permitir notificações de anúncios de vaga",false],["enter","Projetos de Service Page"],["toggle","Permitir notificações de trabalho de projeto",false],["back"],["enter","Conexão com outras pessoas"],["toggle","Permitir notificações relacionadas a conexões",true],["enter","Convites para conexão"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Atualizações da sua rede"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Novas recomendações para conexão"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Novos seguidores e assinantes"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Atualizações de pessoas que você segue"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Novas recomendações para seguir"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Visualizações do perfil"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Atualizações dos seus leads de vendas"],["toggle","Notificações no aplicativo",true],["back"],["back"],["enter","Atualizações para ficar por dentro da rede"],["enter","Mudanças de emprego"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["back"],["enter","Contratando"],["toggle","Notificações no aplicativo",false],["back"],["enter","Aniversários"],["toggle","Notificações no aplicativo",true],["back"],["enter","Aniversários de empresa"],["toggle","Notificações no aplicativo",true],["back"],["enter","Formação acadêmica"],["toggle","Notificações no aplicativo",true],["back"],["enter","Resumo semanal"],["toggle","Notificações push",false],["toggle","E-mail",true],["back"],["back"],["enter","Publicar e comentar"],["toggle","Permitir notificações relacionadas a publicações",true],["enter","Comentários e reações"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Compartilhamentos"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Menções"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Conversas em alta"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Vídeos ao vivo"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Newsletters"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Lembretes para publicar"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Artigos colaborativos"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Sugestões de publicações"],["toggle","Notificações no aplicativo",false],["back"],["enter","Vídeos recomendados"],["toggle","Notificações no aplicativo",false],["back"],["back"],["enter","Mensagens"],["toggle","Permitir notificações de mensagens",true],["enter","Mensagens"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",true],["toggle","E-mail",false],["back"],["enter","Lembretes de mensagem"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","InMail"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Lembretes de InMail"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["back"],["enter","Grupos"],["toggle","Permitir notificações de grupos",false],["back"],["enter","Pages"],["toggle","Permitir notificações da Page",false],["back"],["enter","Participar de eventos"],["toggle","Permitir notificações de eventos",false],["back"],["enter","Notícias e relatórios"],["toggle","Permitir notificações dos editores",false],["enter","Relatórios e estatísticas"],["toggle","Permitir notificações sobre relatórios e estatísticas",false],["back"],["enter","Atualização do perfil"],["toggle","Permitir notificações de aprimoramento do perfil",true],["enter","Recomendações de perfis"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["enter","Novas recomendações de competências"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["enter","Dicas e ofertas para aproveitar o LinkedIn"],["toggle","Notificações no aplicativo",false],["toggle","E-mail",false],["back"],["back"],["enter","Verificações"],["toggle","Permitir notificações de verificação",true],["enter","Fazer verificação"],["toggle","Notificações no aplicativo",true],["toggle","Notificações push",false],["toggle","E-mail",false],["back"],["back"],["enter","Jogos"],["toggle","Permitir notificações sobre jogos",false],["back"]]'));

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
    return [...document.querySelectorAll('article.nt-card, .nt-card-list article')];
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
        card.before(checkbox);
      }
      if (typeof selected === 'boolean') checkbox.checked = selected;
    });
    setStatus(selected === true
      ? `${cards.length} notificação(ões) selecionada(s).`
      : `${cards.length} notificação(ões) preparada(s) para revisão.`);
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
      const card = checkbox.nextElementSibling;
      const dismiss = card?.querySelector('[data-control-name="dismiss"]');
      if (!dismiss) continue;
      dismiss.click();
      deleted += 1;
      await wait(125);
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
    if (location.pathname.startsWith('/notifications')) {
      addButton('Selecionar todas as notificações', () => prepareNotifications(true));
      addButton('Preparar notificações para revisão', prepareNotifications, 'secondary');
      addButton('Excluir notificações selecionadas', deleteSelectedNotifications, 'danger');
    }
    if (location.pathname.startsWith('/mypreferences/d/categories/notifications')) {
      addButton('Aplicar perfil legado de notificações', applyArchivedNotificationPreferences, 'danger');
    }
    addButton('Configurar adapter', configureAdapter, 'secondary');
    panel.append(actions);
    document.body.append(panel);
  }

  let previousPath = '';
  const renderForRoute = () => {
    if (location.pathname === previousPath) return;
    previousPath = location.pathname;
    if (configuredAdapter()) {
      document.getElementById(PANEL_ID)?.remove();
      return;
    }
    mountPanel();
  };

  GM_registerMenuCommand('Configurar Workflow Sheets Adapter', configureAdapter);
  GM_registerMenuCommand('Reabrir painel LinkedIn Workflow Suite', mountPanel);
  GM_registerMenuCommand('Ignorar vaga marcada pelo fluxo legado', dismissJobFromLegacyCookie);
  renderForRoute();
  new MutationObserver(renderForRoute).observe(document.documentElement, { childList: true, subtree: true });
})();
