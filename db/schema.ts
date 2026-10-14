import {sql} from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
export const quoteRequests = sqliteTable("quote_requests", {
  id: text("id").primaryKey(), reference: text("reference").notNull(),
  createdAt: integer("created_at").notNull(), expiresAt: integer("expires_at").notNull(),
  name: text("name").notNull(), company: text("company").notNull(),
  email: text("email").notNull(), phone: text("phone"), message: text("message").notNull(),
  audience: text("audience").notNull(), dataSource: text("data_source").notNull(),
  volume: integer("volume").notNull(), plan: text("plan").notNull(),
  quotedAmountEuros: integer("quoted_amount_euros"),
  contactConsent: integer("contact_consent", { mode: "boolean" }).notNull(),
  status: text("status").notNull().default("new"),
  notes: text("notes").notNull().default(""),
  revision: integer("revision").notNull().default(0),
  updatedAt: integer("updated_at"),
  service: text("service").notNull().default("emailing"),
  websiteUrl:text("website_url").notNull().default(""),
  city:text("city").notNull().default(""),
  budget:text("budget").notNull().default("a_definir"),
  timeline:text("timeline").notNull().default("flexible"),
  campaign:text("campaign").notNull().default("site"),
  activity:text("activity").notNull().default(""),
}, table => [index("idx_quote_requests_status_created").on(table.status, table.createdAt), index("idx_quote_requests_created").on(table.createdAt), index("idx_quote_requests_email_created_at").on(table.email, table.createdAt), index("idx_quote_requests_expires_at").on(table.expiresAt), index("idx_quote_requests_campaign_expires").on(table.campaign,table.expiresAt)]);

export const adminIdentities = sqliteTable("admin_identities", {
  ownerEmail: text("owner_email").primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at").notNull(),
});
export const quoteEvents = sqliteTable("quote_events", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(()=>quoteRequests.id,{onDelete:"cascade"}),
  createdAt: integer("created_at").notNull(),
  actorId: text("actor_id").notNull(),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  notesChanged: integer("notes_changed").notNull(),
},t=>[index("idx_quote_events_request_created").on(t.requestId,t.createdAt)]);
export const requestLimits = sqliteTable("request_limits", {
  key: text("key").primaryKey(), count: integer("count").notNull(), expiresAt: integer("expires_at").notNull(),
},t=>[index("idx_request_limits_expires").on(t.expiresAt)]);

export const analyticsDaily=sqliteTable('analytics_daily',{
 id:text('id').primaryKey(),day:text('day').notNull(),path:text('path').notNull(),event:text('event').notNull(),service:text('service').notNull().default('none'),count:integer('count').notNull().default(1)
},t=>[index('idx_analytics_daily_day').on(t.day)]);

export const emailRecipients=sqliteTable('email_recipients',{
 id:text('id').primaryKey(),campaign:text('campaign').notNull(),email:text('email').notNull(),name:text('name').notNull().default(''),company:text('company').notNull(),source:text('source').notNull(),createdAt:integer('created_at').notNull(),expiresAt:integer('expires_at').notNull(),sentAt:integer('sent_at'),trackingConsent:integer('tracking_consent').notNull().default(0),consentProof:text('consent_proof').notNull().default(''),consentRecordedAt:integer('consent_recorded_at'),trackingRevokedAt:integer('tracking_revoked_at'),firstOpenAt:integer('first_open_at'),firstClickAt:integer('first_click_at'),interestedAt:integer('interested_at'),unsubscribedAt:integer('unsubscribed_at'),requestId:text('request_id')
},t=>[index('idx_email_recipients_created').on(t.createdAt),index('idx_email_recipients_email').on(t.email),index('idx_email_recipients_campaign').on(t.campaign)]);
export const emailSuppressions=sqliteTable('email_suppressions',{
 email:text('email').primaryKey(),createdAt:integer('created_at').notNull(),reason:text('reason').notNull().default('unsubscribe')
});

export const smtpSettings=sqliteTable('smtp_settings',{
 id:text('id').primaryKey(),cipher:text('cipher').notNull().default(''),revision:integer('revision').notNull().default(0),runnerSession:text('runner_session').notNull().default(''),runnerSessionUntil:integer('runner_session_until').notNull().default(0),runnerHash:text('runner_hash').notNull().default(''),runnerSeenAt:integer('runner_seen_at'),runnerVersion:text('runner_version').notNull().default(''),verifyDiagnostic:text('verify_diagnostic').notNull().default('{}'),verifyRequestedAt:integer('verify_requested_at'),verifyClaim:text('verify_claim'),verifyExpiresAt:integer('verify_expires_at'),verifiedRevision:integer('verified_revision').notNull().default(-1),verifyStatus:text('verify_status').notNull().default('unconfigured'),verifyError:text('verify_error').notNull().default(''),verifiedAt:integer('verified_at'),dnsJson:text('dns_json').notNull().default('{}'),dnsCheckedAt:integer('dns_checked_at'),dayKey:text('day_key').notNull().default(''),dayReserved:integer('day_reserved').notNull().default(0),nextSendAt:integer('next_send_at').notNull().default(0),updatedAt:integer('updated_at').notNull()
});
export const campaignRuns=sqliteTable('campaign_runs',{
 id:text('id').primaryKey(),name:text('name').notNull(),code:text('code').notNull(),subject:text('subject').notNull(),contentJson:text('content_json').notNull(),status:text('status').notNull().default('draft'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),expiresAt:integer('expires_at').notNull(),scheduledAt:integer('scheduled_at'),startedAt:integer('started_at'),controlEmail:text('control_email').notNull().default(''),controlEvery:integer('control_every').notNull().default(0),controlAccepted:integer('control_accepted').notNull().default(0),controlCursor:integer('control_cursor').notNull().default(0),launchConsent:integer('launch_consent').notNull().default(0),recipientCount:integer('recipient_count').notNull().default(0)
},t=>[index('idx_campaign_runs_created').on(t.createdAt),index('idx_campaign_runs_status').on(t.status),uniqueIndex('idx_campaign_runs_code').on(t.code)]);
export const campaignTargets=sqliteTable('campaign_targets',{
 id:text('id').primaryKey(),runId:text('run_id').notNull().references(()=>campaignRuns.id,{onDelete:'cascade'}),email:text('email').notNull(),status:text('status').notNull().default('queued'),controlCounted:integer('control_counted').notNull().default(0),controlMilestone:integer('control_milestone').notNull().default(0),relaySession:text('relay_session').notNull().default(''),isTest:integer('is_test').notNull().default(0),createdAt:integer('created_at').notNull(),leaseToken:text('lease_token'),leaseExpiresAt:integer('lease_expires_at'),configRevision:integer('config_revision'),attempts:integer('attempts').notNull().default(0),nextAttemptAt:integer('next_attempt_at').notNull().default(0),startedAt:integer('started_at'),acceptedAt:integer('accepted_at'),lastError:text('last_error').notNull().default(''),messageId:text('message_id').notNull().default(''),receiptHash:text('receipt_hash').notNull().default(''),smtpDiagnostic:text('smtp_diagnostic').notNull().default('{}'),updatedAt:integer('updated_at').notNull().default(0)
},t=>[index('idx_campaign_targets_queue').on(t.status,t.nextAttemptAt,t.createdAt),index('idx_campaign_targets_run_status').on(t.runId,t.status),index('idx_campaign_targets_run_updated').on(t.runId,t.updatedAt,t.createdAt),uniqueIndex('idx_campaign_targets_run_email_test').on(t.runId,t.email,t.isTest).where(sql`${t.controlMilestone}=0`),uniqueIndex('idx_campaign_targets_control').on(t.runId,t.controlMilestone).where(sql`${t.controlMilestone}>0`),index('idx_campaign_targets_lease').on(t.leaseToken),index('idx_campaign_targets_run_started').on(t.runId,t.startedAt)]);
