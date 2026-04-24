/**
 * Icon Library - Wrapper simple para iconos usando lucide-react + custom icons
 */

import {
  Home,
  Grid,
  Menu,
  MapPin,
  
  // Actions
  Heart,
  ShoppingCart,
  Eye,
  Search,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Copy,
  Send,
  Filter,
  Check,
  Star,
  Package,
  Image,
  
  // Navigation arrows
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  
  // UI
  X,
  Loader2,
  Settings,
  User,
  Users,
  UserCheck,
  Mail,
  Phone,
  DollarSign,
  CreditCard,
  Tag,
  Archive,
  Layers,
  Clock,
  AlertCircle,
  Download,
  Upload,
  EyeOff,
  Circle,
  Contact,
} from 'lucide-react';

// Custom icons que no existen en lucide-react - crear funciones
function LogoutIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.5a8.38 8.38 0 0 1 .9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );
}

// Exportar todo
export {
  Home,
  Grid,
  Menu,
  MapPin as Location,
  Heart,
  ShoppingCart,
  Eye,
  Search,
  Plus,
  Minus,
  Trash2 as Trash,
  Pencil as Edit,
  Copy,
  Send,
  Filter,
  Check,
  Star,
  Package,
  Image,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  X as Close,
  Loader2 as Spinner,
  Settings as SettingsGear,
  Settings,
  User,
  Users,
  Users as UserGroup,
  UserCheck,
  Mail,
  Phone,
  LogoutIcon as Logout,
  DollarSign as Dollar,
  CreditCard,
  InstagramIcon as Instagram,
  FacebookIcon as Facebook,
  WhatsAppIcon as WhatsApp,
  Tag,
  Archive as Cube,
  Layers as Category,
  Clock,
  AlertCircle as Exclamation,
  Download as Export,
  Upload as Import,
  EyeOff,
  Circle,
  Contact,
};

// Alias
export const Delete = Trash2;