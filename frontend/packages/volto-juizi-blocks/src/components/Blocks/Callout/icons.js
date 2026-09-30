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
import messages from './messages';

// `label` is a message: format it with `intl`.
export const calloutIcons = {
  info: { label: messages.iconInfo, component: Info },
  lightbulb: { label: messages.iconLightbulb, component: Lightbulb },
  'alert-triangle': {
    label: messages.iconAlertTriangle,
    component: AlertTriangle,
  },
  'check-circle': { label: messages.iconCheckCircle, component: CheckCircle },
  megaphone: { label: messages.iconMegaphone, component: Megaphone },
  sparkles: { label: messages.iconSparkles, component: Sparkles },
  star: { label: messages.iconStar, component: Star },
  award: { label: messages.iconAward, component: Award },
  rocket: { label: messages.iconRocket, component: Rocket },
  zap: { label: messages.iconZap, component: Zap },
  'shield-check': { label: messages.iconShieldCheck, component: ShieldCheck },
  heart: { label: messages.iconHeart, component: Heart },
  users: { label: messages.iconUsers, component: Users },
  calendar: { label: messages.iconCalendar, component: Calendar },
  clock: { label: messages.iconClock, component: Clock },
  'map-pin': { label: messages.iconMapPin, component: MapPin },
  mail: { label: messages.iconMail, component: Mail },
  phone: { label: messages.iconPhone, component: Phone },
  download: { label: messages.iconDownload, component: Download },
  'book-open': { label: messages.iconBookOpen, component: BookOpen },
};
