# Frontend Refactoring Summary

## Overview
The React + Vite frontend has been successfully refactored to follow a layered architecture (Model/Services/Components) while preserving all existing UI/UX and styling.

---

## 🏗️ Architecture Changes

### 1. **Environment Configuration**
- **File**: `src/environments/environment.js`
- **Purpose**: Centralized API configuration
- **Content**: Base URL for backend API (`http://localhost:8080/api/v1`)

### 2. **Model Layer** (`src/model/`)
Plain JavaScript type definitions using JSDoc for type safety without TypeScript.

**Request Models**:
- `model/api/request/loginRequest.js` - Login credentials
- `model/api/request/registerRequest.js` - Registration data

**Response Models**:
- `model/api/response/loginResponse.js` - JWT token response
- `model/api/response/productoResponse.js` - Product data with category

**Session Model**:
- `model/userSesion.js` - User session info (email, userId, nombre, perfil)

### 3. **Services Layer** (`src/services/`)

#### **authService.js**
- `login(credentials)` - POST /auth/login
- `register(data)` - POST /auth/register
- `saveToken(token)` - Stores JWT in localStorage ('user_token')
- `logout()` - Removes token from localStorage
- `isLoggedIn()` - Checks if user is authenticated
- `getToken()` - Retrieves stored token

#### **sessionService.js**
- `getInfoSession()` - Decodes JWT manually and returns { email, userId, nombre, perfil }
  - Uses manual JWT decoding: `JSON.parse(atob(token.split('.')[1]))`
  - Maps JWT claims: `sub` → email, `id` → userId, `nombre` → nombre, `perfil` → perfil

#### **productoService.js**
- `getProductos()` - GET /productos (with Bearer token in header)
- `registrarProducto(data)` - Stub (console.log only)
- `actualizarProducto(data)` - Stub (console.log only)
- `eliminarProducto(id)` - Stub (console.log only)

#### **toastService.js**
- React Context + Hook for notifications
- `ToastProvider` - Wraps app for toast state management
- `useToast()` - Hook returning { toasts, show, remove, clear }
- Auto-removal after 3 seconds
- Types: 'success' | 'danger' | 'warning' | 'info'

---

## 🧩 Components

### **PrivateRoute** (`src/components/PrivateRoute/PrivateRoute.jsx`)
- Protects routes requiring authentication
- Redirects to /login if not authenticated
- Uses `<Outlet />` for nested routes

### **ToastContainer** (`src/components/ToastContainer/ToastContainer.jsx`)
- Fixed position (top-right)
- Auto-removes toasts after 3 seconds
- Color-coded by type
- Styled in `ToastContainer.css`

---

## 📄 Pages

### **Home** (`src/pages/Home/Home.jsx`)
- **Changed**: Updated import from `api.js` to `productoService.js`
- **Auth Header**: productoService now includes Bearer token automatically
- **Error Handling**: Silently handles API errors (optional section)
- **Styling**: Unchanged (pink theme #e45272, Poppins font)

### **Login** (`src/pages/Login/Login.jsx`)
- **Changed**: Implemented real authentication flow
- **Workflow**: 
  1. Form submission calls `authLogin()` from authService
  2. On success: saves token with `saveToken()`
  3. Toast notification: "Ingreso exitoso"
  4. Navigate to `/dashboard`
  5. On error: Toast "Correo o contraseña incorrectos"
- **UI**: Loading state on button while request is in progress
- **Styling**: Unchanged (split layout, pink buttons)

### **Dashboard** (`src/pages/Dashboard/Dashboard.jsx`) - NEW
- **Protected**: Only accessible to logged-in users
- **Layout**: Flex row with sidebar (left) + main content (right)
- **Sidebar**:
  - Logo + "Dashboard" header
  - Dynamic menu based on user role:
    - **ADMIN**: Productos, Usuarios
    - **CONSULTORA**: Catálogo, Mis Pedidos
    - **SUPERVISOR**: Reportes, Consultoras
  - Logout button
- **Topbar**: Shows user name + perfil
- **Styling**: Pink theme (#e45272), responsive

### **GestionProductos** (`src/pages/GestionProductos/GestionProductos.jsx`) - NEW
- **Route**: `/dashboard/productos` (child of Dashboard)
- **Features**:
  - Fetches products from `productoService.getProductos()`
  - Table with columns: Nombre, Descripción, Precio (S/.), Stock, Categoría, Activo
  - "Nuevo Producto" button (stub - shows info toast)
  - Loading & error states
- **Styling**: Responsive table with hover effects

---

## 🔀 App Routing** (`src/App.jsx`)

```
/ → Home (public)
/login → Login (public)

/dashboard → PrivateRoute (requires auth)
  └── /dashboard/productos → GestionProductos

* → Redirect to /
```

**ToastProvider** wraps entire app so toasts are always available.

---

## 🔐 Authentication Flow

### Login Process
1. User enters credentials on `/login`
2. Submit calls `authService.login({ email, password })`
3. Backend returns `{ token: "jwt..." }`
4. Token saved to `localStorage['user_token']`
5. Redirect to `/dashboard`

### Protected Routes
- `PrivateRoute` component checks `authService.isLoggedIn()`
- If not logged in → redirect to `/login`
- If logged in → render `<Outlet />`

### Session Management
- JWT decoded manually in `sessionService.getInfoSession()`
- Returns user info for display in Dashboard topbar
- Role (perfil) determines sidebar menu items

---

## 📦 API Integration

### Authentication Endpoints
- `POST /auth/login` - { email, password } → { token }
- `POST /auth/register` - { email, password, nombre } → { token }

### Product Endpoints
- `GET /productos` - Requires `Authorization: Bearer <token>`

### Headers
All authenticated requests include:
```javascript
'Authorization': `Bearer ${token}`
'Content-Type': 'application/json'
```

---

## 🎨 Styling & Theme

- **Primary Color**: #e45272 (pink) - used in buttons, sidebar, accents
- **Font**: Poppins (already in global.css)
- **All CSS files unchanged**: Home.css, Login.css, global.css
- **New CSS**: Dashboard.css, GestionProductos.css, ToastContainer.css

---

## ✅ What's Preserved

✅ All existing UI/UX layouts  
✅ All CSS classes and styles  
✅ All image paths (/assets/*)  
✅ Pink theme (#e45272)  
✅ Poppins font family  
✅ Responsive design  
✅ No new npm packages (pure fetch, React built-ins)  

---

## 🚀 Next Steps (Stubbed)

### `productoService.js` Stubs
The following methods are stubbed and ready for full implementation:
- `registrarProducto(data)` - Create new product
- `actualizarProducto(data)` - Update product
- `eliminarProducto(id)` - Delete product

### Missing Pages (Roles)
- `/dashboard/usuarios` - User management (ADMIN only)
- `/dashboard/catalogo` - Product catalog (CONSULTORA only)
- `/dashboard/pedidos` - Order history (CONSULTORA only)
- `/dashboard/reportes` - Analytics (SUPERVISOR only)
- `/dashboard/consultoras` - Consultant management (SUPERVISOR only)

### Register Flow
- `/register` page - Not yet implemented
- `authService.register()` - Service ready, UI needed

---

## 🧪 Testing the Refactored App

### Manual Testing Checklist

**1. Home Page** (`http://localhost:5174/`)
- [ ] Hero, services, characteristics sections load
- [ ] Products load from API (if backend running)
- [ ] Login button navigates to /login

**2. Login** (`http://localhost:5174/login`)
- [ ] Form submits with email/password
- [ ] Success: navigates to /dashboard (requires valid backend)
- [ ] Error: shows "Correo o contraseña incorrectos" toast
- [ ] Loading state on button during request

**3. Dashboard** (`http://localhost:5174/dashboard`)
- [ ] Requires login - redirects to /login if no token
- [ ] Shows user name + role in topbar
- [ ] Sidebar shows role-based menu
- [ ] Logout button clears token and redirects to /login

**4. Gestión Productos** (`http://localhost:5174/dashboard/productos`)
- [ ] Products table loads with data from API
- [ ] Table shows: Nombre, Descripción, Precio, Stock, Categoría, Activo
- [ ] "Nuevo Producto" button shows info toast

**5. Toast Notifications**
- [ ] Toasts appear top-right
- [ ] Auto-dismiss after 3 seconds
- [ ] Manual close button works
- [ ] Color-coded: success (green), danger (red), warning (orange), info (blue)

---

## 📝 File Structure

```
frontend/
├── src/
│   ├── environments/
│   │   └── environment.js
│   ├── model/
│   │   ├── api/
│   │   │   ├── request/
│   │   │   │   ├── loginRequest.js
│   │   │   │   └── registerRequest.js
│   │   │   └── response/
│   │   │       ├── loginResponse.js
│   │   │       └── productoResponse.js
│   │   └── userSesion.js
│   ├── services/
│   │   ├── authService.js (NEW)
│   │   ├── sessionService.js (NEW)
│   │   ├── productoService.js (REFACTORED)
│   │   ├── toastService.js (NEW)
│   │   └── api.js (DEPRECATED - kept for reference)
│   ├── components/
│   │   ├── PrivateRoute/
│   │   │   └── PrivateRoute.jsx
│   │   └── ToastContainer/
│   │       ├── ToastContainer.jsx
│   │       └── ToastContainer.css
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.jsx (REFACTORED)
│   │   │   └── Home.css (UNCHANGED)
│   │   ├── Login/
│   │   │   ├── Login.jsx (REFACTORED)
│   │   │   └── Login.css (UNCHANGED)
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx (NEW)
│   │   │   └── Dashboard.css (NEW)
│   │   └── GestionProductos/
│   │       ├── GestionProductos.jsx (NEW)
│   │       └── GestionProductos.css (NEW)
│   ├── styles/
│   │   └── global.css (UNCHANGED)
│   ├── App.jsx (REFACTORED)
│   └── main.jsx (UNCHANGED)
└── ...
```

---

## 🔗 Integration Points

| Component | Service | Endpoint | Purpose |
|-----------|---------|----------|---------|
| Login | authService | POST /auth/login | Authenticate user |
| Home | productoService | GET /productos | Display products |
| Dashboard | sessionService | - | Get user info from JWT |
| GestionProductos | productoService | GET /productos | Load product table |

---

## 🎯 Summary

This refactoring provides:
- ✅ Clear separation of concerns (Model/Services/Components)
- ✅ Reusable service layer with proper API integration
- ✅ Type-safe models using JSDoc
- ✅ Protected routes with authentication
- ✅ User-friendly toast notifications
- ✅ Role-based menu system
- ✅ Zero breaking changes to UI/styling
- ✅ Ready for backend integration
