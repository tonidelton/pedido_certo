# Pedido Certo - Guia de Configuração do Firebase

## 📋 Sobre o Projeto

**Pedido Certo** é um aplicativo web mobile-first para garçons registrarem pedidos por mesa em restaurantes.

## 🔥 Configurando o Firebase

### Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Nomeie o projeto (ex: "pedido-certo")
4. Desative o Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### Passo 2: Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"** (para desenvolvimento)
4. Selecione a localização mais próxima
5. Clique em **"Ativar"**

### Passo 3: Registrar Aplicativo Web

1. Na página inicial do projeto, clique no ícone **Web** (</>)
2. Nomeie o app (ex: "pedido-certo-web")
3. **NÃO** marque "Firebase Hosting"
4. Clique em **"Registrar app"**
5. Copie as credenciais que aparecerão

### Passo 4: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas credenciais:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=pedido-certo.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=pedido-certo
   VITE_FIREBASE_STORAGE_BUCKET=pedido-certo.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### Passo 5: Configurar Regras de Segurança

No Firestore Database, vá em **"Regras"** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita para desenvolvimento
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE**: Para produção, configure autenticação e regras mais restritivas.

### Passo 6: Instalar Dependências

```bash
npm install
```

### Passo 7: Executar o Projeto

```bash
npm run dev
```

## 📊 Estrutura do Banco de Dados

O Firestore criará automaticamente as seguintes coleções:

### `produtos`
```javascript
{
  id: string,
  nome: string,
  codigo: string,
  categoria: 'Entradas' | 'Bebidas' | 'Pratos Principais' | 'Sobremesas',
  preco: number | null,
  observacoes: string,
  ativo: boolean,
  criadoEm: string,
  atualizadoEm: string
}
```

### `mesas`
```javascript
{
  id: string,
  numero: string,
  capacidade: number | null,
  atendimentoAberto: {
    id: string,
    mesaId: string,
    convidados: [
      {
        id: string,
        lugar: number,
        cor: string,
        apelido: string
      }
    ],
    abertoEm: string,
    fechadoEm: string | null
  } | null,
  criadoEm: string
}
```

### `pedidos`
```javascript
{
  id: string,
  codigo: string,
  mesaId: string,
  atendimentoId: string,
  convidadoId: string,
  convidadoLugar: number,
  convidadoApelido: string,
  itens: [
    {
      id: string,
      produtoId: string,
      produtoNome: string,
      produtoCodigo: string,
      quantidade: number,
      observacao: string,
      precoUnitario: number | null,
      entregueEm: string | null
    }
  ],
  status: 'pendente' | 'em_preparo' | 'entregue' | 'cancelado',
  historicoStatus: [
    {
      status: string,
      timestamp: string
    }
  ],
  anotadoPor: string,
  criadoEm: string,
  atualizadoEm: string
}
```

## 🔄 Modo Offline (Fallback)

O app funciona **sem Firebase** usando localStorage como fallback. Se o Firebase não estiver configurado ou houver erro de conexão, o app automaticamente usa o armazenamento local do navegador.

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Adicione as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório ao Netlify
2. Adicione as variáveis de ambiente em **Site settings > Environment variables**
3. Build command: `npm run build`
4. Publish directory: `dist`

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📱 Funcionalidades

✅ Gestão de mesas com status visual (Livre/Ocupada)  
✅ Cadastro de produtos por categoria  
✅ Abertura de atendimento com convidados  
✅ Registro de pedidos por convidado  
✅ Controle de entrega por item  
✅ Busca global por código de pedido  
✅ Interface mobile-first em português  
✅ Persistência com Firebase ou localStorage  

## 🛠️ Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Firebase Firestore
- React Router
- Lucide Icons

## 📝 Scripts

```bash
npm run dev      # Iniciar servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

## 🔒 Segurança (Produção)

Para produção, implemente:

1. **Firebase Authentication** para login de garçons
2. **Regras de segurança** no Firestore
3. **Variáveis de ambiente** seguras
4. **HTTPS** obrigatório

Exemplo de regras mais seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do React](https://react.dev/)

---

**Desenvolvido com ❤️ para restaurantes**
