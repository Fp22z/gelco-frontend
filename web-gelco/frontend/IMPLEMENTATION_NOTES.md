# Implementation Notes & Development Guide

## 🎯 Key Implementation Details

### JWT Token Handling
The refactored app uses **manual JWT decoding** without any libraries:

```javascript
// In sessionService.js
const payload = JSON.parse(atob(token.split('.')[1]));
return {
  email: payload.sub,        // Claims mapping
  userId: payload.id,
  nombre: payload.nombre,
  perfil: payload.perfil
};
```

**Why this approach?**
- No additional dependencies needed
- Lightweight and fast
- JWT format is well-defined: `[header].[payload].[signature]`
- Only the payload is decoded (atob decodes base64)

---

## 🔗 Service Layer Architecture

### How Services Work Together

```
Page/Component
    ↓
useToast() hook
    ↓
authService / productoService / sessionService
    ↓
fetch() to backend
    ↓
localStorage for persistence
```

### Example: Login Flow
```javascript
// In Login.jsx
const handleSubmit = async (e) => {
  const response = await authService.login({ email, password });
  authService.saveToken(response.token);        // Store JWT
  navigate('/dashboard');
};

// In Dashboard.jsx
const userInfo = sessionService.getInfoSession(); // Read JWT
setUserInfo(userInfo);  // { email, userId, nombre, perfil }
```

---

## 🛡️ Protected Routes Implementation

### PrivateRoute Component
```javascript
// Only renders <Outlet /> if authenticated
if (!authService.isLoggedIn()) {
  return <Navigate to="/login" replace />;
}
return <Outlet />;  // Nested routes rendered here
```

### Route Structure
```javascript
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<Dashboard />}>
    <Route path="productos" element={<GestionProductos />} />
  </Route>
</Route>
```

**Result**: 
- `/dashboard` requires auth
- `/dashboard/productos` nested under Dashboard
- Dashboard renders `<Outlet />` for child routes

---

## 📢 Toast Notification System

### How to Use Toasts

**In any component wrapped by ToastProvider:**
```javascript
const { show } = useToast();

// Show different types
show('Success message', 'success');      // ✓ Green
show('Error occurred', 'danger');        // ✗ Red
show('Warning!', 'warning');             // ⚠ Orange
show('Info message', 'info');            // ℹ Blue
```

### Auto-Removal
Toasts auto-remove after 3 seconds (configurable in `toastService.js`):
```javascript
setTimeout(() => {
  remove(id);
}, 3000);  // Change this value to adjust timeout
```

---

## 🔄 State Management Strategy

**No Redux/Context needed!** The app uses:

1. **localStorage** - JWT token (persistent)
2. **React State** - UI state (temporary)
3. **ToastContext** - Global notifications
4. **Service functions** - Pure API calls

### Example: Product Fetching
```javascript
const [productos, setProductos] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  productoService.getProductos()
    .then(data => setProductos(data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
```

---

## 🔐 Role-Based Access Control

### Dashboard Role Menu
```javascript
const getMenuLinks = () => {
  switch (userInfo.perfil) {
    case 'ADMIN':
      return [
        { label: 'Productos', path: '/dashboard/productos' },
        { label: 'Usuarios', path: '/dashboard/usuarios' },
      ];
    case 'CONSULTORA':
      return [
        { label: 'Catálogo', path: '/dashboard/catalogo' },
        { label: 'Mis Pedidos', path: '/dashboard/pedidos' },
      ];
    case 'SUPERVISOR':
      return [
        { label: 'Reportes', path: '/dashboard/reportes' },
        { label: 'Consultoras', path: '/dashboard/consultoras' },
      ];
    default:
      return [];
  }
};
```

**Note**: Menu is **static** based on JWT perfil claim, not dynamic from backend.

---

## 🚀 Completing Stubbed Features

### 1. Add "Nuevo Producto" Functionality

**Current**: Button shows info toast
**To Implement**:

```javascript
// In GestionProductos.jsx
const handleNuevoProducto = () => {
  // Option A: Open modal
  setShowModal(true);
  
  // Option B: Navigate to form page
  navigate('/dashboard/productos/nuevo');
};

// On form submit:
const handleFormSubmit = async (formData) => {
  try {
    await productoService.registrarProducto(formData);
    showToast('Producto creado exitosamente', 'success');
    // Reload table or navigate back
  } catch (error) {
    showToast('Error al crear producto', 'danger');
  }
};
```

### 2. Implement Missing Pages

**For each role, create corresponding pages:**

```javascript
// /dashboard/usuarios (ADMIN)
// /dashboard/catalogo (CONSULTORA)
// /dashboard/pedidos (CONSULTORA)
// /dashboard/reportes (SUPERVISOR)
// /dashboard/consultoras (SUPERVISOR)
```

**Template structure:**
```javascript
export default function NewPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    // Fetch data from appropriate service
  }, []);

  return (
    <div className="page-container">
      <h1>Page Title</h1>
      {/* Content here */}
    </div>
  );
}
```

### 3. Add Register Page

**Create `/src/pages/Register/Register.jsx`:**

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, saveToken } from '../../services/authService';
import { useToast } from '../../services/toastService';
import './Register.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { show: showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await register({ email, password, nombre });
      saveToken(response.token);
      showToast('Registro exitoso', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Error en el registro', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Form JSX
  );
}
```

**Add to routes in App.jsx:**
```javascript
<Route path="/register" element={<Register />} />
```

---

## 🐛 Debugging Tips

### Check localStorage
```javascript
// In browser console:
localStorage.getItem('user_token');
JSON.parse(atob(localStorage.getItem('user_token').split('.')[1]));
```

### Check API Requests
Enable network tab in browser DevTools to see:
- Request headers (Authorization: Bearer token)
- Response status and data
- CORS errors if any

### Debug Session Info
```javascript
import { getInfoSession } from './services/sessionService';
console.log('User session:', getInfoSession());
```

### Common Issues

**Issue**: "useToast must be used within ToastProvider"
- **Fix**: Ensure component is wrapped by `<ToastProvider>` in App.jsx

**Issue**: 401 Unauthorized on API calls
- **Fix**: Check token in localStorage, verify it hasn't expired

**Issue**: Token decode returns null
- **Fix**: JWT might be malformed - check backend response format

**Issue**: Route not protected
- **Fix**: Ensure route is inside `<Route element={<PrivateRoute />}>`

---

## 📊 Testing Checklist

### Unit Test Ideas

```javascript
// Test sessionService.js
describe('sessionService', () => {
  test('decodes valid JWT correctly', () => {
    const token = 'header.eyJzdWIiOiJhZG1pbkBnZWxjby5jb20iLCJpZCI6MX0.signature';
    localStorage.setItem('user_token', token);
    const info = getInfoSession();
    expect(info.email).toBe('admin@gelco.com');
    expect(info.userId).toBe(1);
  });
});

// Test authService.js
describe('authService', () => {
  test('saveToken stores in localStorage', () => {
    saveToken('test-token');
    expect(localStorage.getItem('user_token')).toBe('test-token');
  });
});
```

### E2E Test Scenarios

1. **Happy Path**: Login → Dashboard → View Products → Logout
2. **Error Handling**: Invalid credentials → Error toast
3. **Protected Routes**: Try to access /dashboard without token → Redirect to login
4. **Token Expiry**: Expired token → 401 from API → Redirect to login
5. **Role-Based Access**: CONSULTORA sees different menu than ADMIN

---

## 🎨 Customization Guide

### Change Pink Theme Color
1. Update `Dashboard.css`:
   ```css
   .dashboard-sidebar {
     background-color: #YOUR_COLOR; /* Change from #e45272 */
   }
   ```

2. Update `GestionProductos.css`:
   ```css
   .btn-nuevo-producto {
     background-color: #YOUR_COLOR;
   }
   ```

3. Update `ToastContainer.css` if needed

### Adjust Toast Timeout
In `toastService.js`:
```javascript
setTimeout(() => {
  remove(id);
}, 5000);  // Change from 3000 to 5000ms (5 seconds)
```

### Add More Menu Items
In `Dashboard.jsx`:
```javascript
const getMenuLinks = () => {
  switch (userInfo.perfil) {
    case 'ADMIN':
      return [
        { label: 'Productos', path: '/dashboard/productos' },
        { label: 'Usuarios', path: '/dashboard/usuarios' },
        { label: 'Mi Perfil', path: '/dashboard/perfil' },  // NEW
      ];
    // ...
  }
};
```

---

## 📚 Reference Documentation

### React Router v7
- https://reactrouter.com/

### Fetch API
- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

### JWT (JSON Web Tokens)
- https://jwt.io/
- JWT structure: Header.Payload.Signature (base64 encoded)

### localStorage API
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

## ✅ Next Development Steps

1. **Test with Backend**: Ensure backend is running on `localhost:8080`
2. **Complete Stubbed Services**: Implement registrar, actualizar, eliminar for productos
3. **Add Missing Pages**: Create pages for each role
4. **Add Register Flow**: Implement registration page and navigation
5. **Add Validations**: Form validation, error handling, retry logic
6. **Add Loading States**: Skeletons or spinners while fetching
7. **Improve Error Messages**: More specific error handling
8. **Add Logout Confirmation**: Confirm before logging out
9. **Add Profile Page**: Allow users to view/edit their info
10. **Add Responsive Mobile Design**: Further optimize for mobile

---

## 📞 Support

For issues or questions about the refactored architecture:
1. Check this document first (Implementation Notes)
2. Review REFACTORING_SUMMARY.md for architecture overview
3. Check browser console for error messages
4. Use browser DevTools Network tab to inspect API calls
