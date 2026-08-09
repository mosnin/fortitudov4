'use client';

/**
 * IntegrationsShowcase, the integrations feature section (image on the RIGHT).
 * Same animated/frosted pattern, grounded in the real apps Chippi connects to
 * through Composio: inbox, calendar, CRM, messaging, and e-sign.
 */

import {
  Blocks,
  Boxes,
  ArrowLeftRight,
  Gauge,
  Mail,
  CalendarCheck,
  Database,
  MessageSquare,
  FileSignature,
  Check,
} from 'lucide-react';
import { FeatureShowcase, Frost, Row, type ShowcaseStep } from './feature-showcase';

const TOP_FEATURES = [
  { icon: Boxes, title: '50+ apps', desc: 'The tools you already pay for, connected through Composio.' },
  { icon: ArrowLeftRight, title: 'Two-way sync', desc: 'Helix reads from and writes back to each tool as it works.' },
  { icon: Gauge, title: 'Two-minute setup', desc: 'Connect with a click; no engineering, no spreadsheets.' },
];

const Chip = ({ label, tone }: { label: string; tone: string }) => (
  <span className={'rounded-full px-2 py-0.5 text-[10px] font-medium ' + tone}>{label}</span>
);

const ON = <Chip label="Connected" tone="bg-emerald-400/15 text-emerald-300" />;

const STEPS: ShowcaseStep[] = [
  {
    key: 'inbox',
    title: 'Your inbox',
    desc: 'Connect Gmail or Outlook and Helix reads every inbound, sorts it against your builds, and drafts the reply in the house style.',
    mockup: (
      <Frost title="Inbox" badge="Connected">
        <Row icon={Mail} title="Gmail" meta="reading + drafting" tone="text-[#ff9a6e]" right={ON} active />
        <Row icon={Mail} title="Outlook" meta="reading + drafting" right={ON} />
        <Row icon={Check} title="Replies drafted in the house style" meta="the moment a request lands" tone="text-emerald-300/80" />
      </Frost>
    ),
  },
  {
    key: 'calendar',
    title: 'Your calendar',
    desc: 'Link Google Calendar or Calendly and reviews book against your real availability, with confirmations sent automatically.',
    mockup: (
      <Frost title="Calendar" badge="Connected">
        <Row icon={CalendarCheck} title="Google Calendar" meta="availability + booking" tone="text-[#ff9a6e]" right={ON} active />
        <Row icon={CalendarCheck} title="Calendly" meta="self-scheduling links" right={ON} />
        <Row icon={Check} title="Reviews booked, confirmations sent" meta="thread + build updated" tone="text-emerald-300/80" />
      </Frost>
    ),
  },
  {
    key: 'crm',
    title: 'Your CRM',
    desc: 'Keep your CRM as the system of record. Helix syncs contacts, projects, and notes both ways, so nothing falls out of date.',
    mockup: (
      <Frost title="CRM sync" badge="Two-way">
        <Row icon={Database} title="HubSpot" meta="contacts + projects" tone="text-[#ff9a6e]" right={ON} active />
        <Row icon={Database} title="Salesforce" meta="contacts + projects" right={ON} />
        <Row icon={Database} title="Pipedrive" meta="leads + stages" right={ON} />
      </Frost>
    ),
  },
  {
    key: 'messaging',
    title: 'Every channel',
    desc: 'Reach clients where they already are. Helix sends and follows up over Slack and WhatsApp, in the house style, around the clock.',
    mockup: (
      <Frost title="Messaging" badge="Connected">
        <Row icon={MessageSquare} title="Slack" meta="updates + approvals" tone="text-[#ff9a6e]" right={ON} active />
        <Row icon={MessageSquare} title="WhatsApp" meta="send + follow up" right={ON} />
        <Row icon={Check} title="One worked queue" meta="email, Slack, and chat together" tone="text-emerald-300/80" />
      </Frost>
    ),
  },
  {
    key: 'esign',
    title: 'Docs and e-sign',
    desc: 'Send the right document for signature without leaving the project, and Helix tracks it through to signed.',
    mockup: (
      <Frost title="Documents" badge="Connected">
        <Row icon={FileSignature} title="DocuSign" meta="send for signature" tone="text-[#ff9a6e]" right={ON} active />
        <Row icon={Check} title="Project agreement sent" meta="awaiting signature" tone="text-emerald-300/80" />
        <Row icon={Check} title="Statements of work, tracked to signed" meta="logged on the build" tone="text-emerald-300/80" />
      </Frost>
    ),
  },
];

export function IntegrationsShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Integrations"
      headline={
        <>
          Connect the tools
          <br className="hidden sm:block" /> you already pay for.
        </>
      }
      product={{
        name: 'Connected',
        icon: Blocks,
        desc: 'Helix plugs into your inbox, calendar, CRM, messaging, and e-sign through Composio, then works inside them, no rip and replace.',
        cta: { label: 'Browse integrations', href: '/services' },
      }}
      topFeatures={TOP_FEATURES}
      steps={STEPS}
      image="/marketing/integrations-1.jpg"
      imageSide="right"
    />
  );
}
