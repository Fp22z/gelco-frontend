# Quick Start Guide - Refactored Frontend

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/pnpm installed
- Backend running on `http://localhost:8080/api/v1`

### Setup (First Time)
```bash
cd web-gelco/frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5174/` (or next available port)

---

## 🎬 Testing the App

### 1. Home Page
- Navigate to `http://localhost:5174/`
- See hero, services, characteristics sections
- Products section loads from backend (if available)

### 2. Login
- Click "Iniciar Sesión" on home
- Enter test credentials:
  - Email: `admin@gelco.com`
  - Password: `password123` (or from your backend)
- Success → redirects to Dashboard
- Error → see "Correo o contraseña incorrectos" toast

### 3. Dashboard
- Protected route (requires login)
- Shows user name + role in topbar
- Sidebar shows menu based on role:
  - **ADMIN**: Productos, Usuarios
  - **CONSULTORA**: Catálogo, Mis Pedidos
  - **SUPERVISOR**: Reportes, Consultoras

### 4. Products Table
- Click "Productos" in sidebar (or navigate to `/dashboard/productos`)
- See table with all products from API
- Columns: Nombre, Descripción, Precio (S/.), Stock, Categoría, Activo

### 5. Logout
- Click "Cerrar Sesión" button
- Token removed from localStorage
- Redirect to login page

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main routing configuration |
| `src/services/authService.js` | Login/Register/Logout logic |
| `src/services/sessionService.js` | JWT decoding & user info |
| `src/services/productoService.js` | Product API calls |
| `src/services/toastService.js` | Toast notifications |
| `src/components/PrivateRoute.jsx` | Route protection |
| `src/pages/Dashboard/Dashboard.jsx` | Main dashboard layout |
| `src/pages/GestionProductos/GestionProductos.jsx` | Products table |

---

## 🔧 Common Tasks

### Show a Toast Notification
```javascript
import { useToast } from '../../services/toastService';

function MyComponent() {
  const { show } = useToast();
  
  const handleClick = () => {
    show('Success message', 'success');      // Green
    show('Error occurred', 'danger');        // Red
    show('Warning!', 'warning');             // Orange
    show('Info', 'info');                    // Blue
  };
}
```

### Fetch Data with Authentication
```javascript
import { getProductos } from '../../services/productoService';

async function loadProducts() {
  try {
    const productos = await getProductos();
    console.log(productos);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Get Current User Info
```javascript
import { getInfoSession } from '../../services/sessionService';

const userInfo = getInfoSession();
console.log(userInfo);
// { email: 'admin@gelco.com', userId: 1, nombre: 'Admin Principal', perfil: 'ADMIN' }
```

### Check if User is Logged In
```javascript
import { isLoggedIn } from '../../services/authService';

if (isLoggedIn()) {
  // User is logged in
} else {
  // User is not logged in
}
```

### Logout Programmatically
```javascript
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
}
```

---

## 🐛 Troubleshooting

### Blank Page
- Check browser console for errors
- Ensure backend is running
- Clear browser cache and refresh

### "Cannot find module" Error
- Ensure all files are in correct directories
- Check import paths (relative vs absolute)
- Run `npm install` again

### API 401 Unauthorized
- Token might be invalid or expired
- Clear localStorage and login again
- Check backend token validation

### Toasts Not Showing
- Ensure component is inside `<ToastProvider>` (in App.jsx)
- Check that `<ToastContainer />` is in App.jsx
- Verify no CSS is hiding the container

### Routes Not Working
- Check that `<BrowserRouter>` wraps all routes
- Verify route paths match navigation links
- Check console for routing errors

---

## 📚 Documentation Files

1. **REFACTORING_SUMMARY.md** - Complete architecture overview
2. **IMPLEMENTATION_NOTES.md** - Detailed implementation guide with examples
3. **QUICKSTART.md** - This file (quick reference)

---

## 🔗 Backend Integration

### Expected Backend Endpoints

```
POST   /api/v1/auth/login      → { token }
POST   /api/v1/auth/register   → { token }
GET    /api/v1/productos       → Producto[]
POST   /api/v1/productos       → Create product
PUT    /api/v1/productos/{id}  → Update product
DELETE /api/v1/productos/{id}  → Delete product
```

### JWT Claims Format
```javascript
{
  "sub": "admin@gelco.com",     // email
  "id": 1,                       // userId
  "nombre": "Admin Principal",  // display name
  "perfil": "ADMIN",             // role
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Authentication Header
```javascript
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

---

## ✅ What's Ready to Use

✅ Complete authentication system (login/logout)
✅ Protected dashboard routes
✅ Role-based menu system
✅ Product listing from API
✅ Toast notifications
✅ User session management
✅ JWT token handling
✅ All styling (pink theme)

---

## 🚧 Work in Progress

- Register page (service ready, UI needs creation)
- User management pages (role-specific)
- Product creation/editing (service stubbed)
- Additional role-specific pages

---

## 💡 Tips

1. **Use DevTools** - Inspect Network tab to see API calls
2. **Check Console** - Look for error messages
3. **localStorage** - Token is stored under key `user_token`
4. **Responsive** - App is mobile-friendly, test on different sizes
5. **No External UI Library** - Everything styled with plain CSS

---

## 🎯 Next Development

1. Test login with backend credentials
2. Verify product table loads data
3. Implement missing pages for each role
4. Add form validations
5. Implement product creation/editing
6. Add more features as needed

---

## 📞 Questions?

Refer to:
- `IMPLEMENTATION_NOTES.md` for detailed examples
- `REFACTORING_SUMMARY.md` for architecture details
- Browser console for error messages
- Network tab for API debugging

Happy coding! 🚀
