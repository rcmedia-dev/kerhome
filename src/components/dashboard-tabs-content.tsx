import React from 'react';

import { MinhasPropriedades } from './dashboard/tabs/my-properties-tab';
import { Favoritas } from './dashboard/tabs/favorites-tab';
import { Faturas } from './dashboard/tabs/invoices-tab';
import { PropriedadesMaisVisualizadas } from './dashboard/tabs/most-viewed-tab';
import { AgencyProperties } from './dashboard/tabs/agency-properties-tab';
import { VisitasAgendadas } from './dashboard/tabs/scheduled-visits-tab';

// =======================
// Export
// =======================
export const DashboardTabs = {
  MinhasPropriedades: React.memo(MinhasPropriedades),
  Favoritas: React.memo(Favoritas),
  Faturas: React.memo(Faturas),
  PropriedadesMaisVisualizadas: React.memo(PropriedadesMaisVisualizadas),
  AgencyProperties: React.memo(AgencyProperties),
  VisitasAgendadas: React.memo(VisitasAgendadas)
};

export {
  MinhasPropriedades,
  Favoritas,
  Faturas,
  PropriedadesMaisVisualizadas,
  AgencyProperties,
  VisitasAgendadas
};
