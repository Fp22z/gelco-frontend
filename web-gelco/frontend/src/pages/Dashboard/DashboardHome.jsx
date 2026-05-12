import { useEffect, useState } from 'react';
import { getInfoSession } from '../../services/sessionService';
import DashboardAdmin from './DashboardAdmin';
import DashboardConsultora from './DashboardConsultora';
import DashboardDistribuidor from './DashboardDistribuidor';

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
    case 'ADMIN':
      return <DashboardAdmin />;
    case 'CONSULTORA':
      return <DashboardConsultora />;
    case 'DISTRIBUIDOR':
      return <DashboardDistribuidor />;
    default:
      return <div>Rol no reconocido</div>;
  }
}
