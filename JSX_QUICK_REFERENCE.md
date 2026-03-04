# 🚀 JSX FOLDER - QUICK REFERENCE GUIDE

## ✅ USED vs ❌ UNUSED FILES AT A GLANCE

### 🗑️ FILES TO DELETE (SAFE TO REMOVE)
```
✅ All deprecated and duplicate files have been removed/consolidated!
```

---

## 📂 ACTIVE MODULES & THEIR PURPOSES

### 1. **Authentication** ✅
- `LoginPage.jsx` - User login interface
- `RegisterPage.jsx` - User registration
- `ForgotPassword.jsx` - Password recovery

### 2. **Dashboard** ✅
- `Dashboard.jsx` - Main analytics dashboard
- `DashboardDark.js` - Dark mode variant
- Contains: Charts, sliders, metrics

### 3. **Enquiry Management** ✅ (LARGEST MODULE)
**15+ interconnected components**
- Main enquiry listing & details
- Quotation system (16 files!) - activities, hotels, transfers
- Follow-ups - customer communication tracking
- Payments - payment management
- Supplier communications
- Ticketing - support tickets

### 4. **Lead Management** ✅
- `Leads.jsx` - Lead listing & management
- `AddLead.js` - Lead creation/edit forms
- Lead tracking & status updates

### 5. **Settings & Configuration** ✅ (LARGEST SETTINGS MODULE)
**18 subfolders for system configuration**
- **Hotel Settings** → Property types, rooms, amenities
- **User Management** → Users, roles, permissions
- **Company Settings** → Company info, currency, fields
- **Supplier Management** → Supplier data
- **Activity Types** → Create activity categories
- **Transfer Types** → Transportation options
- **Destination Management** → Geographic locations
- **Email Configuration** → Mail server setup
- **Tax & Currency** → Financial configuration

### 6. **Support Ticketing** ✅
- `Tickets.jsx` - Ticket management interface
- Ticket creation, assignment, tracking

### 7. **User Interface (Layouts)** ✅
- Navigation (Header, Sidebar, Menu)
- Footer, Page titles, Modals
- Custom components (Table, Slider, etc.)

### 8. **Reusable Components** ✅ (22 files)
**Form fields, buttons, modals used everywhere**
- InputField, SelectField, CustomDatePicker
- CheckBoxField, FileUploader
- DeleteModal, CustomTable
- LoadingBtn, Avatar, Notify

### 9. **Utilities & Hooks** ✅ (All active)
- `useAsync` - API data fetching hook
- `usePermissionType` - Permission checker hook
- Helper functions for dates, validation, notifications

---

## 📊 FILE ORGANIZATION STRUCTURE

```
src/jsx/
│
├── 📄 CSS FILES (4)
│   ├── index.css (Main styles)
│   ├── chart.css (Chart styling)
│   ├── dashboard.css (Dashboard styling)
│   └── step.css (Step component styling)
│
├── 📄 index.js (MAIN ROUTER - Central hub)
│
├── pages/ (8 files)
│   ├── ✅ LoginPage.jsx (ACTIVE)
│   ├── ✅ RegisterPage.jsx (ACTIVE)
│   ├── ✅ ForgotPassword.jsx (ACTIVE)
│   ├── ✅ LockScreen.jsx (ACTIVE - Inactivity detection)
│   └── ✅ Error*.js (5 files - ACTIVE)
│
├── layouts/ (10 files - ALL ACTIVE)
│   ├── nav/
│   │   ├── Header.js
│   │   ├── SideBar.js
│   │   ├── Menu.js
│   │   └── ...
│   ├── Footer.js
│   ├── CustomModal.js
│   ├── PageTitle.js
│   └── ...
│
├── components/ (MAIN FEATURE MODULES)
│   ├── common/ (22 reusable components - ALL ACTIVE)
│   ├── Dashboard/ (14 files - MOSTLY ACTIVE)
│   │   ├── Dashboard.jsx ✅
│   │   ├── Home.js ❌ (DELETE)
│   │   └── Sliders, Charts...
│   ├── Enquiry/ (30+ files - ALL ACTIVE)
│   │   ├── Enquiry.jsx
│   │   ├── Quotation/ (16 files)
│   │   ├── FollowUp/
│   │   ├── Payment/
│   │   └── ...
│   ├── Leads/ (3 files - ALL ACTIVE)
│   ├── Settings/ (50+ files - MOSTLY ACTIVE)
│   │   ├── Hotels/ (5 files, 1 unused)
│   │   ├── UserManagement/ (6 files)
│   │   ├── Activity/, Agent/, Currency/
│   │   └── ...16 more subfolders
│   ├── Tickets/ (1 file - ACTIVE)
│   └── privateRoute.js (Route protection)
│
└── utilis/ (6 files - ALL ACTIVE)
    ├── useAsync.js (Hook - API calls)
    ├── usePermissionType.js (Hook - Permissions)
    ├── date.js (Date utilities)
    ├── check.js (Validation)
    ├── notifyMessage.js (Notifications)
    └── isDevelopment.js (Env check)
```

---

## 🔗 DATA FLOW EXAMPLE: Creating an Enquiry

```
jsx/index.js (Routes setup)
    ↓
Enquiry.jsx (List enquiries)
    ├─→ add.js (Form to add enquiry)
    │   └─→ common/InputField.js, ReactSelect.js, CustomDatePicker.js (Form components)
    │       └─→ utilis/useAsync.js (Fetch master data)
    │
    ├─→ Quotation/SetupModal.js (Create quotation)
    │   ├─→ Quotation/SetupForm.js (Basic setup)
    │   ├─→ Quotation/PackageForm.js (Add hotels/activities)
    │   │   ├─→ Quotation/InsertHotel.js
    │   │   ├─→ Quotation/InsertActivity.js
    │   │   └─→ Quotation/InsertTransfer.js
    │   └─→ Quotation/PaymentForm.js (Payment terms)
    │
    └─→ Payment/, FollowUp/, Mail/ (Other enquiry operations)
```

---

## 🎯 FILE PURPOSES QUICK LOOKUP

### Form & Input Components
| File | What it does |
|------|-------------|
| `InputField.js` | Text input with label and error display |
| `SelectField.js` | Bootstrap dropdown select |
| `ReactSelect.js` | React-Select dropdown (advanced) |
| `CustomDatePicker.js` | Date selection with formatting |
| `CheckBoxField.js` | Checkbox with label |
| `FileUploader.js` | File upload handler |

### UI Components  
| File | What it does |
|------|-------------|
| `LoadingBtn.js` | Button with loading spinner |
| `ModeBtn.js` | Add/Edit mode toggle |
| `CustomTable.js` | Data table display |
| `CustomModal.js` | Modal dialog wrapper |
| `DeleteModal.js` | Confirmation dialog |
| `Notify.js` | Toast notifications |
| `NoData.js` | Empty state display |
| `Avatar.js` | User avatar image |

### Layout Components
| File | What it does |
|------|-------------|
| `Header.js` | Top navigation bar |
| `SideBar.js` | Left sidebar menu |
| `Footer.js` | Page footer |
| `PageTitle.js` | Page heading component |
| `ScrollToTop.js` | Auto scroll to top on route change |

### Visualization & Media
| File | What it does |
|------|-------------|
| `QueriesDonutChart.js` | Pie/donut chart |
| `VisitorAreaChart.js` | Area chart for analytics |
| `HomeSlider.js` | Image carousel |
| `ImageGallery.js` | Photo gallery viewer |
| `Viewer.js` | Document/PDF viewer |

---

## 🚦 USAGE FREQUENCY INDICATORS

### 🔴 VERY HIGH (Used 100+ times)
- InputField.js
- SelectField.js  
- LoadingBtn.js
- Notify.js
- CustomDatePicker.js
- useAsync.js

### 🟡 HIGH (Used 20-100 times)
- CustomTable.js
- CustomModal.js
- DeleteModal.js
- ReactSelect.js
- Dashboard components
- Settings components

### 🟢 MEDIUM (Used 5-20 times)
- DetailComponent.js
- FileUploader.js
- ImageGallery.js
- FieldAddModal.js
- Feature-specific modals

### ⚪ LOW (Used 1-5 times)
- AnimationBackground.js
- ChatBox.js
- EventSidebar.js
- Viewer.js

---

## 🔍 HOW TO FIND COMPONENT USAGE

**To see where a component is used:**
```
Search in codebase for: import.*ComponentName
Example: import.*Avatar
```

**Common import patterns:**
```javascript
// From common components
import InputField from "../common/InputField";
import { LoadingButton } from "../../common/LoadingBtn";

// From utilities
import { useAsync } from "../../utilis/useAsync";
import { formatDate } from "../../utilis/date";

// From other modules
import Dashboard from "./components/Dashboard/Dashboard.jsx";
```

---

## 💡 FEATURE DEVELOPMENT GUIDE

### To add a new setting page:
1. Create folder in `Settings/[NewFeature]/`
2. Add `index.js` (main component)
3. Import in `Settings/index.js`
4. Add route in `jsx/index.js`
5. Add menu item in `layouts/nav/Menu.js`

### To add a form to Enquiry:
1. Create `[FormName].js` in `Enquiry/Quotation/`
2. Import form fields from `common/`
3. Use `useAsync()` hook to fetch data
4. Use `notifyMessage` for user feedback
5. Integrate with `SetupModal.js`

### To create a reusable component:
1. Place in `components/common/`
2. Export as named export
3. Import where needed with proper path
4. Document props with JSDoc comments

---

## 📌 IMPORTANT NOTES

### About index.js files
- Every folder with subcomponents has an `index.js`
- Acts as main export point for that module
- Keeps imports organized and clean

### About CSS files
- Some components have attached CSS files (e.g., UserRole.css)
- Parent CSS files: index.css, dashboard.css, chart.css, step.css
- Custom component styles often embedded in the component file

### About Redux integration
- Dispatch actions via `useDispatch()` hook
- Get state via `useSelector()` hook
- Located in `src/store/slices/` and `src/store/actions/`

### About Route Protection
- Use `<PrivateRoute>` wrapper component
- Pass `permission` prop to check access
- Example: `<PrivateRoute permission="leads"><Leads /></PrivateRoute>`

---

## ✨ CODE QUALITY OBSERVATIONS

### Strengths ✅
- Clear module separation
- Consistent component structure
- Reusable form components
- Custom hooks for logic
- Protected routes for security

### Areas for Improvement 🔧
- Remove deprecated files (Login.js, Registration.js, etc.)
- Add JSDoc comments to utility functions
- Consolidate similar setting modules
- Better organize deeply nested Quotation components

---

**For detailed information, see: JSX_FOLDER_ANALYSIS.md**

*Quick Reference Last Updated: February 27, 2026*
