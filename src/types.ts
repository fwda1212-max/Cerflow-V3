export interface CompanyProfile {
  companyName: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface WorkRequest {
  // Localisation
  locationAddress: string;
  locationPostalCode: string;
  locationCity: string;
  roadType: 'communale' | 'departementale' | 'nationale' | 'autoroute';
  roadNumber: string;
  prOriginKm: string;
  prOriginM: string;
  prEndKm: string;
  prEndM: string;
  agglomeration: 'hors' | 'en';

  // Nature et dates
  workDescription: string;
  startDate: string;
  durationDays: number;
  hasPriorPermission: boolean;
  priorPermissionRef: string;

  // Réglementation - type de voirie (cases à cocher multiples)
  roadSectionCourante: boolean;
  roadBretelle: boolean;

  // Sens de circulation (un seul choix)
  trafficDirection: 'deux_sens' | 'pr_croissants' | 'pr_decroissants' | 'fermeture';

  // Circulation alternée (un seul choix)
  alternateTraffic: 'none' | 'feux' | 'manuellement';

  // Restriction de chaussée (plusieurs choix)
  restrictionBAU: boolean;
  restrictionEmpiètement: boolean;
  restrictionSuppression: boolean;
  largeurVoieMaintenue: string;
  nombreVoiesSupprimees: string;

  // Interdictions (plusieurs choix)
  interdictionCirculerVL: boolean;
  interdictionCirculerPL: boolean;
  interdictionStationnerVL: boolean;
  interdictionStationnerPL: boolean;
  interdictionDepasserVL: boolean;
  interdictionDepasserPL: boolean;

  // Vitesse
  vitesseLimitee: string;

  // Déviation
  deviationNecessaire: boolean;
  deviationDetails: string;

  // Signalisation
  signalisationPar: 'demandeur' | 'entreprise_specialisee';

  // Pièces jointes
  pieceNoticeDetaillee: boolean;
  piecePlanSituation: boolean;
  piecePlanTravaux: boolean;
  pieceSchemaSignalisation: boolean;
  pieceItineraireDeviation: boolean;
}

export type ViewState = 'dashboard' | 'profile' | 'request';