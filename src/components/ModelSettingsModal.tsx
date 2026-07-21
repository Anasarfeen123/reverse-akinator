import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Cpu, CheckCircle2, X, Eye, EyeOff, Zap, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { type ModelConfig, type LLMProvider, PROVIDER_MODELS, saveModelConfig } from '../services/modelConfig';
import { testModelConnectionApi } from '../services/api';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSaveConfig: (newConfig: ModelConfig) => void;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [provider, setProvider] = useState<LLMProvider>(config.provider);
  const [model, setModel] = useState<string>(config.model);
  const [isCustomModel, setIsCustomModel] = useState<boolean>(
    !PROVIDER_MODELS[config.provider]?.presets.includes(config.model)
  );
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(config.apiKeys || {});
  const [showKey, setShowKey] = useState<boolean>(false);
  
  const [testState, setTestState] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  if (!isOpen) return null;

  const currentProviderInfo = PROVIDER_MODELS[provider];

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    const info = PROVIDER_MODELS[newProvider];
    setModel(info.defaultModel);
    setIsCustomModel(false);
    setTestState({ loading: false });
  };

  const handleApiKeyChange = (val: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: val,
    }));
    setTestState({ loading: false });
  };

  const handleTestConnection = async () => {
    const tempConfig: ModelConfig = {
      provider,
      model,
      apiKeys,
    };

    setTestState({ loading: true });
    try {
      const res = await testModelConnectionApi(tempConfig);
      setTestState({ loading: false, success: true, message: res.message });
    } catch (err: any) {
      setTestState({
        loading: false,
        success: false,
        message: err.message || 'Failed to connect to model',
      });
    }
  };

  const handleSave = () => {
    const newConfig: ModelConfig = {
      provider,
      model: model.trim() || currentProviderInfo.defaultModel,
      apiKeys,
    };
    saveModelConfig(newConfig);
    onSaveConfig(newConfig);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-emerald-950/20 overflow-hidden text-white font-sans"
        >
          {/* Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-lg">
                <img src="/reverse_akinator_logo.png" alt="Reverse Akinator Logo" className="h-11 sm:h-12 md:h-14 w-auto object-contain rounded-lg" />
                <div className="w-px h-6 bg-slate-700" />
                <img src="/mic-logo.jpg" alt="MIC Club Logo" className="w-10 sm:w-12 h-10 sm:h-12 object-contain rounded-xl border border-stadium-gold/40 p-1 bg-white/90" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold tracking-wide uppercase text-white">
                  AI Model & Engine Settings
                </h3>
                <p className="text-xs text-slate-400">
                  Powered by <strong className="text-stadium-gold">MIC Club</strong> • Select AI provider & API keys
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Provider Selection */}
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Select Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PROVIDER_MODELS) as LLMProvider[]).map((pKey) => {
                  const pInfo = PROVIDER_MODELS[pKey];
                  const isSelected = provider === pKey;
                  return (
                    <button
                      key={pKey}
                      onClick={() => handleProviderChange(pKey)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{pInfo.label}</span>
                      {pKey === 'puter' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30 font-bold">
                          Free
                        </span>
                      )}
                      {pInfo.requiresKey && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/20">
                          API Key
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Selector / Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  Model Selection
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomModel(!isCustomModel)}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  {isCustomModel ? 'Use Preset List' : '+ Enter Custom Model'}
                </button>
              </div>

              {!isCustomModel ? (
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setTestState({ loading: false });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  >
                    {currentProviderInfo.presets.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset} {preset === currentProviderInfo.defaultModel ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. gpt-4-turbo, qwen2.5:14b, etc."
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setTestState({ loading: false });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition placeholder-slate-600"
                />
              )}
            </div>

            {/* API Key Input (if required by provider) */}
            {currentProviderInfo.requiresKey ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  {currentProviderInfo.label} API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={`Enter your ${currentProviderInfo.label} API key...`}
                    value={apiKeys[provider] || ''}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition placeholder-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Saved securely in your browser's local storage.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                {provider === 'puter' ? (
                  <span>Puter.js provides free cloud access to 500+ AI models directly from your browser (No API key required).</span>
                ) : (
                  <span>Ollama runs locally on your machine at port 11434 (No API key required).</span>
                )}
              </div>
            )}

            {/* Connection Test Result */}
            {testState.message && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testState.success
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                }`}
              >
                {testState.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testState.message}</span>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testState.loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition disabled:opacity-50"
            >
              {testState.loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              )}
              Test Connection
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Save & Apply
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
