-- ============================================================
--  St. Paul's Hospital — Card Department
--  Inquiry Management System — Database Schema
--  Engine : PostgreSQL 14+
--  File   : 01_schema.sql
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email

-- ── Clean slate (dev/reset only) ────────────────────────────
DROP TABLE IF EXISTS audit_log         CASCADE;
DROP TABLE IF EXISTS inquiry_responses CASCADE;
DROP TABLE IF EXISTS inquiries         CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
DROP TABLE IF EXISTS staff_members     CASCADE;
DROP TYPE  IF EXISTS inquiry_source    CASCADE;
DROP TYPE  IF EXISTS inquiry_status    CASCADE;
DROP TYPE  IF EXISTS priority_level    CASCADE;
DROP TYPE  IF EXISTS user_role         CASCADE;
DROP TYPE  IF EXISTS request_type      CASCADE;

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE inquiry_source AS ENUM (
    'Court',
    'Police',
    'Office'
);

CREATE TYPE inquiry_status AS ENUM (
    'Logged & assigned',
    'Records located',
    'Legal review',
    'Auth. check',
    'Supervisor approval',
    'Response prepared',
    'Overdue',
    'Closed'
);

CREATE TYPE priority_level AS ENUM (
    'Normal',
    'High',
    'Urgent'
);

CREATE TYPE user_role AS ENUM (
    'Admin',
    'Supervisor',
    'Staff'
);

CREATE TYPE request_type AS ENUM (
    'Medical records',
    'Identity verification',
    'Admission history',
    'Surgical records',
    'Injury documentation',
    'Treatment verification',
    'Psychiatric assessment',
    'Toxicology report',
    'Fitness certificate',
    'Discharge summary',
    'Birth record',
    'Other'
);

-- ══════════════════════════════════════════════════════════════
--  TABLE: users
--  Department staff who log in and manage inquiries
-- ══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(120)    NOT NULL,
    email         CITEXT          NOT NULL UNIQUE,
    password_hash TEXT            NOT NULL,          -- bcrypt via pgcrypto
    role          user_role       NOT NULL DEFAULT 'Staff',
    initials      VARCHAR(5)      NOT NULL,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role     ON users (role);
CREATE INDEX idx_users_active   ON users (is_active);

COMMENT ON TABLE  users               IS 'Card Department staff accounts';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash — never store plaintext';
COMMENT ON COLUMN users.initials      IS 'Short display label e.g. AB, TM';

-- ══════════════════════════════════════════════════════════════
--  TABLE: inquiries
--  Core record for every incoming external request
-- ══════════════════════════════════════════════════════════════
CREATE TABLE inquiries (
    id                 UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auto-generated human-readable reference  INQ-2024-001
    reference_number   VARCHAR(20)     NOT NULL UNIQUE,

    -- External source
    source             inquiry_source  NOT NULL,
    requesting_party   VARCHAR(200)    NOT NULL,   -- e.g. "Federal High Court – Div. 3"
    external_ref       VARCHAR(100),               -- Court case # / Police file #

    -- Patient card
    patient_name       VARCHAR(150)    NOT NULL,
    card_id            VARCHAR(30)     NOT NULL,   -- e.g. SPH-09142
    patient_dob        DATE,

    -- Request details
    request_type       request_type    NOT NULL,
    notes              TEXT,

    -- Timing
    received_at        DATE            NOT NULL DEFAULT CURRENT_DATE,
    deadline           DATE            NOT NULL,

    -- Status
    status             inquiry_status  NOT NULL DEFAULT 'Logged & assigned',
    priority           priority_level  NOT NULL DEFAULT 'Normal',

    -- Assignment
    assigned_to        UUID            REFERENCES users (id) ON DELETE SET NULL,

    -- Response
    response_notes     TEXT,
    responded_at       TIMESTAMPTZ,
    finalized_by       UUID            REFERENCES users (id) ON DELETE SET NULL,
    finalized_at       TIMESTAMPTZ,
    is_locked          BOOLEAN         NOT NULL DEFAULT FALSE,  -- locked once Closed

    -- Timestamps
    created_by         UUID            REFERENCES users (id) ON DELETE SET NULL,
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indexes for common filter/sort patterns
CREATE INDEX idx_inq_source      ON inquiries (source);
CREATE INDEX idx_inq_status      ON inquiries (status);
CREATE INDEX idx_inq_priority    ON inquiries (priority);
CREATE INDEX idx_inq_assigned    ON inquiries (assigned_to);
CREATE INDEX idx_inq_deadline    ON inquiries (deadline);
CREATE INDEX idx_inq_card_id     ON inquiries (card_id);
CREATE INDEX idx_inq_patient     ON inquiries (lower(patient_name));  -- case-insensitive search
CREATE INDEX idx_inq_ref         ON inquiries (reference_number);
CREATE INDEX idx_inq_locked      ON inquiries (is_locked);
CREATE INDEX idx_inq_created_at  ON inquiries (created_at DESC);

COMMENT ON TABLE  inquiries                IS 'One row per external inquiry received by the Card Department';
COMMENT ON COLUMN inquiries.reference_number IS 'Human-readable ID, e.g. INQ-2024-081';
COMMENT ON COLUMN inquiries.is_locked      IS 'TRUE once closed — prevents further edits';
COMMENT ON COLUMN inquiries.card_id        IS 'Hospital patient card number, e.g. SPH-09142';

-- ══════════════════════════════════════════════════════════════
--  TABLE: inquiry_responses
--  One row per response attempt / draft (many per inquiry)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE inquiry_responses (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id    UUID         NOT NULL REFERENCES inquiries (id) ON DELETE CASCADE,
    authored_by   UUID         REFERENCES users (id) ON DELETE SET NULL,
    response_text TEXT         NOT NULL,
    is_final      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resp_inquiry   ON inquiry_responses (inquiry_id);
CREATE INDEX idx_resp_final     ON inquiry_responses (inquiry_id, is_final);

COMMENT ON TABLE inquiry_responses IS 'Draft and final response notes per inquiry';

-- ══════════════════════════════════════════════════════════════
--  TABLE: audit_log
--  Immutable record of every status change and key action
-- ══════════════════════════════════════════════════════════════
CREATE TABLE audit_log (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id    UUID         NOT NULL REFERENCES inquiries (id) ON DELETE CASCADE,
    performed_by  UUID         REFERENCES users (id) ON DELETE SET NULL,
    action        VARCHAR(80)  NOT NULL,    -- e.g. 'STATUS_CHANGE', 'RESPONSE_ADDED'
    old_value     TEXT,                     -- JSON string of old fields
    new_value     TEXT,                     -- JSON string of new fields
    notes         TEXT,
    performed_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_inquiry    ON audit_log (inquiry_id);
CREATE INDEX idx_audit_performed  ON audit_log (performed_at DESC);
CREATE INDEX idx_audit_user       ON audit_log (performed_by);

COMMENT ON TABLE audit_log IS 'Append-only audit trail — never update or delete rows here';

-- ══════════════════════════════════════════════════════════════
--  FUNCTION + TRIGGER: auto-update updated_at
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════
--  FUNCTION + TRIGGER: prevent editing a locked inquiry
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION prevent_locked_edit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.is_locked = TRUE AND NEW.is_locked = TRUE THEN
        RAISE EXCEPTION 'Inquiry % is locked (Closed) and cannot be modified.', OLD.reference_number;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inquiries_lock_guard
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION prevent_locked_edit();

-- ══════════════════════════════════════════════════════════════
--  FUNCTION + TRIGGER: auto-lock when status → 'Closed'
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_lock_on_close()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 'Closed' AND OLD.status <> 'Closed' THEN
        NEW.is_locked      = TRUE;
        NEW.finalized_at   = NOW();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inquiries_auto_lock
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION auto_lock_on_close();

-- ══════════════════════════════════════════════════════════════
--  FUNCTION: generate next reference number
--  Usage: SELECT next_reference_number();
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION next_reference_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    yr   TEXT := TO_CHAR(NOW(), 'YYYY');
    seq  INT;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(reference_number, '-', 3) AS INT)
    ), 0) + 1
    INTO seq
    FROM inquiries
    WHERE reference_number LIKE 'INQ-' || yr || '-%';

    RETURN 'INQ-' || yr || '-' || LPAD(seq::TEXT, 3, '0');
END;
$$;

COMMENT ON FUNCTION next_reference_number IS 'Returns the next sequential reference like INQ-2024-083';

-- ══════════════════════════════════════════════════════════════
--  VIEW: v_inquiry_summary
--  Joins inquiries with assigned staff for API queries
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW v_inquiry_summary AS
SELECT
    i.id,
    i.reference_number,
    i.source,
    i.requesting_party,
    i.external_ref,
    i.patient_name,
    i.card_id,
    i.request_type,
    i.received_at,
    i.deadline,
    i.status,
    i.priority,
    i.is_locked,
    i.notes,
    i.response_notes,
    i.responded_at,
    i.finalized_at,
    i.created_at,
    i.updated_at,
    -- deadline health
    CASE
        WHEN i.status = 'Closed'                  THEN 'closed'
        WHEN i.deadline < CURRENT_DATE            THEN 'overdue'
        WHEN i.deadline = CURRENT_DATE            THEN 'due_today'
        WHEN i.deadline <= CURRENT_DATE + 2       THEN 'due_soon'
        ELSE                                           'on_track'
    END AS deadline_health,
    -- assigned staff
    u.id           AS assignee_id,
    u.full_name    AS assignee_name,
    u.initials     AS assignee_initials,
    u.email        AS assignee_email,
    -- created by
    c.full_name    AS created_by_name
FROM  inquiries i
LEFT  JOIN users u ON u.id = i.assigned_to
LEFT  JOIN users c ON c.id = i.created_by;

COMMENT ON VIEW v_inquiry_summary IS 'Main API view — includes staff names and computed deadline_health';

-- ══════════════════════════════════════════════════════════════
--  VIEW: v_overdue_inquiries
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW v_overdue_inquiries AS
SELECT *
FROM   v_inquiry_summary
WHERE  deadline_health = 'overdue'
ORDER  BY deadline ASC;

-- ══════════════════════════════════════════════════════════════
--  VIEW: v_monthly_stats
--  Used by the Reports page
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW v_monthly_stats AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    source,
    COUNT(*)                        AS total,
    COUNT(*) FILTER (WHERE status = 'Closed')   AS closed_count,
    COUNT(*) FILTER (WHERE deadline_health = 'overdue') AS overdue_count
FROM   v_inquiry_summary
GROUP  BY 1, 2
ORDER  BY 1 DESC, 2;

COMMENT ON VIEW v_monthly_stats IS 'Aggregated counts per month and source for the Reports page';
