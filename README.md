# LinkedIn Workflow Suite

Userscript único para substituir os fluxos Automa do LinkedIn. Ele injeta controles apenas nas superfícies compatíveis e preserva ações externas sob comando explícito.

## Recursos

- Filtra vagas visíveis na busca por termos indesejados.
- Salva vagas visíveis na aba `Alertas LinkedIn` de `$$alertasCentral`.
- Expande seções visíveis em alertas e no feed.
- Permite seguir empresas e enviar convites de conexão visíveis, sempre após confirmação.
- Torna notificações visíveis selecionáveis. A remoção permanece manual no menu nativo do LinkedIn.

## Configuração do adapter

1. Instale `linkedin-workflow-suite.user.js` no Violentmonkey.
2. Abra qualquer página do LinkedIn e use o menu do userscript, **Configurar Workflow Sheets Adapter**.
3. Informe a URL `/exec` atual do Workflow Sheets Adapter e o token exibido na tela de configuração do adapter.

A URL e o token ficam apenas no armazenamento local do Violentmonkey. Não adicione o token ao arquivo do userscript nem ao GitHub.

## Limites

O userscript não executa ações sociais automaticamente. Seguir empresas, conectar pessoas e salvar vagas exigem um clique no painel e confirmação. A extração de vagas depende dos elementos visíveis no LinkedIn e pode precisar de ajuste quando a interface do site mudar.
