import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, CheckCircle2, XCircle, Copy, ExternalLink, AlertCircle, ArrowRight } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';
import { verificarDadosLocais } from '../services/migracaoService';

export default function ConfigFirebase() {
  const navigate = useNavigate();
  const [configurado, setConfigurado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [dadosLocais, setDadosLocais] = useState({ produtos: 0, mesas: 0, pedidos: 0 });

  useEffect(() => {
    setConfigurado(isFirebaseConfigured());
    setDadosLocais(verificarDadosLocais());
  }, []);

  const copiarExemplo = () => {
    const exemplo = `VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456`;

    navigator.clipboard.writeText(exemplo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Database size={24} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurar Firebase</h2>
          <p className="text-sm text-slate-500">Sincronize dados na nuvem</p>
        </div>
      </div>

      {/* Status */}
      <div className={`rounded-2xl p-5 border-2 ${
        configurado 
          ? 'bg-green-50 border-green-300' 
          : 'bg-amber-50 border-amber-300'
      }`}>
        <div className="flex items-start gap-3">
          {configurado ? (
            <>
              <CheckCircle2 size={28} className="text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-green-800 text-lg">Firebase Configurado!</p>
                <p className="text-sm text-green-700 mt-1">
                  Seus dados estão sendo sincronizados com o Firebase Firestore.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={28} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-800 text-lg">Firebase Não Configurado</p>
                <p className="text-sm text-amber-700 mt-1">
                  O app está usando localStorage. Configure o Firebase para sincronizar dados na nuvem.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Passo a passo */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Como configurar:</h3>

        {/* Passo 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Criar projeto no Firebase</p>
              <p className="text-sm text-slate-600 mt-1">
                Acesse o console do Firebase e crie um novo projeto gratuito.
              </p>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                <ExternalLink size={14} />
                Abrir Firebase Console
              </a>
            </div>
          </div>
        </div>

        {/* Passo 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Ativar Firestore Database</p>
              <p className="text-sm text-slate-600 mt-1">
                No menu lateral, clique em "Firestore Database" e ative o banco de dados.
              </p>
              <div className="mt-2 bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  💡 Escolha "Iniciar no modo de teste" para desenvolvimento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Passo 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              3
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Registrar aplicativo Web</p>
              <p className="text-sm text-slate-600 mt-1">
                Na página inicial do projeto, clique no ícone Web (&lt;/&gt;) para registrar o app.
              </p>
              <div className="mt-2 bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  💡 Dê um nome como "pedido-certo-web" e NÃO marque "Firebase Hosting"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Passo 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              4
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Copiar credenciais</p>
              <p className="text-sm text-slate-600 mt-1">
                Após registrar, copie as credenciais que aparecerão na tela.
              </p>
              <div className="mt-2 bg-slate-800 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
                <p>apiKey: "AIza..."</p>
                <p>authDomain: "seu-projeto.firebaseapp.com"</p>
                <p>projectId: "seu-projeto-id"</p>
                <p>...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Passo 5 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              5
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Editar arquivo .env</p>
              <p className="text-sm text-slate-600 mt-1">
                Abra o arquivo <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">.env</code> na raiz do projeto e preencha com suas credenciais:
              </p>
              <div className="mt-2 relative">
                <pre className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
{`VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123`}
                </pre>
                <button
                  onClick={copiarExemplo}
                  className="absolute top-2 right-2 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                  title="Copiar exemplo"
                >
                  <Copy size={14} className="text-white" />
                </button>
                {copiado && (
                  <div className="absolute top-2 right-12 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Copiado!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Passo 6 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              6
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">Reiniciar o servidor</p>
              <p className="text-sm text-slate-600 mt-1">
                Após salvar o arquivo .env, reinicie o servidor de desenvolvimento:
              </p>
              <div className="mt-2 bg-slate-800 rounded-lg p-3 font-mono text-xs text-green-400">
                <p>npm run dev</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Importante:</p>
            <ul className="space-y-1 text-xs">
              <li>• O Firebase é gratuito até 1GB de dados</li>
              <li>• O app funciona sem Firebase (usa localStorage)</li>
              <li>• Após configurar, os dados serão sincronizados em tempo real</li>
              <li>• Para produção, configure regras de segurança no Firestore</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botão de Migração */}
      {configurado && (dadosLocais.produtos > 0 || dadosLocais.mesas > 0 || dadosLocais.pedidos > 0) && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Database size={24} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-800 mb-1">Migrar Dados</p>
              <p className="text-sm text-emerald-700 mb-3">
                Você tem dados no navegador que podem ser migrados para o Firebase:
              </p>
              <div className="text-xs text-emerald-600 mb-3 space-y-1">
                <p>• {dadosLocais.produtos} produtos</p>
                <p>• {dadosLocais.mesas} mesas</p>
                <p>• {dadosLocais.pedidos} pedidos</p>
              </div>
              <button
                onClick={() => navigate('/migrar')}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                Migrar para Firebase
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link para documentação */}
      <a
        href="https://firebase.google.com/docs/firestore/quickstart"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-4 bg-blue-600 text-white rounded-xl text-center font-semibold hover:bg-blue-700 transition-colors"
      >
        Ver documentação oficial do Firebase
      </a>
    </div>
  );
}
