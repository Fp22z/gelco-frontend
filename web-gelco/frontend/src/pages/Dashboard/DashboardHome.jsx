import { useEffect, useState } from 'react';
import { getInfoSession } from '../../services/sessionService';
import DashboardAdmin from './DashboardAdmin';
import DashboardConsultora from './DashboardConsultora';
import DashboardDistribuidor from './DashboardDistribuidor';
import DashboardRRHH from './DashboardRRHH';
import DashboardRecepcionista from './DashboardRecepcionista';
import DashboardFacturador from './DashboardFacturador';
import DashboardDespacho from './DashboardDespacho';

export default function DashboardHome() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const info = getInfoSession();
    if (info) {
      setUserInfo(info);
    }
  }, []);

  if (!userInfo) {
    return <div>Cargando...</div>;
  }

  switch (userInfo.perfil) {
    case 'ADMIN': // Nota: Asegúrate de que esto coincida exactamente con el nombre de tu BD (ADMIN o ADMINISTRADOR)
      return <DashboardAdmin />;
    case 'CONSULTORA':
      return <DashboardConsultora />;
    case 'DISTRIBUIDOR':
      return <DashboardDistribuidor />;
    case 'RECURSOS_HUMANOS':
      return <DashboardRRHH />;
    case 'RECEPCIONISTA':
      return <DashboardRecepcionista />;
    case 'FACTURADOR':
      return <DashboardFacturador />;
    case 'DESPACHO':
      return <DashboardDespacho />;
    default:
      return <div>Rol no reconocido: {userInfo.perfil}</div>;
  }
}