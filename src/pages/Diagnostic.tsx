import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Database, AlertCircle } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  details?: string;
}

export default function Diagnostic() {
  const navigate = useNavigate();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);

    // Acumula os resultados em um array local para evitar o problema de
    // closure (índices calculados sobre estado desatualizado).
    const acc: DiagnosticResult[] = [];
    const add = (result: DiagnosticResult) => {
      acc.push(result);
      setResults([...acc]);
    };
    const update = (index: number, result: Partial<DiagnosticResult>) => {
      acc[index] = { ...acc[index], ...result };
      setResults([...acc]);
    };

    // Test 1: Firebase Configuration
    let idx = acc.length;
    add({ test: 'Configuração do Firebase', status: 'loading', message: 'Verificando...' });
    
    if (!isFirebaseConfigured()) {
      update(idx, { 
        status: 'error', 
        message: 'Firebase não configurado',
        details: 'Verifique se as variáveis de ambiente estão configuradas corretamente'
      });
      setRunning(false);
      return;
    }
    
    update(idx, { status: 'success', message: 'Firebase configurado corretamente' });

    // Test 2: Firebase Connection
    idx = acc.length;
    add({ test: 'Conexão com Firestore', status: 'loading', message: 'Testando conexão...' });
    
    try {
      if (!db) {
        update(idx, { status: 'error', message: 'Database não inicializado' });
        setRunning(false);
        return;
      }
      
      // Try to read from a test collection
      const testRef = collection(db, '__test__');
      await getDocs(testRef);
      
      update(idx, { status: 'success', message: 'Conexão com Firestore estabelecida' });
    } catch (error) {
      update(idx, { 
        status: 'error', 
        message: 'Erro ao conectar com Firestore',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      setRunning(false);
      return;
    }

    // Test 3: Read Mesas
    idx = acc.length;
    add({ test: 'Leitura de Mesas', status: 'loading', message: 'Buscando mesas...' });
    
    try {
      const mesasRef = collection(db, 'mesas');
      const snapshot = await getDocs(mesasRef);
      const mesas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      if (mesas.length === 0) {
        update(idx, { 
          status: 'error', 
          message: 'Nenhuma mesa encontrada',
          details: 'O banco de dados está vazio. Faça a migração dos dados.'
        });
      } else {
        update(idx, { 
          status: 'success', 
          message: `${mesas.length} mesa(s) encontrada(s)`,
          details: mesas.map((m: any) => `Mesa ${m.numero} (ID: ${m.id})`).join(', ')
        });
      }
    } catch (error) {
      update(idx, { 
        status: 'error', 
        message: 'Erro ao ler mesas',
        details: error instanceof Error ? error.message : 'Erro desconhecido - Verifique as regras de segurança do Firestore'
      });
    }

    // Test 4: Read Produtos
    idx = acc.length;
    add({ test: 'Leitura de Produtos', status: 'loading', message: 'Buscando produtos...' });
    
    try {
      const produtosRef = collection(db, 'produtos');
      const snapshot = await getDocs(produtosRef);
      const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      if (produtos.length === 0) {
        update(idx, { 
          status: 'error', 
          message: 'Nenhum produto encontrado',
          details: 'O banco de dados está vazio. Faça a migração dos dados.'
        });
      } else {
        update(idx, { 
          status: 'success', 
          message: `${produtos.length} produto(s) encontrado(s)`,
          details: produtos.slice(0, 3).map((p: any) => p.nome).join(', ') + (produtos.length > 3 ? '...' : '')
        });
      }
    } catch (error) {
      update(idx, { 
        status: 'error', 
        message: 'Erro ao ler produtos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Test 5: Read Pedidos
    idx = acc.length;
    add({ test: 'Leitura de Pedidos', status: 'loading', message: 'Buscando pedidos...' });
    
    try {
      const pedidosRef = collection(db, 'pedidos');
      const snapshot = await getDocs(pedidosRef);
      const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      update(idx, { 
        status: 'success', 
        message: `${pedidos.length} pedido(s) encontrado(s)`,
        details: pedidos.length > 0 ? `Primeiro pedido: ${(pedidos[0] as any).codigo}` : 'Nenhum pedido ainda'
      });
    } catch (error) {
      update(idx, { 
        status: 'error', 
        message: 'Erro ao ler pedidos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Test 6: Write Test
    idx = acc.length;
    add({ test: 'Escrita no Firestore', status: 'loading', message: 'Testando escrita...' });
    
    try {
      const testDoc = doc(db, '__test__', 'test-doc');
      await setDoc(testDoc, { 
        test: true, 
        timestamp: new Date().toISOString() 
      });
      
      // Read it back
      const readBack = await getDoc(testDoc);
      if (readBack.exists()) {
        update(idx, { 
          status: 'success', 
          message: 'Escrita e leitura funcionando corretamente'
        });
      } else {
        update(idx, { 
          status: 'error', 
          message: 'Documento não foi salvo corretamente'
        });
      }
    } catch (error) {
      update(idx, { 
        status: 'error', 
        message: 'Erro ao escrever no Firestore',
        details: error instanceof Error ? error.message : 'Erro desconhecido - Verifique as regras de segurança'
      });
    }

    // Test 7: Check Mesa with Atendimento
    idx = acc.length;
    add({ test: 'Mesas com Atendimento', status: 'loading', message: 'Verificando atendimentos...' });
    
    try {
      const mesasRef = collection(db, 'mesas');
      const snapshot = await getDocs(mesasRef);
      const mesas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const mesasComAtendimento = mesas.filter((m: any) => m.atendimentoAberto);
      
      if (mesasComAtendimento.length === 0) {
        update(idx, { 
          status: 'error', 
          message: 'Nenhuma mesa com atendimento aberto',
          details: 'Abra um atendimento em uma mesa livre para testar'
        });
      } else {
        update(idx, { 
          status: 'success', 
          message: `${mesasComAtendimento.length} mesa(s) com atendimento aberto`,
          details: mesasComAtendimento.map((m: any) => {
            const att = m.atendimentoAberto;
            return `Mesa ${m.numero}: ${att?.convidados?.length || 0} convidados, ${att?.id || 'sem ID'}`;
          }).join(' | ')
        });
      }
    } catch (error) {
      update(idx, { 
        status: 'error', 
        message: 'Erro ao verificar atendimentos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    setRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Diagnóstico do Firebase</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        {results.length > 0 && !running && (
          <div className={`rounded-2xl p-5 border-2 ${
            errorCount === 0 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {errorCount === 0 ? (
                <CheckCircle2 size={32} className="text-green-600" />
              ) : (
                <XCircle size={32} className="text-red-600" />
              )}
              <div>
                <p className={`font-bold text-lg ${errorCount === 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {errorCount === 0 ? 'Tudo OK!' : 'Problemas Detectados'}
                </p>
                <p className={`text-sm ${errorCount === 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {successCount} teste(s) passou(aram) · {errorCount} teste(s) falhou(aram)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`bg-white border-2 rounded-xl p-4 ${
                result.status === 'success' ? 'border-green-200' :
                result.status === 'error' ? 'border-red-200' :
                'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.status === 'loading' && (
                  <Loader2 size={24} className="text-blue-500 animate-spin shrink-0" />
                )}
                {result.status === 'success' && (
                  <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                )}
                {result.status === 'error' && (
                  <XCircle size={24} className="text-red-500 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{result.test}</p>
                  <p className={`text-sm mt-1 ${
                    result.status === 'success' ? 'text-green-700' :
                    result.status === 'error' ? 'text-red-700' :
                    'text-slate-600'
                  }`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2 font-mono">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={runDiagnostics}
            disabled={running}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {running ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Executando Diagnóstico...
              </>
            ) : (
              <>
                <Database size={20} />
                Executar Diagnóstico Novamente
              </>
            )}
          </button>

          {errorCount > 0 && (
            <button
              onClick={() => navigate('/migrar')}
              className="w-full py-4 bg-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
            >
              <AlertCircle size={20} />
              Ir para Migração de Dados
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Voltar para Mesas
          </button>
        </div>

        {/* Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Se houver erros:</p>
              <ul className="space-y-1 text-xs">
                <li>• Verifique se as regras de segurança do Firestore estão configuradas</li>
                <li>• Confirme que o Firebase está no modo de teste ou com regras adequadas</li>
                <li>• Limpe o cache do navegador (Ctrl+Shift+R)</li>
                <li>• Faça a migração dos dados se o banco estiver vazio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
