-- ============================================================
--  St. Paul's Hospital — Card Department
--  Seed Data  (demo users + sample inquiries)
--  File: 02_seed.sql
--  Run AFTER 01_schema.sql
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
-- Passwords are bcrypt-hashed (cost 10).
-- Plaintext for demo:
--   admin@stpauls.et      → admin123
--   tigist@stpauls.et     → staff123
--   hana@stpauls.et       → staff123
--   yonas@stpauls.et      → staff123
--   supervisor@stpauls.et → super123

INSERT INTO users (id, full_name, email, password_hash, role, initials) VALUES
(
    '11111111-0000-0000-0000-000000000001',
    'Dr. Almaz Bekele',
    'admin@stpauls.et',
    crypt('admin123', gen_salt('bf', 10)),
    'Admin',
    'AB'
),
(
    '11111111-0000-0000-0000-000000000002',
    'Tigist Mengistu',
    'tigist@stpauls.et',
    crypt('staff123', gen_salt('bf', 10)),
    'Staff',
    'TM'
),
(
    '11111111-0000-0000-0000-000000000003',
    'Hana Tesfaye',
    'hana@stpauls.et',
    crypt('staff123', gen_salt('bf', 10)),
    'Staff',
    'HT'
),
(
    '11111111-0000-0000-0000-000000000004',
    'Yonas Bekele',
    'yonas@stpauls.et',
    crypt('staff123', gen_salt('bf', 10)),
    'Staff',
    'YB'
),
(
    '11111111-0000-0000-0000-000000000005',
    'Dawit Assefa',
    'supervisor@stpauls.et',
    crypt('super123', gen_salt('bf', 10)),
    'Supervisor',
    'DA'
);

-- ── Sample Inquiries ──────────────────────────────────────────

INSERT INTO inquiries (
    id, reference_number, source, requesting_party, external_ref,
    patient_name, card_id, patient_dob, request_type, notes,
    received_at, deadline, status, priority,
    assigned_to, created_by, response_notes
)
VALUES

-- Court inquiries
(
    '22222222-0000-0000-0000-000000000001',
    'INQ-2024-081',
    'Court', 'Federal High Court – Division 3', 'CASE-FHC-4821',
    'Abebe Girma', 'SPH-09142', '1978-03-14',
    'Medical records',
    'Subpoena issued for civil case #4821. All records from 2022–2024 requested.',
    '2024-11-02', '2024-11-10',
    'Legal review', 'High',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000004',
    'INQ-2024-084',
    'Court', 'Oromia Regional Court', 'ORC-2024-0092',
    'Tesfaye Alemu', 'SPH-07634', '1990-07-22',
    'Surgical records',
    'Urgent — judge''s order pending. Surgery records from 2023 required.',
    '2024-11-01', '2024-11-08',
    'Overdue', 'Urgent',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000007',
    'INQ-2024-087',
    'Court', 'Supreme Court – Civil Division', 'SC-CIV-2024-331',
    'Yordanos Kifle', 'SPH-08821', '1985-11-30',
    'Psychiatric assessment',
    'Assessment records needed for competency hearing. No urgency flagged by court.',
    '2024-11-06', '2024-11-20',
    'Logged & assigned', 'Normal',
    '11111111-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000010',
    'INQ-2024-090',
    'Court', 'Kirkos Woreda Court', 'KWC-2024-0055',
    'Kassahun Lemma', 'SPH-06112', '1965-04-09',
    'Discharge summary',
    'Case resolved. Summary for court file.',
    '2024-10-28', '2024-11-04',
    'Closed', 'Normal',
    '11111111-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000001',
    'Discharge summary issued, signed, and delivered to Kirkos Woreda Court on 2024-11-03.'
),

-- Police inquiries
(
    '22222222-0000-0000-0000-000000000002',
    'INQ-2024-082',
    'Police', 'Addis Ababa Police – CID', 'AA-CID-2209',
    'Meron Tadesse', 'SPH-03871', '1992-08-17',
    'Identity verification',
    'CID case reference: AA-CID-2209. Verify patient identity in connection with fraud investigation.',
    '2024-11-03', '2024-11-12',
    'Records located', 'High',
    '11111111-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000005',
    'INQ-2024-085',
    'Police', 'Bole Sub-city Police', 'BSP-2024-1147',
    'Almaz Haile', 'SPH-02290', '2001-02-05',
    'Injury documentation',
    'Injury report ready for dispatch. Physical assault case.',
    '2024-11-05', '2024-11-14',
    'Response prepared', 'Normal',
    '11111111-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000001',
    'Injury report compiled, signed by Dr. Almaz Bekele, and ready for dispatch.'
),
(
    '22222222-0000-0000-0000-000000000008',
    'INQ-2024-088',
    'Police', 'Yeka District Police', 'YDP-2024-0388',
    'Sintayehu Worku', 'SPH-04517', '1997-06-21',
    'Toxicology report',
    'Suspect involved in substance-related case. Toxicology results from ER visit 2024-10-20.',
    '2024-11-06', '2024-11-15',
    'Records located', 'High',
    '11111111-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000011',
    'INQ-2024-091',
    'Police', 'Lideta Police Station', 'LPS-2024-0072',
    'Lidya Assefa', 'SPH-12308', '1988-09-13',
    'Birth record',
    'Birth record requested for identity confirmation in criminal proceeding.',
    '2024-10-29', '2024-11-05',
    'Closed', 'Normal',
    '11111111-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000001',
    'Birth record verified and securely transmitted to Lideta Police Station on 2024-11-04.'
),

-- Office inquiries
(
    '22222222-0000-0000-0000-000000000003',
    'INQ-2024-083',
    'Office', 'Ministry of Health', 'MOH-AUDIT-2024-09',
    'Selamawit Bekele', 'SPH-11205', '1975-12-28',
    'Admission history',
    'Routine ministry audit request. Full admission history 2020–2024.',
    '2024-11-04', '2024-11-18',
    'Logged & assigned', 'Normal',
    '11111111-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000006',
    'INQ-2024-086',
    'Office', 'Ethio Insurance Corporation', 'EIC-CLAIM-7741',
    'Biruk Mengistu', 'SPH-15043', '1983-05-16',
    'Treatment verification',
    'Insurance claim deadline missed. Treatment records for claim #7741.',
    '2024-11-03', '2024-11-09',
    'Overdue', 'High',
    '11111111-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000009',
    'INQ-2024-089',
    'Office', 'Civil Service Commission', 'CSC-FIT-2024-204',
    'Frehiwot Desta', 'SPH-19304', '1980-01-07',
    'Fitness certificate',
    'Employee fitness-for-duty check for government reinstatement.',
    '2024-11-07', '2024-11-22',
    'Logged & assigned', 'Normal',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000001',
    NULL
),
(
    '22222222-0000-0000-0000-000000000012',
    'INQ-2024-092',
    'Office', 'Addis Ababa City Administration', 'AACA-HLTH-2024-88',
    'Mikias Getu', 'SPH-07091', '1993-10-03',
    'Admission history',
    'Residency health check for city housing benefit application.',
    '2024-11-01', '2024-11-16',
    'Response prepared', 'Normal',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000001',
    'Health summary prepared and signed off for Addis Ababa City Administration.'
);

-- ── Audit log seed entries ────────────────────────────────────

INSERT INTO audit_log (inquiry_id, performed_by, action, old_value, new_value, notes, performed_at)
VALUES
-- INQ-2024-081 lifecycle
('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','CREATED',NULL,'{"status":"Logged & assigned"}','Inquiry received from Federal High Court','2024-11-02 09:15:00+03'),
('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002','STATUS_CHANGE','{"status":"Logged & assigned"}','{"status":"Records located"}','Card SPH-09142 located in archive','2024-11-03 11:30:00+03'),
('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002','STATUS_CHANGE','{"status":"Records located"}','{"status":"Legal review"}','Sent to Dr. Almaz for legal review','2024-11-04 14:00:00+03'),

-- INQ-2024-090 (closed)
('22222222-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000001','CREATED',NULL,'{"status":"Logged & assigned"}','Received from Kirkos Woreda Court','2024-10-28 08:00:00+03'),
('22222222-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000003','STATUS_CHANGE','{"status":"Logged & assigned"}','{"status":"Records located"}','Records pulled from archive room B','2024-10-29 10:45:00+03'),
('22222222-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000003','STATUS_CHANGE','{"status":"Records located"}','{"status":"Response prepared"}','Summary compiled and signed','2024-11-02 13:20:00+03'),
('22222222-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000003','STATUS_CHANGE','{"status":"Response prepared"}','{"status":"Closed","is_locked":true}','Delivered to court — case closed','2024-11-03 16:00:00+03'),

-- INQ-2024-084 (overdue)
('22222222-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001','CREATED',NULL,'{"status":"Logged & assigned","priority":"Urgent"}','Urgent court order — surgical records','2024-11-01 07:30:00+03'),
('22222222-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001','STATUS_CHANGE','{"status":"Logged & assigned"}','{"status":"Overdue"}','Deadline passed — escalating','2024-11-09 08:00:00+03');

-- ── Response drafts ───────────────────────────────────────────

INSERT INTO inquiry_responses (inquiry_id, authored_by, response_text, is_final, created_at)
VALUES
(
    '22222222-0000-0000-0000-000000000010',
    '11111111-0000-0000-0000-000000000003',
    'Discharge summary for Kassahun Lemma (SPH-06112) covering admission 2024-09-15 to 2024-09-22 has been compiled, reviewed, and signed by attending physician Dr. Bekele. Document dispatched via secure courier to Kirkos Woreda Court on 2024-11-03.',
    TRUE,
    '2024-11-03 15:45:00+03'
),
(
    '22222222-0000-0000-0000-000000000011',
    '11111111-0000-0000-0000-000000000005',
    'Birth record for Lidya Assefa (SPH-12308), born 1988-09-13 at St. Paul''s Hospital, confirmed and certified copy transmitted securely to Lideta Police Station on 2024-11-04.',
    TRUE,
    '2024-11-04 11:30:00+03'
),
(
    '22222222-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000004',
    'Injury documentation for Almaz Haile (SPH-02290) from ER visit 2024-11-01 compiled. Report includes physician notes, wound photographs log, and treatment summary. Ready for dispatch to Bole Sub-city Police.',
    FALSE,
    '2024-11-07 09:00:00+03'
);
