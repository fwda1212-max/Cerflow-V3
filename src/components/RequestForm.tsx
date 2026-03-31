import React, { useState } from 'react';
import { CompanyProfile, WorkRequest } from '../types';
import { generateCerfaPDF } from '../services/pdfService';
import {
  FileDown,
  MapPin,
  Calendar,
  Info,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle,
  ShieldCheck,
  Paperclip,
  TrafficCone,
} from 'lucide-react';

interface RequestFormProps {
  profile: CompanyProfile | null;
  onRedirectToProfile: () => void;
}

// ── Reusable UI helpers ──────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center space-x-2 mb-6">
    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">{icon}</div>
    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{title}</h2>
  </div>
);

const inputCls =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none';
const selectCls = inputCls + ' appearance-none';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer group">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
    />
    <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
  </label>
);

interface RadioProps {
  id: string;
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
}
const Radio: React.FC<RadioProps> = ({ id, name, label, value, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer group">
    <input
      id={id}
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="w-5 h-5 border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
    />
    <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
  </label>
);

// ── Default form state ───────────────────────────────────────────────────────

const defaultFormData: WorkRequest = {
  locationAddress: '',
  locationPostalCode: '',
  locationCity: '',
  roadType: 'communale',
  roadNumber: '',
  prOriginKm: '',
  prOriginM: '',
  prEndKm: '',
  prEndM: '',
  agglomeration: 'en',

  workDescription: '',
  startDate: '',
  durationDays: 1,
  hasPriorPermission: false,
  priorPermissionRef: '',

  roadSectionCourante: true,
  roadBretelle: false,

  trafficDirection: 'deux_sens',
  alternateTraffic: 'none',

  restrictionBAU: false,
  restrictionEmpiètement: false,
  restrictionSuppression: false,
  largeurVoieMaintenue: '',
  nombreVoiesSupprimees: '',

  interdictionCirculerVL: false,
  interdictionCirculerPL: false,
  interdictionStationnerVL: false,
  interdictionStationnerPL: false,
  interdictionDepasserVL: false,
  interdictionDepasserPL: false,

  vitesseLimitee: '',

  deviationNecessaire: false,
  deviationDetails: '',

  signalisationPar: 'demandeur',

  pieceNoticeDetaillee: false,
  piecePlanSituation: false,
  piecePlanTravaux: false,
  pieceSchemaSignalisation: false,
  pieceItineraireDeviation: false,
};

// ── Main Component ───────────────────────────────────────────────────────────

const RequestForm: React.FC<RequestFormProps> = ({ profile, onRedirectToProfile }) => {
  const [formData, setFormData] = useState<WorkRequest>(defaultFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto">
        <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil incomplet</h2>
        <p className="text-gray-600 mb-8">
          Vous devez configurer les informations de votre entreprise avant de pouvoir générer une demande de travaux.
        </p>
        <button
          onClick={onRedirectToProfile}
          className="inline-flex items-center px-8 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all"
        >
          Configurer mon profil
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    );
  }

  const set = <K extends keyof WorkRequest>(key: K, value: WorkRequest[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationDays' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    try {
      await generateCerfaPDF(profile, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la génération du PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isRouteDeptOrNat = formData.roadType === 'departementale' || formData.roadType === 'nationale' || formData.roadType === 'autoroute';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle Demande</h1>
        <p className="text-gray-600 mt-2">Remplissez les détails du chantier pour générer votre CERFA 14024*01.</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Erreur de génération</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">CERFA généré avec succès !</p>
              <p className="text-sm opacity-90">Le téléchargement a été lancé automatiquement.</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="whitespace-nowrap px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md"
          >
            Télécharger à nouveau
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-10">

          {/* ── 1. LOCALISATION ──────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<MapPin className="w-5 h-5 text-blue-600" />} title="Localisation du site concerné" />

            {/* Type de voie */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-semibold text-gray-700">Type de voie concernée</label>
              <select name="roadType" value={formData.roadType} onChange={handleTextChange} className={selectCls}>
                <option value="communale">Voie communale</option>
                <option value="departementale">Route départementale</option>
                <option value="nationale">Route nationale</option>
                <option value="autoroute">Autoroute</option>
              </select>
            </div>

            {/* Numéro de voie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Numéro de voie</label>
                <input
                  type="text"
                  name="roadNumber"
                  value={formData.roadNumber}
                  onChange={handleTextChange}
                  placeholder="Ex: D1075, N85, A48…"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Localisation (hors/en agglomération)</label>
                <select name="agglomeration" value={formData.agglomeration} onChange={handleTextChange} className={selectCls}>
                  <option value="en">En agglomération</option>
                  <option value="hors">Hors agglomération</option>
                </select>
              </div>
            </div>

            {/* PR routiers — uniquement si dépt / nat / autoroute */}
            {isRouteDeptOrNat && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 space-y-4">
                <p className="text-sm font-semibold text-blue-800">Points de Repère (PR) routiers</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">PR origine (km)</label>
                    <input type="text" name="prOriginKm" value={formData.prOriginKm} onChange={handleTextChange} placeholder="Ex: 12" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">PR origine (+m)</label>
                    <input type="text" name="prOriginM" value={formData.prOriginM} onChange={handleTextChange} placeholder="Ex: 450" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">PR fin (km)</label>
                    <input type="text" name="prEndKm" value={formData.prEndKm} onChange={handleTextChange} placeholder="Ex: 13" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">PR fin (+m)</label>
                    <input type="text" name="prEndM" value={formData.prEndM} onChange={handleTextChange} placeholder="Ex: 200" className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* Adresse, code postal, commune */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-semibold text-gray-700">Adresse des travaux</label>
              <input
                required
                type="text"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleTextChange}
                placeholder="Ex: 56 rue de la République"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Code postal</label>
                <input
                  required
                  type="text"
                  name="locationPostalCode"
                  value={formData.locationPostalCode}
                  onChange={handleTextChange}
                  placeholder="Ex: 38140"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Commune</label>
                <input
                  required
                  type="text"
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleTextChange}
                  placeholder="Ex: Rives"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* ── 2. NATURE ET DATE DES TRAVAUX ────────────────────────────── */}
          <section>
            <SectionHeader icon={<Calendar className="w-5 h-5 text-blue-600" />} title="Nature et date des travaux" />

            <div className="space-y-2 mb-6">
              <label className="text-sm font-semibold text-gray-700">Description détaillée des travaux</label>
              <textarea
                required
                name="workDescription"
                value={formData.workDescription}
                onChange={handleTextChange}
                rows={4}
                placeholder="Décrivez précisément les travaux (ex: Réfection de chaussée, pose de fibre optique...)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Date de début prévue</label>
                <input required type="date" name="startDate" value={formData.startDate} onChange={handleTextChange} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Durée estimée (jours calendaires)</label>
                <input required type="number" min="1" name="durationDays" value={formData.durationDays} onChange={handleTextChange} className={inputCls} />
              </div>
            </div>

            {/* Permission de voirie antérieure */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700">Permission de voirie antérieure :</span>
                <Radio id="perm_non" name="hasPriorPermission" label="Non" value="false"
                  checked={!formData.hasPriorPermission} onChange={() => set('hasPriorPermission', false)} />
                <Radio id="perm_oui" name="hasPriorPermission" label="Oui" value="true"
                  checked={formData.hasPriorPermission} onChange={() => set('hasPriorPermission', true)} />
              </div>
              {formData.hasPriorPermission && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Référence de la permission antérieure</label>
                  <input
                    type="text"
                    name="priorPermissionRef"
                    value={formData.priorPermissionRef}
                    onChange={handleTextChange}
                    placeholder="Ex: 2024-TP-0042"
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── 3. RÉGLEMENTATION SOUHAITÉE ──────────────────────────────── */}
          <section>
            <SectionHeader icon={<TrafficCone className="w-5 h-5 text-blue-600" />} title="Réglementation souhaitée" />

            {/* 3a. Type de voirie */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Type de voirie (plusieurs choix possibles)</p>
              <div className="flex flex-wrap gap-4">
                <Checkbox id="roadSectionCourante" label="Restriction sur section courante"
                  checked={formData.roadSectionCourante} onChange={(v) => set('roadSectionCourante', v)} />
                <Checkbox id="roadBretelle" label="Restriction sur bretelles"
                  checked={formData.roadBretelle} onChange={(v) => set('roadBretelle', v)} />
              </div>
            </div>

            {/* 3b. Sens de circulation */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Sens de circulation concerné (un seul choix)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Radio id="dir_deux" name="trafficDirection" label="Deux sens de circulation"
                  value="deux_sens" checked={formData.trafficDirection === 'deux_sens'} onChange={(v) => set('trafficDirection', v as WorkRequest['trafficDirection'])} />
                <Radio id="dir_croissants" name="trafficDirection" label="Sens des PR croissants"
                  value="pr_croissants" checked={formData.trafficDirection === 'pr_croissants'} onChange={(v) => set('trafficDirection', v as WorkRequest['trafficDirection'])} />
                <Radio id="dir_decroissants" name="trafficDirection" label="Sens des PR décroissants"
                  value="pr_decroissants" checked={formData.trafficDirection === 'pr_decroissants'} onChange={(v) => set('trafficDirection', v as WorkRequest['trafficDirection'])} />
                <Radio id="dir_fermeture" name="trafficDirection" label="Fermeture à la circulation"
                  value="fermeture" checked={formData.trafficDirection === 'fermeture'} onChange={(v) => set('trafficDirection', v as WorkRequest['trafficDirection'])} />
              </div>
            </div>

            {/* 3c. Circulation alternée */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Circulation alternée (un seul choix)</p>
              <div className="flex flex-wrap gap-4">
                <Radio id="alt_none" name="alternateTraffic" label="Aucune"
                  value="none" checked={formData.alternateTraffic === 'none'} onChange={(v) => set('alternateTraffic', v as WorkRequest['alternateTraffic'])} />
                <Radio id="alt_feux" name="alternateTraffic" label="Par feux tricolores"
                  value="feux" checked={formData.alternateTraffic === 'feux'} onChange={(v) => set('alternateTraffic', v as WorkRequest['alternateTraffic'])} />
                <Radio id="alt_man" name="alternateTraffic" label="Manuellement"
                  value="manuellement" checked={formData.alternateTraffic === 'manuellement'} onChange={(v) => set('alternateTraffic', v as WorkRequest['alternateTraffic'])} />
              </div>
            </div>

            {/* 3d. Restriction de chaussée */}
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Restriction de chaussée (plusieurs choix possibles)</p>
              <div className="space-y-3">
                <Checkbox id="rBAU" label="Neutralisation de la bande d'arrêt d'urgence (BAU)"
                  checked={formData.restrictionBAU} onChange={(v) => set('restrictionBAU', v)} />
                <Checkbox id="rEmpiettement" label="Empiètement sur chaussée"
                  checked={formData.restrictionEmpiètement} onChange={(v) => set('restrictionEmpiètement', v)} />
                {formData.restrictionEmpiètement && (
                  <div className="ml-8 space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Largeur de voie maintenue (m)</label>
                    <input type="text" name="largeurVoieMaintenue" value={formData.largeurVoieMaintenue}
                      onChange={handleTextChange} placeholder="Ex: 3.5" className={inputCls + ' max-w-xs'} />
                  </div>
                )}
                <Checkbox id="rSuppression" label="Suppression de voie"
                  checked={formData.restrictionSuppression} onChange={(v) => set('restrictionSuppression', v)} />
                {formData.restrictionSuppression && (
                  <div className="ml-8 space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Nombre de voie(s) supprimée(s)</label>
                    <input type="text" name="nombreVoiesSupprimees" value={formData.nombreVoiesSupprimees}
                      onChange={handleTextChange} placeholder="Ex: 1" className={inputCls + ' max-w-xs'} />
                  </div>
                )}
              </div>
            </div>

            {/* 3e. Interdictions */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Interdiction de (plusieurs choix possibles)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">Circuler</p>
                  <Checkbox id="circVL" label="Véhicules légers" checked={formData.interdictionCirculerVL} onChange={(v) => set('interdictionCirculerVL', v)} />
                  <Checkbox id="circPL" label="Poids lourds" checked={formData.interdictionCirculerPL} onChange={(v) => set('interdictionCirculerPL', v)} />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">Stationner</p>
                  <Checkbox id="statVL" label="Véhicules légers" checked={formData.interdictionStationnerVL} onChange={(v) => set('interdictionStationnerVL', v)} />
                  <Checkbox id="statPL" label="Poids lourds" checked={formData.interdictionStationnerPL} onChange={(v) => set('interdictionStationnerPL', v)} />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">Dépasser</p>
                  <Checkbox id="depVL" label="Véhicules légers" checked={formData.interdictionDepasserVL} onChange={(v) => set('interdictionDepasserVL', v)} />
                  <Checkbox id="depPL" label="Poids lourds" checked={formData.interdictionDepasserPL} onChange={(v) => set('interdictionDepasserPL', v)} />
                </div>
              </div>
            </div>

            {/* 3f. Vitesse limitée */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Limitation de vitesse (km/h, laisser vide si aucune)</label>
                <input type="number" name="vitesseLimitee" value={formData.vitesseLimitee}
                  onChange={handleTextChange} placeholder="Ex: 50" className={inputCls} />
              </div>
            </div>

            {/* 3g. Déviation */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700">Itinéraire de déviation nécessaire :</span>
                <Radio id="dev_non" name="deviationNecessaire" label="Non" value="false"
                  checked={!formData.deviationNecessaire} onChange={() => set('deviationNecessaire', false)} />
                <Radio id="dev_oui" name="deviationNecessaire" label="Oui" value="true"
                  checked={formData.deviationNecessaire} onChange={() => set('deviationNecessaire', true)} />
              </div>
              {formData.deviationNecessaire && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Préciser l'itinéraire de déviation (par sens)</label>
                  <textarea name="deviationDetails" value={formData.deviationDetails} onChange={handleTextChange}
                    rows={3} placeholder="Ex: Depuis A vers B, emprunter la D519 puis la D1085..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
                </div>
              )}
            </div>
          </section>

          {/* ── 4. SIGNALISATION ─────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<ShieldCheck className="w-5 h-5 text-blue-600" />} title="Pose et retrait de la signalisation" />
            <p className="text-sm text-gray-600 mb-4">
              La pose, le maintien ou le retrait de la signalisation spécifique au chantier sont effectués par :
            </p>
            <div className="flex flex-wrap gap-6">
              <Radio id="sig_dem" name="signalisationPar" label="Le demandeur"
                value="demandeur" checked={formData.signalisationPar === 'demandeur'}
                onChange={(v) => set('signalisationPar', v as WorkRequest['signalisationPar'])} />
              <Radio id="sig_ent" name="signalisationPar" label="Une entreprise spécialisée"
                value="entreprise_specialisee" checked={formData.signalisationPar === 'entreprise_specialisee'}
                onChange={(v) => set('signalisationPar', v as WorkRequest['signalisationPar'])} />
            </div>
          </section>

          {/* ── 5. PIÈCES JOINTES ────────────────────────────────────────── */}
          <section>
            <SectionHeader icon={<Paperclip className="w-5 h-5 text-blue-600" />} title="Pièces jointes à la demande" />
            <p className="text-sm text-gray-600 mb-4">Cochez les documents inclus dans le dossier :</p>
            <div className="space-y-3">
              <Checkbox id="pj1" label="Une notice détaillée avec notamment l'évaluation de la gêne occasionnée aux usagers"
                checked={formData.pieceNoticeDetaillee} onChange={(v) => set('pieceNoticeDetaillee', v)} />
              <Checkbox id="pj2" label="Plan de situation 1/10 000 ou 1/20 000ème"
                checked={formData.piecePlanSituation} onChange={(v) => set('piecePlanSituation', v)} />
              <Checkbox id="pj3" label="Plan des travaux 1/200 ou 1/500ème"
                checked={formData.piecePlanTravaux} onChange={(v) => set('piecePlanTravaux', v)} />
              <Checkbox id="pj4" label="Schéma de signalisation"
                checked={formData.pieceSchemaSignalisation} onChange={(v) => set('pieceSchemaSignalisation', v)} />
              <Checkbox id="pj5" label="Itinéraire de déviation 1/2 000 ou 1/5 000ème"
                checked={formData.pieceItineraireDeviation} onChange={(v) => set('pieceItineraireDeviation', v)} />
            </div>
          </section>
        </div>

        {/* ── Footer / Submit ───────────────────────────────────────────── */}
        <div className="bg-gray-50 px-8 py-8 flex flex-col md:flex-row items-center justify-between border-t border-gray-100 gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <Info className="w-4 h-4 mr-2 text-blue-500" />
            Le PDF généré respecte le format officiel CERFA 14024*01.
          </div>
          <button
            type="submit"
            disabled={isGenerating}
            className={`inline-flex items-center px-10 py-4 bg-brand-600 text-white font-bold rounded-xl shadow-xl shadow-brand-200 hover:bg-brand-700 transform transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${isGenerating ? 'animate-pulse' : ''}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5 mr-3" />
                Générer le CERFA
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
