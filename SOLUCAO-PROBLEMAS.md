# 🔧 Guia de Solução de Problemas - Erro "Mesa Não Encontrada"

## 🎯 Problema Identificado

Ao clicar em uma mesa, aparece o erro **"Mesa não encontrada"** ou **"Esta mesa não tem atendimento aberto"**.

---

## 🩺 Diagnóstico Rápido

### Passo 1: Executar o Diagnóstico

1. Na tela inicial, clique no ícone **🩺 (estetoscópio)** azul
2. Aguarde o diagnóstico completar
3. Veja os resultados:

#### ✅ Se tudo estiver OK:
- "Configuração do Firebase" ✓
- "Conexão com Firestore" ✓
- "Leitura de Mesas" ✓ (deve mostrar mesas)
- "Mesas com Atendimento" ✓ (deve mostrar pelo menos 1)

**Solução**: Limpe o cache do navegador (Ctrl+Shift+R) e tente novamente.

#### ❌ Se houver erros:

##### Erro: "Firebase não configurado"
**Causa**: Variáveis de ambiente não configuradas na Vercel

**Solução**:
1. Acesse o painel da Vercel
2. Vá em Settings → Environment Variables
3. Adicione as 6 variáveis do Firebase:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyDm70VtbPeaHiQL1yhcORK3-mQ4738iD30
   VITE_FIREBASE_AUTH_DOMAIN=projeto-certo-1.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=projeto-certo-1
   VITE_FIREBASE_STORAGE_BUCKET=projeto-certo-1.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=109467085347
   VITE_FIREBASE_APP_ID=1:109467085347:web:2c7e24b710ab68b35d9f96
   ```
4. Faça redeploy

##### Erro: "Erro ao conectar com Firestore"
**Causa**: Problema de rede ou credenciais inválidas

**Solução**:
1. Verifique se as credenciais estão corretas
2. Confirme que o projeto Firebase está ativo
3. Verifique se há conexão com a internet

##### Erro: "Nenhuma mesa encontrada"
**Causa**: Banco de dados vazio

**Solução**:
1. Clique em "Ir para Migração de Dados"
2. Faça a migração dos dados do localStorage
3. Ou crie uma nova mesa manualmente

##### Erro: "Nenhuma mesa com atendimento aberto"
**Causa**: Todas as mesas estão livres

**Solução**:
1. Volte para a tela de mesas
2. Clique em uma mesa livre (verde)
3. Abra um atendimento

##### Erro: "Erro ao ler mesas" ou "Erro ao escrever no Firestore"
**Causa**: Regras de segurança do Firestore bloqueando acesso

**Solução**:
1. Acesse o Firebase Console
2. Vá em Firestore Database → Rules
3. Cole estas regras (modo de teste):
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
4. Clique em "Publicar"

---

## 🔍 Verificação Manual no Firebase Console

### Passo 1: Verificar Mesas

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto **projeto-certo-1**
3. Clique em **Firestore Database**
4. Clique na coleção **mesas**
5. **Verifique**:
   - ✅ Existem documentos?
   - ✅ Cada documento tem um ID único?
   - ✅ Cada documento tem os campos: `numero`, `capacidade`, `atendimentoAberto`, `criadoEm`?

### Passo 2: Verificar Atendimento

1. Na coleção **mesas**, clique em um documento
2. **Verifique** o campo `atendimentoAberto`:
   - Se for `null`: Mesa está livre
   - Se for um objeto: Mesa tem atendimento aberto
3. Se tiver atendimento, verifique:
   - ✅ Tem `id`?
   - ✅ Tem `mesaId`?
   - ✅ Tem `convidados` (array)?
   - ✅ Tem `abertoEm`?

### Passo 3: Verificar Pedidos

1. Clique na coleção **pedidos**
2. **Verifique**:
   - ✅ Existem documentos?
   - ✅ Cada pedido tem `atendimentoId`?
   - ✅ O `atendimentoId` corresponde ao ID de um atendimento na coleção mesas?

---

## 🧪 Teste Completo

### Teste 1: Criar Mesa e Abrir Atendimento

1. Na tela inicial, clique em **"Nova mesa"**
2. Preencha:
   - Número: `99`
   - Capacidade: `4`
3. Clique em **"Criar Mesa"**
4. Volte para a tela de mesas
5. **Verifique**: A mesa 99 aparece?
6. Clique na mesa 99 (deve estar verde/livre)
7. Selecione 2 convidados
8. Clique em **"Abrir Atendimento"**
9. **Verifique**: O atendimento abre?

### Teste 2: Verificar no Console do Navegador

1. Pressione **F12** para abrir o Console
2. Vá na aba **Console**
3. Clique em uma mesa
4. **Deve aparecer**:
   ```
   Carregando mesa: [ID_DA_MESA]
   Mesa carregada com sucesso: [NUMERO]
   Carregando pedidos...
   Pedidos carregados: [QUANTIDADE]
   ```

5. **Se aparecer erro**:
   - Copie a mensagem completa
   - Verifique qual teste do diagnóstico falhou
   - Siga a solução correspondente

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: Mesa aparece na lista mas dá erro ao clicar

**Causa**: ID da mesa foi perdido ou corrompido

**Solução**:
1. Execute o diagnóstico
2. Se "Leitura de Mesas" falhar, limpe o Firebase e migre novamente
3. Se passar, limpe o cache do navegador (Ctrl+Shift+R)

### Problema 2: Atendimento não abre mesmo com mesa ocupada

**Causa**: Campo `atendimentoAberto` está corrompido ou vazio

**Solução**:
1. Verifique no Firebase Console o campo `atendimentoAberto`
2. Se estiver vazio ou null, feche o atendimento e abra novamente
3. Se estiver corrompido, limpe o Firebase e migre novamente

### Problema 3: Pedidos não aparecem no atendimento

**Causa**: `atendimentoId` dos pedidos não corresponde ao ID do atendimento

**Solução**:
1. Verifique no Firebase Console:
   - ID do atendimento na mesa
   - `atendimentoId` dos pedidos
2. Devem ser iguais
3. Se diferentes, limpe o Firebase e migre novamente

### Problema 4: Erro de permissão ao ler/escrever

**Causa**: Regras de segurança do Firestore estão bloqueando

**Solução**:
1. Acesse o Firebase Console
2. Vá em Firestore Database → Rules
3. Use as regras de modo de teste (ver acima)
4. Clique em "Publicar"

---

## 🔄 Solução Definitiva: Limpar e Migrar

Se nada funcionar, faça uma limpeza completa:

### Passo 1: Limpar Firebase

1. Acesse: `/#/migrar`
2. Clique em **"Limpar Banco de Dados Firebase"** (botão vermelho)
3. Confirme a ação
4. Aguarde a limpeza

### Passo 2: Limpar LocalStorage

1. Abra o Console do navegador (F12)
2. Vá na aba **Application** (ou **Aplicativo**)
3. Em **Storage** → **Local Storage**
4. Clique com botão direito → **Clear** (Limpar)

### Passo 3: Migrar Dados

1. Recarregue a página (F5)
2. O app vai carregar os dados de exemplo
3. Acesse: `/#/migrar`
4. Clique em **"Migrar Dados para Firebase"**
5. Aguarde a migração

### Passo 4: Testar

1. Volte para a tela de mesas
2. Clique na Mesa 3 (deve estar ocupada)
3. **Deve funcionar agora!**

---

## 📋 Checklist Final

Antes de pedir ajuda, verifique:

- [ ] Firebase configurado corretamente (6 variáveis na Vercel)
- [ ] Firestore Database ativado no Firebase Console
- [ ] Regras de segurança configuradas (modo de teste)
- [ ] Dados migrados para o Firebase
- [ ] Cache do navegador limpo (Ctrl+Shift+R)
- [ ] Diagnóstico executado e todos os testes passaram
- [ ] Console do navegador verificado (F12)

---

## 🆘 Ainda com Problemas?

Se nada funcionar:

1. **Tire screenshots**:
   - Tela de erro
   - Diagnóstico completo
   - Firebase Console (coleção mesas)
   - Console do navegador (F12)

2. **Verifique as mensagens de erro**:
   - Qual teste do diagnóstico falhou?
   - Qual mensagem aparece no Console?
   - Qual mensagem aparece na tela?

3. **Envie as informações**:
   - Screenshots
   - Mensagens de erro completas
   - Resultado do diagnóstico

---

## 🎯 Resumo das Soluções

| Problema | Solução |
|----------|---------|
| Firebase não configurado | Adicionar variáveis na Vercel + Redeploy |
| Nenhuma mesa encontrada | Fazer migração dos dados |
| Nenhuma mesa com atendimento | Abrir atendimento em mesa livre |
| Erro de permissão | Configurar regras do Firestore |
| Mesa não encontrada ao clicar | Limpar cache (Ctrl+Shift+R) |
| Atendimento não abre | Verificar campo `atendimentoAberto` no Firebase |
| Pedidos não aparecem | Verificar `atendimentoId` dos pedidos |
| Nada funciona | Limpar Firebase + LocalStorage + Migrar novamente |

---

**Boa sorte! 🚀**

Se ainda tiver problemas, execute o diagnóstico (ícone 🩺) e envie o resultado completo.
