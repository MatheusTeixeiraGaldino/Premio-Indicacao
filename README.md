# 🏆 Sistema de Prêmio por Indicação de Colaboradores

Sistema web para controle de pagamento de prêmios por indicação, hospedado no GitHub Pages com Firebase como backend.

## Estrutura de Arquivos

```
/
├── index.html                  # Página de login
├── css/
│   └── main.css               # Estilos globais
├── js/
│   ├── firebase-config.js     # Configuração do Firebase
│   ├── auth.js                # Autenticação e gestão de usuários
│   ├── audit.js               # Log de auditoria
│   ├── indicacoes.js          # CRUD e regras de negócio das indicações
│   ├── config.js              # Configurações do sistema
│   └── ui.js                  # Componentes de UI (toast, modal, sidebar)
├── pages/
│   ├── dashboard.html         # Painel principal
│   ├── cadastro.html          # Nova indicação
│   ├── indicacoes.html        # Lista de indicações
│   ├── pagamentos.html        # Controle de pagamentos
│   ├── relatorios.html        # Relatórios e gráficos
│   ├── usuarios.html          # Administração de usuários
│   └── configuracoes.html     # Configurações e auditoria
└── firestore.rules            # Regras de segurança do Firestore
```

## Configuração do Firebase

### 1. Firestore — Regras de Segurança

Acesse: **Firebase Console → Firestore → Rules**

Cole o conteúdo do arquivo `firestore.rules`.

### 2. Firestore — Índices Compostos

Acesse: **Firebase Console → Firestore → Indexes** e crie:

| Coleção | Campo 1 | Campo 2 | Tipo |
|---|---|---|---|
| indicacoes | status (ASC) | criadoEm (DESC) | Composto |
| historico | referenciaId (ASC) | timestamp (DESC) | Composto |

### 3. Firebase Authentication

Acesse: **Firebase Console → Authentication → Sign-in method**

Ative: **E-mail/Senha**

### 4. Criar Primeiro Usuário Administrador

Como a tela de usuários exige autenticação como admin, você precisa criar o primeiro usuário diretamente no Firebase:

**Via Firebase Console → Authentication → Users → Add User:**
- E-mail: `admin@suaempresa.com`  
- Senha: (qualquer senha temporária)

**Via Firebase Console → Firestore → Nova coleção `usuarios`:**
- Document ID: (copie o UID gerado acima)
- Campos:
  ```
  nome: "Administrador"
  email: "admin@suaempresa.com"
  perfil: "admin"
  status: "ativo"
  senhaTemporaria: false
  ```

### 5. Publicar no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Acesse: **Settings → Pages → Source: main branch / root**
4. Aguarde o deploy — URL: `https://seuusuario.github.io/nome-repo/`

> **Importante:** O Firebase Authentication precisa que o domínio `seuusuario.github.io` seja adicionado como domínio autorizado.
>
> Acesse: **Firebase Console → Authentication → Settings → Authorized domains → Add domain**

---

## Perfis de Acesso

| Perfil | Permissões |
|---|---|
| **admin** | Tudo + gerenciar usuários |
| **dh** | Acesso total às indicações, pagamentos, relatórios e configurações |
| **dp** | Visualizar indicações, acompanhar previsões, registrar pagamentos |

## Regras de Negócio Implementadas

- ✅ Cálculo automático da previsão de pagamento (180 dias ou encerramento do contrato)
- ✅ Recálculo ao alterar data de admissão
- ✅ Atualização automática de status "previsto" → "aguardando pagamento"
- ✅ Cancelamento com motivo obrigatório (sem exclusão)
- ✅ Log de auditoria de todas as ações
- ✅ Senha temporária no primeiro acesso
- ✅ Exportação para CSV (Excel)
- ✅ Dashboard com ranking, gráficos e totalizadores

## Exportação Excel

A exportação gera um arquivo `.csv` compatível com Excel contendo:
- Indicador, Matrícula, Indicado, Matrícula, Data Admissão, Previsão Pagamento, Valor, Status, Data Pagamento
