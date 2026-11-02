# LinkedIn Workflow Suite

Single userscript replacing the archived LinkedIn Automa workflows with manual, on-demand commands on matching LinkedIn surfaces. It injects contextual controls only on compatible pages and executes mutating account actions only after explicit manual confirmation.

## Features

1. **Filter Job Results**: Injects filter badges on `/jobs/search` to visually hide dismissed, promoted, applied, viewed, reposted, or keyword-matched jobs. Also provides an explicit `Filtrar vagas visíveis` command and a confirmed `Ignorar Todas` batch action.
2. **Auto Save Job Alerts via Sheets Adapter**: Explicit capture-to-adapter action (`Salvar vagas visíveis na central`) sending visible job details to the authenticated Workflow Sheets Adapter (`appendJobAlert`). *Note: The legacy inbound workflow (reading Google Sheets to create alerts on LinkedIn) is intentionally not migrated due to the absence of an authorized read contract on the adapter.*
3. **Delete Job Alerts**: Progressively loads more alerts up to 6 clicks before prompting for confirmation to delete visible alerts (`Excluir todos os alertas` on `/jobs/jam` or `/jobs/alerts/manage`).
4. **Update Job Alerts**: Progressively loads alerts and converts daily email+notification alerts to email-only while disabling similar-job notifications (`Atualizar preferências dos alertas`).
5. **Expand Job Alerts**: Expands collapsed job alert sections (`Expandir alertas visíveis`).
6. **Expand Trending Topics**: Automatically expands feed news sections without adding a button or panel.
7. **Follow Companies**: Iterates through visible companies across up to 5 pages (capped at 20 actions) under explicit command and confirmation (`Seguir empresas visíveis`).
8. **Connect with People**: Sends connection requests across up to 5 pages (capped at 20 actions), explicitly choosing "Send without a note" in confirmation modals (`Conectar com pessoas visíveis`).
9. **Delete Notifications**: Restores in-page `Selecionar Tudo` and `Excluir Notificações` controls on `/notifications` with persistent checkboxes across SPA DOM re-renders.
10. **Change Notification Preferences**: Replays the full 210-step archived preference plan on `/mypreferences/d/categories/notifications`, including category navigation, switch toggles, and radio selections.
11. **Verify Fake / Spam Jobs**: Dismisses specific job postings by ID or via the legacy `vagaHref` cookie (`Ignorar vaga pelo ID` / `Ignorar vaga marcada pelo fluxo legado`).

## Adapter Configuration

1. Install `linkedin-workflow-suite.user.js` in Violentmonkey / Tampermonkey.
2. Navigate to a supported LinkedIn surface and use its contextual panel.
3. Choose **Configure adapter** from that panel, then provide the `/exec` endpoint URL and the access token.

The endpoint and token are stored strictly in local userscript storage and are never committed or transmitted elsewhere.

## Navigation commands

The userscript-manager menu contains only direct navigation commands. Contextual actions such as filtering jobs, following companies, connecting with people, managing alerts, and deleting notifications appear only on the LinkedIn surface where they apply and continue to require explicit invocation and confirmation.

## Safety & Limits

- No automatic mutations: all mutating account actions require explicit command execution and confirmation prompts.
- Bounded progression: social actions and alert operations enforce hard limits (maximum 5 pages, 6 load-more expansions, and 20 bulk actions per run).
- Connection invitations resolve modal dialogs by selecting "Send without a note".
- Adapter integration supports outbound capture only (`appendJobAlert`). Inbound creation from sheets is not supported.
