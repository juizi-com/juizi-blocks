/**
 * Curated lucide-react icons offered to editors. Import icons individually:
 * importing the whole `icons` map would put every lucide icon in the bundle.
 */
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Heart,
  Info,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';

export const calloutIcons = {
  info: { label: 'Info', component: Info },
  lightbulb: { label: 'Idea', component: Lightbulb },
  'alert-triangle': { label: 'Warning', component: AlertTriangle },
  'check-circle': { label: 'Success', component: CheckCircle },
  megaphone: { label: 'Announcement', component: Megaphone },
  sparkles: { label: 'Highlight', component: Sparkles },
  star: { label: 'Star', component: Star },
  award: { label: 'Award', component: Award },
  rocket: { label: 'Launch', component: Rocket },
  zap: { label: 'Fast', component: Zap },
  'shield-check': { label: 'Secure', component: ShieldCheck },
  heart: { label: 'Heart', component: Heart },
  users: { label: 'People', component: Users },
  calendar: { label: 'Calendar', component: Calendar },
  clock: { label: 'Time', component: Clock },
  'map-pin': { label: 'Location', component: MapPin },
  mail: { label: 'Email', component: Mail },
  phone: { label: 'Phone', component: Phone },
  download: { label: 'Download', component: Download },
  'book-open': { label: 'Read', component: BookOpen },
};
