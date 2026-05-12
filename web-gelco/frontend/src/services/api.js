import { environment } from '../environments/environment';

export const getProductos = async () => {
  const res = await fetch(`${environment.url}/productos`);
  return res.json();
};