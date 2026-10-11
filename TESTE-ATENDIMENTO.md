# Teste de Atendimento - Pedido Certo

## 🧪 Checklist de Testes

Use este checklist para verificar se o atendimento está funcionando corretamente.

---

## ✅ Teste 1: Verificar Firebase Configurado

1. Abra o app
2. Clique no ícone 🗄️ (banco de dados) na tela inicial
3. **Verificar**: Deve aparecer "Firebase Configurado!" em verde
4. **Se aparecer vermelho**: Configurar Firebase primeiro

---

## ✅ Teste 2: Verificar Mesas no Firebase

1. No Firebase Console (https://console.firebase.google.com/)
2. Selecione o projeto **projeto-certo-1**
3. Clique em **Firestore Database**
4. **Verificar**: Deve existir a coleção `mesas`
5. **Verificar**: Deve haver pelo menos 1 mesa com `atendimentoAberto` diferente de null

---

## ✅ Teste 3: Abrir Atendimento

1. Na tela inicial do app, procure uma mesa com status **"Ocupada"** (laranja)
2. Clique na mesa
3. **Verificar**: 
   - ✅ Deve aparecer tela de carregamento "Carregando atendimento..."
   - ✅ Após carregar, deve mostrar os convidados
   - ✅ Deve mostrar o cabeçalho com número da mesa e tempo
   - ✅ Deve mostrar resumo de itens (pendentes, em preparo, entregues)

---

## ✅ Teste 4: Verificar Convidados

1. No atendimento aberto, verifique os cards dos convidados
2. **Verificar**:
   - ✅ Cada convidado deve ter número do lugar
   - ✅ Cada convidado deve ter cor (vermelho, azul, verde, etc.)
   - ✅ Cada convidado deve ter apelido (se houver)
   - ✅ Deve mostrar resumo de pedidos do convidado

---

## ✅ Teste 5: Verificar Pedidos

1. Role para baixo nos cards dos convidados
2. **Verificar**:
   - ✅ Deve mostrar os itens dos pedidos (quantidade + nome do produto)
   - ✅ Deve mostrar observações dos itens (se houver)
   - ✅ Deve mostrar código do pedido em texto pequeno (ex: M3-P01)
   - ✅ Deve mostrar status do pedido (Concluído/Parcial)

---

## ✅ Teste 6: Marcar Item como Entregue

1. Encontre um item não entregue (checkbox vazio)
2. Clique no checkbox
3. **Verificar**:
   - ✅ Checkbox deve ficar verde com check
   - ✅ Item deve ficar riscado
   - ✅ Deve aparecer "✓ Entregue às HH:MM"
   - ✅ Deve aparecer toast "Item marcado como entregue"

---

## ✅ Teste 7: Desmarcar Item Entregue

1. Encontre um item entregue (checkbox verde)
2. Clique no checkbox
3. **Verificar**:
   - ✅ Checkbox deve voltar para vazio
   - ✅ Item deve voltar ao normal (sem riscado)
   - ✅ Deve aparecer toast "Item desmarcado"

---

## ✅ Teste 8: Alternar Modo de Visualização

1. No topo da tela, clique em **"Por mesa"**
2. **Verificar**:
   - ✅ Deve mostrar lista de todos os pedidos da mesa
   - ✅ Cada pedido deve mostrar código, convidado e itens
   - ✅ Deve poder marcar/desmarcar itens aqui também
3. Clique em **"Por convidado"** para voltar
4. **Verificar**: Deve voltar para a visualização por cards

---

## ✅ Teste 9: Editar Apelido

1. Clique no ícone de editar (lápis) ao lado do nome do convidado
2. Digite um novo apelido
3. Clique em "Salvar"
4. **Verificar**:
   - ✅ Apelido deve ser atualizado
   - ✅ Deve aparecer o novo apelido no card

---

## ✅ Teste 10: Fechar Atendimento

1. Clique no botão vermelho "Fechar Atendimento" (ou ícone no topo)
2. Confirme a ação
3. **Verificar**:
   - ✅ Deve voltar para a tela de mesas
   - ✅ A mesa deve agora estar com status "Livre" (verde)

---

## ✅ Teste 11: Abrir Novo Atendimento

1. Clique em uma mesa livre (verde)
2. Selecione número de convidados (ex: 4)
3. Adicione apelidos (opcional)
4. Clique em "Abrir Atendimento"
5. **Verificar**:
   - ✅ Deve abrir o atendimento
   - ✅ Deve mostrar os 4 convidados
   - ✅ Mesa deve ficar com status "Ocupada"

---

## ✅ Teste 12: Criar Novo Pedido

1. No atendimento aberto, clique no botão "+" ao lado de um convidado
2. Selecione um produto
3. Defina quantidade e observação
4. Clique em "Adicionar ao Pedido"
5. Clique em "Salvar Pedido"
6. **Verificar**:
   - ✅ Deve voltar para o atendimento
   - ✅ Deve mostrar o novo pedido do convidado
   - ✅ Deve aparecer toast "Pedido criado com sucesso"

---

## ✅ Teste 13: Verificar Console do Navegador

1. Pressione F12 para abrir o Console
2. Vá para a aba "Console"
3. Abra um atendimento
4. **Verificar**: Deve aparecer logs como:
   ```
   Carregando mesa: [id]
   Mesa carregada com sucesso: [numero]
   Carregando pedidos...
   Pedidos carregados: [quantidade]
   ```
5. **Se aparecer erro**: Copiar a mensagem de erro

---

## ✅ Teste 14: Verificar Firebase Console

1. Abra o Firebase Console
2. Vá em Firestore Database
3. Clique na coleção `pedidos`
4. **Verificar**:
   - ✅ Deve haver pedidos com o `atendimentoId` correto
   - ✅ Cada pedido deve ter `itens` com `entregueEm` (null ou timestamp)
   - ✅ Cada pedido deve ter `status` (pendente, em_preparo, entregue, cancelado)

---

## 🐛 Problemas Comuns e Soluções

### Problema: Tela em branco ao abrir atendimento

**Causa**: Erro no carregamento dos dados

**Solução**:
1. Verificar console do navegador (F12)
2. Verificar se o Firebase está configurado
3. Limpar o Firebase e migrar novamente
4. Limpar cache do navegador (Ctrl+Shift+R)

---

### Problema: "Mesa não encontrada"

**Causa**: ID da mesa inválido ou mesa não existe no Firebase

**Solução**:
1. Voltar para tela de mesas
2. Verificar se a mesa existe
3. Se não existir, criar nova mesa
4. Abrir atendimento na mesa correta

---

### Problema: "Esta mesa não tem atendimento aberto"

**Causa**: Mesa está livre (sem atendimento)

**Solução**:
1. Clique na mesa livre
2. Selecione número de convidados
3. Clique em "Abrir Atendimento"

---

### Problema: Pedidos não aparecem

**Causa**: Problema na query do Firebase ou dados corrompidos

**Solução**:
1. Verificar console do navegador para erros
2. Verificar no Firebase Console se os pedidos existem
3. Verificar se o `atendimentoId` está correto
4. Limpar o Firebase e migrar novamente

---

### Problema: Não consigo marcar item como entregue

**Causa**: Erro de permissão no Firebase

**Solução**:
1. Verificar regras de segurança do Firestore
2. Confirmar que está no modo de teste ou com regras adequadas
3. Verificar console do navegador para erros

---

## 📊 Resultado Esperado

Se todos os testes passarem:
- ✅ Atendimento abre corretamente
- ✅ Convidados aparecem com cores e apelidos
- ✅ Pedidos aparecem com itens e observações
- ✅ É possível marcar/desmarcar itens como entregues
- ✅ É possível editar apelidos
- ✅ É possível fechar atendimento
- ✅ É possível abrir novo atendimento
- ✅ É possível criar novos pedidos

---

## 🆘 Se Ainda Tiver Problemas

1. **Limpar o Firebase**:
   - Acesse `/#/migrar`
   - Clique em "Limpar Banco de Dados Firebase"
   - Confirme a ação

2. **Migrar dados novamente**:
   - Clique em "Migrar Dados para Firebase"
   - Aguarde a migração

3. **Limpar cache do navegador**:
   - Pressione Ctrl+Shift+R
   - Ou abra em aba anônima

4. **Verificar console**:
   - Pressione F12
   - Vá na aba "Console"
   - Copie as mensagens de erro
   - Envie para análise

---

## 📞 Suporte

Se precisar de ajuda:
1. Tire screenshot da tela de erro
2. Abra o console do navegador (F12)
3. Copie as mensagens de erro
4. Envie para análise

---

**Boa sorte com os testes! 🚀**
