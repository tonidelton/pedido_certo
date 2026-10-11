# Configurar Firebase na Vercel

## 🚀 Passo a Passo

### 1. Acessar as Configurações do Projeto na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto **Pedido Certo**
3. No menu superior, clique em **"Settings"**
4. No menu lateral, clique em **"Environment Variables"**

### 2. Adicionar Variáveis de Ambiente

Clique em **"Add"** para cada variável e preencha:

#### Variável 1: VITE_FIREBASE_API_KEY
- **Name:** `VITE_FIREBASE_API_KEY`
- **Value:** `AIzaSyDm70VtbPeaHiQL1yhcORK3-mQ4738iD30`
- **Environment:** Marque todas (Production, Preview, Development)

#### Variável 2: VITE_FIREBASE_AUTH_DOMAIN
- **Name:** `VITE_FIREBASE_AUTH_DOMAIN`
- **Value:** `projeto-certo-1.firebaseapp.com`
- **Environment:** Marque todas

#### Variável 3: VITE_FIREBASE_PROJECT_ID
- **Name:** `VITE_FIREBASE_PROJECT_ID`
- **Value:** `projeto-certo-1`
- **Environment:** Marque todas

#### Variável 4: VITE_FIREBASE_STORAGE_BUCKET
- **Name:** `VITE_FIREBASE_STORAGE_BUCKET`
- **Value:** `projeto-certo-1.firebasestorage.app`
- **Environment:** Marque todas

#### Variável 5: VITE_FIREBASE_MESSAGING_SENDER_ID
- **Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value:** `109467085347`
- **Environment:** Marque todas

#### Variável 6: VITE_FIREBASE_APP_ID
- **Name:** `VITE_FIREBASE_APP_ID`
- **Value:** `1:109467085347:web:2c7e24b710ab68b35d9f96`
- **Environment:** Marque todas

### 3. Salvar e Redeploy

1. Após adicionar todas as variáveis, clique em **"Save"**
2. A Vercel vai pedir para fazer um novo deploy
3. Clique em **"Redeploy"** ou **"Deploy"**
4. Aguarde o deploy ser concluído (2-3 minutos)

### 4. Verificar se Funcionou

1. Acesse o app na Vercel
2. Clique no ícone 🗄️ (banco de dados) na tela inicial
3. Deve aparecer: **"Firebase Configurado!"** em verde

### 5. Migrar Dados do LocalStorage

Se você tem dados no navegador (localStorage):

1. No app, clique no ícone 🗄️
2. Clique em **"Migrar para Firebase"**
3. Aguarde a migração ser concluída
4. Os dados serão transferidos para o Firebase e o localStorage será limpo

---

## ⚠️ Importante

- **NÃO** compartilhe suas credenciais do Firebase publicamente
- As variáveis de ambiente na Vercel são seguras e criptografadas
- Após o redeploy, o app usará o Firebase como fonte principal de dados
- Os dados serão sincronizados em tempo real entre todos os dispositivos

---

## 🔍 Verificar no Console do Firebase

Para confirmar que os dados foram migrados:

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto **projeto-certo-1**
3. Clique em **"Firestore Database"**
4. Você deve ver as coleções:
   - `produtos`
   - `mesas`
   - `pedidos`

---

## 🆘 Problemas Comuns

### "Firebase Não Configurado" após adicionar variáveis
- Verifique se fez o **Redeploy** após adicionar as variáveis
- As variáveis só são aplicadas após um novo deploy
- Limpe o cache do navegador (Ctrl+Shift+R)

### Dados não aparecem após migração
- Verifique se o Firebase está configurado corretamente
- Abra o Console do navegador (F12) e veja se há erros
- Confirme que as regras de segurança do Firestore estão configuradas

### Erro de permissão ao migrar
- Vá no Firebase Console → Firestore Database → Regras
- Configure as regras para permitir leitura/escrita (modo de teste)
- Exemplo de regra para desenvolvimento:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique o Console do navegador (F12) para ver erros
2. Confirme que todas as 6 variáveis foram adicionadas na Vercel
3. Faça um novo deploy após adicionar as variáveis
4. Limpe o cache do navegador

---

**Pronto!** Seu app agora está 100% funcional com Firebase na Vercel! 🎉
