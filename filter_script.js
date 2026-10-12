class LinkedInJobFilter {
  constructor() {
    // Configuração dos filtros
    this.filters = {
      dismissed: { count: 0, active: true, color: '#01754f', position: 64 },
      promoted: { count: 0, active: true, color: '#0a66c2', position: 125 },
      applied: { count: 0, active: true, color: '#e7a33e', position: 160 },
      viewed: { count: 0, active: false, color: '#cb112d', position: 195 },
      reposted: { count: 0, active: true, color: '#666666', position: 230 },
      keyword: { count: 0, active: false, color: '#666666', position: 265 },
      dismissAll: { active: true, color: '#01754f', position: 300 }
    };

    // Conjuntos para evitar contagem duplicada
    this.countedJobIds = {
      dismissed: new Set(),
      promoted: new Set(),
      applied: new Set(),
      viewed: new Set(),
      reposted: new Set(),
      keyword: new Set()
    };

    // Cache dos badges
    this.badges = {};

// Função para obter o valor de um cookie pelo nome
function getCookie(name) {
    let decodedCookie = decodeURIComponent(document.cookie); // Decodifica o valor do cookie
    let ca = decodedCookie.split(';'); // Divide a string de cookies em um array
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim(); // Remove espaços extras
        if (c.indexOf(name + "=") === 0) { // Verifica se o cookie começa com o nome desejado
            return c.substring(name.length + 1, c.length); // Retorna o valor do cookie
        }
    }
    return ""; // Retorna uma string vazia se o cookie não for encontrado
}

// Palavras-chave para filtrar (personalizável)
const keywords = getCookie('keywords') || ''; // Obtém o valor do cookie 'keywords' ou usa uma string vazia se não encontrado
this.keywords = keywords.split(',').map(k => k.trim()); // Usa a variável keywords, agora extraída do cookie

    // Inicialização
    this.init();
  }

  // Verifica se a página atual é de vagas do LinkedIn
  isJobPage() {
    return window.location.href.includes("/jobs/search") || 
           window.location.href.includes("/jobs/collections");
  }

  // Obtém o idioma da página
  getPageLanguage() {
    return document.documentElement.lang || "en";
  }

  // Dicionário de termos localizados
  getLocalizedTerm(term, lang) {
    const terms = {
      dismissed: {
        en: "We won't show you this job again.",
        ru: "Мы больше не будем показывать вам эту вакансию.",
        hi: "हम आपको यह जॉब फिर से नहीं दिखाएंगे।",
        zh: "我们将不再向您显示此职位。",
        pt: "Não exibiremos mais esta vaga a você.",
        fr: "Vous ne verrez plus cette offre d'emploi.",
        es: "No te volveremos a mostrar este empleo.",
        it: "Non ti mostreremo più questa offerta di lavoro.",
        de: "Sie sehen dieses Jobangebot nicht mehr."
      },
      promoted: {
        en: "Promoted",
        ru: "Продвигается",
        hi: "प्रमोट किया गया",
        zh: "推广",
        pt: "Promovida",
        fr: "Promu(e)",
        es: "Promocionado",
        it: "Promosso",
        de: "Anzeige"
      },
      applied: {
        en: "Applied",
        ru: "Заявка подана",
        hi: "आवेदन किए गए",
        zh: "已申请",
        pt: "Candidatou-se",
        fr: "Candidature envoyée",
        es: "Solicitados",
        it: "Candidature inoltrate",
        de: "Beworben"
      },
      viewed: {
        en: "Viewed",
        ru: "Просмотрено",
        hi: "देखा गया",
        zh: "已查看",
        pt: "Visualizado",
        fr: "Consulté",
        es: "Visto",
        it: "Visualizzato",
        de: "Angesehen"
      },
      reposted: {
        en: "Ghost Jobs / Reposted",
        ru: "Перепост",
        hi: "पुनर्प्रस्तुत",
        zh: "重复发布",
        pt: "Repostado",
        fr: "Répété",
        es: "Repostado",
        it: "Riposto",
        de: "Wieder veröffentlicht"
      },
      keyword: {
        en: "By Keywords",
        ru: "По ключевым словам",
        hi: "कुंजीशब्दों के आधार पर",
        zh: "关键词",
        pt: "Por Palavras-chave",
        fr: "Par mots-clés",
        es: "Por palabras clave",
        it: "Per parole chiave",
        de: "Nach Schlüsselwörtern"
      },         
      dismissAll: {
        en: "Dismiss All",
        pt: "Ignorar Todas"
      },
    };

    return terms[term]?.[lang] || terms[term]?.en;
  }

  // Inicializa o filtro
  init() {
    if (!this.isJobPage()) return;
    
    // Cria os badges
    this.createAllBadges();
    
    // Aplica os filtros iniciais
    this.applyAllFilters();
    
    // Configura o observador de mutações com throttling
    this.setupMutationObserver();
  }

  // Cria todos os badges na interface
  createAllBadges() {
    Object.keys(this.filters).forEach(type => {
      this.createBadge(type);
    });
  }

  // Cria um badge individual
  createBadge(type) {
    if (this.badges[type]) return this.badges[type];
    
    const badge = document.createElement('div');
    badge.id = `${type}Badge`;
    badge.style.position = 'fixed';
    badge.style.top = `${this.filters[type].position}px`;
    badge.style.right = '5px';
    badge.style.color = 'white';
    badge.style.padding = '4px 6px 4px 13px';
    badge.style.borderRadius = '25px';
    badge.style.zIndex = '22';
    badge.style.fontWeight = '600';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.cursor = 'pointer';
    badge.style.userSelect = 'none';
    badge.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    badge.style.transition = 'opacity 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55), transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
    
    // Específico para o botão dismissAll
    if (type === 'dismissAll') {
      badge.onclick = () => this.dismissAllJobs();
      badge.style.opacity = '1';
      badge.style.backgroundColor = this.filters[type].color;
    } else {
      badge.onclick = () => this.toggleFilter(type);
    }
    
    // Atualiza o conteúdo do badge
    this.updateBadgeContent(badge, type);
    
    document.body.appendChild(badge);
    this.badges[type] = badge;
    
    return badge;
  }

  // Atualiza o conteúdo visual do badge
  updateBadgeContent(badge, type) {
    const filter = this.filters[type];
    badge.innerHTML = '';
    
    const badgeText = this.getLocalizedTerm(type, this.getPageLanguage());
    badge.appendChild(document.createTextNode(badgeText));
    
    // Para dismissAll, não exibe contador
    if (type !== 'dismissAll') {
      const countDiv = document.createElement('div');
      countDiv.innerText = filter.active ? filter.count : "OFF";
      countDiv.style.alignItems = 'center';
      countDiv.style.backgroundColor = '#f8fafd';
      countDiv.style.borderRadius = '20px';
      countDiv.style.color = '#00000099';
      countDiv.style.display = 'inline-flex';
      countDiv.style.fontSize = '14px';
      countDiv.style.height = '20px';
      countDiv.style.justifyContent = 'center';
      countDiv.style.marginLeft = '5px';
      countDiv.style.minWidth = '20px';
      countDiv.style.padding = '5px';
      countDiv.style.userSelect = 'none';
      
      badge.appendChild(countDiv);
      
      badge.style.opacity = filter.active && filter.count > 0 ? '1' : '0.5';
      badge.style.backgroundColor = filter.active ? filter.color : '#666666';
    }
    
    return badge;
  }

  // Alterna o estado do filtro
  toggleFilter(type) {
    // Não aplicável ao dismissAll, que agora é apenas um botão
    if (type === 'dismissAll') return;
    
    const filter = this.filters[type];
    filter.active = !filter.active;
    
    // Reseta a contagem quando o filtro é ativado
    if (filter.active) {
      filter.count = 0;
      this.countedJobIds[type].clear();
    }
    
    // Atualiza o badge e aplica o filtro
    this.updateBadgeContent(this.badges[type], type);
    this.applyFilter(type);
  }

  // Configura o observador de mutações com debounce
  setupMutationObserver() {
