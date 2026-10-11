import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, CheckCircle2, XCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { migrarDadosParaFirebase, limparLocalStorage, verificarDadosLocais, limparFirebase } from '../services/migracaoService';
import { isFirebaseConfigured } from '../firebase';

export default function MigrarDados() {
  const navigate = useNavigate();
  const [firebaseConfigurado, setFirebaseConfigurado] = useState(false);
  const [dadosLocais, setDadosLocais] = useState({ produtos: 0, mesas: 0, pedidos: 0 });
  const [migrando, setMigrando] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [resultado, setResultado] = useState<{
    sucesso: boolean;
    produtos: number;
    mesas: number;
    pedidos: number;
    erros: string[];
  } | null>(null);
  const [resultadoLimpeza, setResultadoLimpeza] = useState<{
    sucesso: boolean;
    produtosRemovidos: number;
    mesasRemovidas: number;
    pedidosRemovidos: number;
    erros: string[];
  } | null>(null);

  useEffect(() => {
    setFirebaseConfigurado(isFirebaseConfigured());
    setDadosLocais(verificarDadosLocais());
  }, []);

  const handleMigrar = async () => {
    setMigrando(true);
    setResultado(null);

    try {
      const resultadoMigracao = await migrarDadosParaFirebase();
      setResultado(resultadoMigracao);

      if (resultadoMigracao.sucesso) {
        // Limpar localStorage após migração bem-sucedida
        setTimeout(() => {
          limparLocalStorage();
          setDadosLocais({ produtos: 0, mesas: 0, pedidos: 0 });
        }, 2000);
      }
    } catch (error) {
      setResultado({
        sucesso: false,
        produtos: 0,
        mesas: 0,
        pedidos: 0,
        erros: [`Erro inesperado: ${error}`]
      });
    } finally {
      setMigrando(false);
    }
  };

  const handleLimpar = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados do localStorage? Esta ação não pode ser desfeita.')) {
      limparLocalStorage();
      setDadosLocais({ produtos: 0, mesas: 0, pedidos: 0 });
    }
  };

  const handleLimparFirebase = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá APAGAR TODOS os dados do Firebase (produtos, mesas e pedidos). Esta ação NÃO PODE ser desfeita. Deseja continuar?')) {
      return;
    }

    setLimpando(true);
    setResultadoLimpeza(null);

    try {
      const resultadoLimpezaFirebase = await limparFirebase();
      setResultadoLimpeza(resultadoLimpezaFirebase);

      if (resultadoLimpezaFirebase.sucesso) {
        // Limpar também o localStorage
        setTimeout(() => {
          limparLocalStorage();
          setDadosLocais({ produtos: 0, mesas: 0, pedidos: 0 });
        }, 2000);
      }
    } catch (error) {
      setResultadoLimpeza({
        sucesso: false,
        produtosRemovidos: 0,
        mesasRemovidas: 0,
        pedidosRemovidos: 0,
        erros: [`Erro inesperado: ${error}`]
      });
    } finally {
      setLimpando(false);
    }
  };

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
          <h1 className="text-xl font-bold text-slate-800">Migrar Dados</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Status do Firebase */}
        <div className={`rounded-2xl p-5 border-2 ${
          firebaseConfigurado 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start gap-3">
            {firebaseConfigurado ? (
              <>
                <CheckCircle2 size={28} className="text-green-600 shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-lg">Firebase Configurado</p>
                  <p className="text-sm text-green-700 mt-1">
                    Pronto para migrar dados para o banco de dados na nuvem.
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle size={28} className="text-red-600 shrink-0" />
                <div>
                  <p className="font-bold text-red-800 text-lg">Firebase Não Configurado</p>
                  <p className="text-sm text-red-700 mt-1">
                    Configure o Firebase antes de migrar os dados.
                  </p>
                  <button
                    onClick={() => navigate('/config/firebase')}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Configurar Firebase
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dados no LocalStorage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={20} className="text-slate-600" />
            Dados no Navegador (localStorage)
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Produtos</span>
              <span className="font-bold text-slate-800">{dadosLocais.produtos}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Mesas</span>
              <span className="font-bold text-slate-800">{dadosLocais.mesas}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600">Pedidos</span>
              <span className="font-bold text-slate-800">{dadosLocais.pedidos}</span>
            </div>
          </div>

          {dadosLocais.produtos === 0 && dadosLocais.mesas === 0 && dadosLocais.pedidos === 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 text-center">
                Nenhum dado encontrado no localStorage
              </p>
            </div>
          )}
        </div>

        {/* Resultado da Migração */}
        {resultado && (
          <div className={`rounded-2xl p-5 border-2 ${
            resultado.sucesso 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {resultado.sucesso ? (
                <>
                  <CheckCircle2 size={28} className="text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-green-800 text-lg">Migração Concluída!</p>
                    <div className="mt-3 space-y-1 text-sm text-green-700">
                      <p>✓ {resultado.produtos} produtos migrados</p>
                      <p>✓ {resultado.mesas} mesas migradas</p>
                      <p>✓ {resultado.pedidos} pedidos migrados</p>
                    </div>
                    <p className="mt-3 text-xs text-green-600">
                      O localStorage será limpo automaticamente...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={28} className="text-red-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-red-800 text-lg">Erro na Migração</p>
                    <div className="mt-3 space-y-2">
                      {resultado.erros.map((erro, index) => (
                        <p key={index} className="text-sm text-red-700">
                          • {erro}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Resultado da Limpeza */}
        {resultadoLimpeza && (
          <div className={`rounded-2xl p-5 border-2 ${
            resultadoLimpeza.sucesso 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {resultadoLimpeza.sucesso ? (
                <>
                  <CheckCircle2 size={28} className="text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-green-800 text-lg">Limpeza Concluída!</p>
                    <div className="mt-3 space-y-1 text-sm text-green-700">
                      <p>✓ {resultadoLimpeza.produtosRemovidos} produtos removidos</p>
                      <p>✓ {resultadoLimpeza.mesasRemovidas} mesas removidas</p>
                      <p>✓ {resultadoLimpeza.pedidosRemovidos} pedidos removidos</p>
                    </div>
                    <p className="mt-3 text-xs text-green-600">
                      O banco de dados Firebase foi limpo com sucesso.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={28} className="text-red-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-red-800 text-lg">Erro na Limpeza</p>
                    <div className="mt-3 space-y-2">
                      {resultadoLimpeza.erros.map((erro, index) => (
                        <p key={index} className="text-sm text-red-700">
                          • {erro}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          {firebaseConfigurado && dadosLocais.produtos + dadosLocais.mesas + dadosLocais.pedidos > 0 && (
            <button
              onClick={handleMigrar}
              disabled={migrando}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {migrando ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Migrar Dados para Firebase
                </>
              )}
            </button>
          )}

          {dadosLocais.produtos + dadosLocais.mesas + dadosLocais.pedidos > 0 && (
            <button
              onClick={handleLimpar}
              disabled={migrando}
              className="w-full py-4 bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={20} />
              Limpar LocalStorage
            </button>
          )}

          {firebaseConfigurado && (
            <button
              onClick={handleLimparFirebase}
              disabled={limpando || migrando}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {limpando ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Limpando Firebase...
                </>
              ) : (
                <>
                  <Trash2 size={20} />
                  Limpar Banco de Dados Firebase
                </>
              )}
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Voltar para Mesas
          </button>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Como funciona:</p>
              <ul className="space-y-1 text-xs">
                <li>• Os dados do navegador serão copiados para o Firebase</li>
                <li>• Após a migração, o app usará o Firebase como fonte principal</li>
                <li>• O localStorage será limpo automaticamente</li>
                <li>• Você pode acessar os dados de qualquer dispositivo</li>
              </ul>
              <p className="font-semibold mb-2 mt-4">Limpar Banco de Dados:</p>
              <ul className="space-y-1 text-xs">
                <li>• Remove TODOS os dados do Firebase (produtos, mesas, pedidos)</li>
                <li>• ⚠️ Esta ação NÃO PODE ser desfeita</li>
                <li>• Use apenas se houver problemas com os dados</li>
                <li>• Após limpar, o app voltará a usar dados de exemplo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
