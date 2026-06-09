--
-- PostgreSQL database dump
--

\restrict TvyViZhddb9lnfJyOa9M8gharj3bECtJrTDy0g9fVnUojt5yFgvEWRWkEZLULyV

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'COACH',
    'ADMIN'
);


--
-- Name: TrainingTitle; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TrainingTitle" AS ENUM (
    'GLACE',
    'PPG',
    'SOL'
);


--
-- Name: TrainingType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TrainingType" AS ENUM (
    'HEBDOMADAIRE',
    'STAGE'
);


--
-- Name: WeekType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WeekType" AS ENUM (
    'STANDARD',
    'STAGE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "actorId" text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    action text NOT NULL,
    "beforeJson" jsonb,
    "afterJson" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "trainingId" text NOT NULL,
    channel text NOT NULL,
    recipient text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payload jsonb,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Section; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Section" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Skater; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Skater" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "parentEmail" text,
    "parentPhone" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    city text
);


--
-- Name: SkaterSection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SkaterSection" (
    id text NOT NULL,
    "skaterId" text NOT NULL,
    "sectionId" text NOT NULL,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "endsAt" timestamp(3) without time zone
);


--
-- Name: Training; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Training" (
    id text NOT NULL,
    "weekProfileId" text NOT NULL,
    "sectionId" text NOT NULL,
    title public."TrainingTitle" NOT NULL,
    type public."TrainingType" NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    location text NOT NULL,
    "coachId" text NOT NULL,
    notes text,
    source text DEFAULT 'manual'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "updatedById" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TrainingAttendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TrainingAttendance" (
    id text NOT NULL,
    "trainingId" text NOT NULL,
    "skaterId" text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL
);


--
-- Name: TrainingTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TrainingTemplate" (
    id text NOT NULL,
    "sectionId" text NOT NULL,
    title public."TrainingTitle" NOT NULL,
    weekday integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    location text NOT NULL,
    "coachId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'COACH'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WeekProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WeekProfile" (
    id text NOT NULL,
    "isoYear" integer NOT NULL,
    "isoWeek" integer NOT NULL,
    label text,
    type public."WeekType" DEFAULT 'STANDARD'::public."WeekType" NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "actorId", entity, "entityId", action, "beforeJson", "afterJson", "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "trainingId", channel, recipient, status, payload, "sentAt", "createdAt") FROM stdin;
cmq3f1urg0001tuhbt9ckd6ve	cmq1z3y7o002vtuugknlx6qm8	email	fabien.cordet@gmail.com	sent	{"date": "2026-06-10", "coach": "Deborah Wattelier", "event": "updated", "endTime": "12:15", "message": "Le creneau glace du 2026-06-10 (11:15-12:15) a ete modifie. Section: Danse Régionaux.", "section": "Danse Régionaux", "location": "Patinoire (stage)", "provider": "brevo", "startTime": "11:15", "trainingTitle": "GLACE", "providerMessageId": "<202606070643.77946723979@smtp-relay.mailin.fr>"}	2026-06-07 06:43:50.377	2026-06-07 06:43:50.14
cmq3f2pn90002tuhbowdyzjzm	cmq1z3y7o002vtuugknlx6qm8	email	fabien.cordet@gmail.com	sent	{"date": "2026-06-10", "coach": "Deborah Wattelier", "event": "updated", "endTime": "12:15", "message": "Le creneau glace du 2026-06-10 (10:15-12:15) a ete modifie. Section: Danse Régionaux.", "section": "Danse Régionaux", "location": "Patinoire (stage)", "provider": "brevo", "startTime": "10:15", "trainingTitle": "GLACE", "providerMessageId": "<202606070644.93604729622@smtp-relay.mailin.fr>"}	2026-06-07 06:44:30.282	2026-06-07 06:44:30.165
\.


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Section" (id, code, name, "isActive", "createdAt", "updatedAt") FROM stdin;
cmq1yej450005tumcwrkg4su8	ARTISTIQUE	Artistique	f	2026-06-06 06:10:01.925	2026-06-06 17:41:19.869
cmq1yej3s0002tumczyu9ono0	LOISIR	Loisirs	t	2026-06-06 06:10:01.912	2026-06-06 17:41:21.586
cmq1yej4m0009tumcvg4svr56	ADULT_ART	Artistique Adultes	t	2026-06-06 06:10:01.942	2026-06-06 17:41:21.599
cmq1z3xyb0000tuugkev5bo5l	ART_NAT	Artistique Nationaux	t	2026-06-06 06:29:47.555	2026-06-06 17:41:21.604
cmq1z3xyv0001tuug51xvlktz	ART_REG	Artistique Régionaux	t	2026-06-06 06:29:47.575	2026-06-06 17:41:21.608
cmq1yej4h0008tumcziy8msch	ADULT_DANSE	Danse Adultes	t	2026-06-06 06:10:01.937	2026-06-06 17:41:21.613
cmq1yej4c0007tumcnnk77mfc	DANSE_NAT	Danse Nationaux	t	2026-06-06 06:10:01.932	2026-06-06 17:41:21.617
cmq1yej490006tumceam3ly89	DANSE_REG	Danse Régionaux	t	2026-06-06 06:10:01.929	2026-06-06 17:41:21.622
cmq2n3joq000btuiax444trge	SYNCHRO_DETECT	Synchro Détection	t	2026-06-06 17:41:19.85	2026-06-06 17:41:21.626
cmq1yej420004tumcsqhvr6x2	SYNCHRO_NOV_B	Synchro Novices B	t	2026-06-06 06:10:01.922	2026-06-06 17:41:21.632
cmq1yej3x0003tumca7y31nz7	SYNCHRO_JUV	Synchro Juvéniles	t	2026-06-06 06:10:01.917	2026-06-06 17:41:21.637
\.


--
-- Data for Name: Skater; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Skater" (id, "firstName", "lastName", "parentEmail", "parentPhone", "isActive", "createdAt", "updatedAt", city) FROM stdin;
cmq2rxo7f0015tuzjljhksq6y	Emile	Cordet	fabien.cordet@gmail.com	+33661730565	t	2026-06-06 19:56:43.852	2026-06-06 19:56:43.852	\N
cmq2rxz9q0018tuzjk9k9g6g5	Léonie	Cordet	fabien.cordet@gmail.com	+33661730565	t	2026-06-06 19:56:58.19	2026-06-06 19:56:58.19	\N
\.


--
-- Data for Name: SkaterSection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SkaterSection" (id, "skaterId", "sectionId", "startsAt", "endsAt") FROM stdin;
cmq2rxo7l0017tuzjf81jol3p	cmq2rxo7f0015tuzjljhksq6y	cmq1yej4c0007tumcnnk77mfc	2026-06-06 19:56:43.856	\N
cmq2rxza4001atuzjm8yphr61	cmq2rxz9q0018tuzjk9k9g6g5	cmq1yej490006tumceam3ly89	2026-06-06 19:56:58.203	\N
\.


--
-- Data for Name: Training; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Training" (id, "weekProfileId", "sectionId", title, type, date, "startTime", "endTime", location, "coachId", notes, source, status, "updatedById", "updatedAt", "createdAt") FROM stdin;
cmq1yej4y000ctumc31umijq7	cmq1yej4q000atumcd43davwv	cmq1yej3s0002tumczyu9ono0	GLACE	HEBDOMADAIRE	2026-06-08 00:00:00	18:00	19:30	Patinoire A	cmq1yt68h0002tuba92b17ydh	Créneau loisir hebdo	manual	published	\N	2026-06-06 17:41:19.885	2026-06-06 06:10:01.954
cmq1yej56000etumcyp6z5ka9	cmq1yej4q000atumcd43davwv	cmq1yej3x0003tumca7y31nz7	GLACE	HEBDOMADAIRE	2026-06-09 00:00:00	19:00	21:00	Patinoire A	cmq1yt68h0002tuba92b17ydh	Synchro Juvéniles	manual	published	\N	2026-06-06 17:41:19.895	2026-06-06 06:10:01.962
cmq1yt6hu000ktuba58d8urcq	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	SOL	HEBDOMADAIRE	2026-06-11 00:00:00	20:00	21:00	Salle Sol 1	cmq1yt5u30000tubaqhbd0g1t	Danse nationaux	manual	published	\N	2026-06-06 17:41:19.91	2026-06-06 06:21:25.41
cmq1z3y0m000etuugl2loohyw	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-04 00:00:00	16:15	18:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.683	2026-06-06 06:29:47.638
cmq1yej5c000gtumc1wyhhlcp	cmq1yej4q000atumcd43davwv	cmq1yej450005tumcwrkg4su8	PPG	STAGE	2026-06-10 00:00:00	17:30	18:30	Salle Sol 2	cmq1yt61n0001tuba0or2tt4q	Préparation stage	manual	published	\N	2026-06-06 06:22:50.476	2026-06-06 06:10:01.968
cmq1z3y0y000ituugsutzze4u	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-06 00:00:00	06:40	08:05	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.697	2026-06-06 06:29:47.65
cmq1ywb2s000etuzjz19a139x	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej3s0002tumczyu9ono0	GLACE	HEBDOMADAIRE	2026-06-15 00:00:00	18:00	19:30	Patinoire A	cmq1yt68h0002tuba92b17ydh	Créneau loisir hebdo	inherited	draft	cmq1yt5u30000tubaqhbd0g1t	2026-06-06 06:23:51.316	2026-06-06 06:23:51.316
cmq1ywb2s000ftuzj0lfke1nz	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej3x0003tumca7y31nz7	GLACE	HEBDOMADAIRE	2026-06-16 00:00:00	19:00	21:00	Patinoire A	cmq1yt68h0002tuba92b17ydh	Synchro Juvéniles	inherited	draft	cmq1yt5u30000tubaqhbd0g1t	2026-06-06 06:23:51.316	2026-06-06 06:23:51.316
cmq1ywb2s000gtuzjkcx47gb4	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej450005tumcwrkg4su8	PPG	HEBDOMADAIRE	2026-06-17 00:00:00	17:30	18:30	Salle Sol 2	cmq1yt61n0001tuba0or2tt4q	Préparation stage	inherited	draft	cmq1yt5u30000tubaqhbd0g1t	2026-06-06 06:23:51.316	2026-06-06 06:23:51.316
cmq1z3xzy0008tuug89v1ipcd	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-01 00:00:00	19:00	20:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.661	2026-06-06 06:29:47.614
cmq1z3y0a000atuugl71on1k5	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-02 00:00:00	16:15	17:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.671	2026-06-06 06:29:47.626
cmq1z3y0g000ctuugv93mz53p	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-03 00:00:00	10:15	12:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.678	2026-06-06 06:29:47.632
cmq1z3y13000ktuugssaxtyhs	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	SOL	STAGE	2026-06-01 00:00:00	18:00	18:45	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.703	2026-06-06 06:29:47.656
cmq1z3y18000mtuuguw42omf6	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	SOL	STAGE	2026-06-04 00:00:00	14:30	15:15	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.71	2026-06-06 06:29:47.66
cmq1z3y1e000otuugkzrl88kz	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-02 00:00:00	17:15	18:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.717	2026-06-06 06:29:47.666
cmq1z3y1k000qtuugucblerbo	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-03 00:00:00	10:15	12:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.723	2026-06-06 06:29:47.672
cmq1z3y1r000stuugswk3qk9e	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-04 00:00:00	16:15	18:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.729	2026-06-06 06:29:47.679
cmq1z3y1w000utuugg4uitby8	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-06 00:00:00	08:20	09:45	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.735	2026-06-06 06:29:47.684
cmq1z3y22000wtuugeym51x0r	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej490006tumceam3ly89	SOL	STAGE	2026-06-02 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.741	2026-06-06 06:29:47.69
cmq1z3y26000ytuugfsxcorkk	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej490006tumceam3ly89	SOL	STAGE	2026-06-03 00:00:00	09:00	09:45	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.747	2026-06-06 06:29:47.695
cmq1z3y2c0010tuug5d7mhy78	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-01 00:00:00	19:00	20:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.754	2026-06-06 06:29:47.7
cmq1z3y2h0012tuugop371k6n	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-02 00:00:00	16:15	17:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.761	2026-06-06 06:29:47.705
cmq1z3y0t000gtuugkq6543lz	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej4c0007tumcnnk77mfc	PPG	STAGE	2026-06-05 00:00:00	06:40	08:00	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	cmq1yt5u30000tubaqhbd0g1t	2026-06-06 19:41:33.836	2026-06-06 06:29:47.645
cmq1z3y2v0016tuugxf1e5z01	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-04 00:00:00	16:15	18:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.773	2026-06-06 06:29:47.719
cmq1z3y300018tuugd4w6e7t6	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-05 00:00:00	06:40	08:00	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.779	2026-06-06 06:29:47.724
cmq1z3y36001atuugq3kr9w8o	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-06 00:00:00	06:40	08:05	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.785	2026-06-06 06:29:47.73
cmq1z3y3c001ctuugbo57w0q2	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	SOL	STAGE	2026-06-01 00:00:00	18:00	18:45	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.79	2026-06-06 06:29:47.736
cmq1z3y3i001etuugektuhcfc	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	SOL	STAGE	2026-06-04 00:00:00	14:30	15:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.797	2026-06-06 06:29:47.742
cmq1z3y3o001gtuugyh0l2935	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-01 00:00:00	17:00	18:45	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.802	2026-06-06 06:29:47.748
cmq1z3y3v001ituugj6xm1ijx	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-02 00:00:00	17:15	18:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.809	2026-06-06 06:29:47.755
cmq1z3y40001ktuugvaa8s4zz	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-03 00:00:00	10:15	12:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.816	2026-06-06 06:29:47.76
cmq1z3y46001mtuugahetidrc	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-04 00:00:00	16:15	18:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.823	2026-06-06 06:29:47.766
cmq1z3y4c001otuugh91aecqq	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-06 00:00:00	08:20	09:45	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.83	2026-06-06 06:29:47.772
cmq1z3y4h001qtuugqu16qeoh	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyv0001tuug51xvlktz	SOL	STAGE	2026-06-02 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.837	2026-06-06 06:29:47.777
cmq1z3y4m001stuug1iz0f5zr	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyv0001tuug51xvlktz	SOL	STAGE	2026-06-03 00:00:00	09:00	09:45	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.844	2026-06-06 06:29:47.782
cmq1z3y4t001utuug6mlyv989	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej3x0003tumca7y31nz7	GLACE	STAGE	2026-06-02 00:00:00	17:15	18:15	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.85	2026-06-06 06:29:47.788
cmq1z3y4z001wtuug8tkb0vq1	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej3x0003tumca7y31nz7	GLACE	STAGE	2026-06-03 00:00:00	10:15	12:15	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.856	2026-06-06 06:29:47.795
cmq1z3y55001ytuug862ochgp	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej3x0003tumca7y31nz7	GLACE	STAGE	2026-06-06 00:00:00	08:20	09:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.863	2026-06-06 06:29:47.801
cmq1z3y5a0020tuughg0084rm	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej3x0003tumca7y31nz7	SOL	STAGE	2026-06-02 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.869	2026-06-06 06:29:47.806
cmq1z3y5f0022tuugwn8seyk5	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-01 00:00:00	20:15	21:30	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.875	2026-06-06 06:29:47.811
cmq1z3y5k0024tuug1uxxia9r	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-02 00:00:00	18:30	19:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.88	2026-06-06 06:29:47.816
cmq1z3y5p0026tuug119mvbxf	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-03 00:00:00	12:30	13:30	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.887	2026-06-06 06:29:47.821
cmq1z3y5v0028tuugx1d6iffi	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-04 00:00:00	12:30	14:00	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.893	2026-06-06 06:29:47.827
cmq1z3y65002btuugj3r4ygyk	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-08 00:00:00	18:30	19:45	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.905	2026-06-06 06:29:47.837
cmq1z3y6b002dtuug0eit4d5i	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-09 00:00:00	17:15	18:30	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.911	2026-06-06 06:29:47.843
cmq1z3y6g002ftuugo2dmehrg	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-10 00:00:00	13:15	14:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.917	2026-06-06 06:29:47.848
cmq1z3y6m002htuugoici2qrp	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-11 00:00:00	16:15	18:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.924	2026-06-06 06:29:47.854
cmq1z3y6r002jtuugid2pwp0o	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-12 00:00:00	06:40	08:00	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.929	2026-06-06 06:29:47.859
cmq1z3y6w002ltuugbxiszhvg	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	GLACE	STAGE	2026-06-13 00:00:00	06:40	08:05	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.935	2026-06-06 06:29:47.864
cmq1z3y71002ntuugx7t3ugnj	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	SOL	STAGE	2026-06-11 00:00:00	14:30	15:15	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.941	2026-06-06 06:29:47.869
cmq1z3y76002ptuugso7x35y7	cmq1yej4q000atumcd43davwv	cmq1yej4c0007tumcnnk77mfc	SOL	STAGE	2026-06-12 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.948	2026-06-06 06:29:47.874
cmq1z3y7c002rtuugwavjpa8u	cmq1yej4q000atumcd43davwv	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-08 00:00:00	17:15	18:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.954	2026-06-06 06:29:47.88
cmq1z3y7o002vtuugknlx6qm8	cmq1yej4q000atumcd43davwv	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-10 00:00:00	10:15	12:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	cmq1yt5u30000tubaqhbd0g1t	2026-06-07 06:44:30.145	2026-06-06 06:29:47.892
cmq1z3y7v002xtuugdz1m8nxt	cmq1yej4q000atumcd43davwv	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-11 00:00:00	16:15	18:15	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.972	2026-06-06 06:29:47.899
cmq1z3y81002ztuug4nzxeodt	cmq1yej4q000atumcd43davwv	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-13 00:00:00	08:20	09:45	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.978	2026-06-06 06:29:47.905
cmq1z3y860031tuugree2joi8	cmq1yej4q000atumcd43davwv	cmq1yej490006tumceam3ly89	SOL	STAGE	2026-06-12 00:00:00	09:00	09:45	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.986	2026-06-06 06:29:47.91
cmq1z3y8c0033tuugize56gme	cmq1yej4q000atumcd43davwv	cmq1yej490006tumceam3ly89	SOL	STAGE	2026-06-13 00:00:00	10:00	11:00	Salle Sol (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.992	2026-06-06 06:29:47.916
cmq1z3y8h0035tuug4lv05tcr	cmq1yej4q000atumcd43davwv	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-08 00:00:00	19:45	21:15	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.999	2026-06-06 06:29:47.921
cmq1z3y8n0037tuug07pcetbp	cmq1yej4q000atumcd43davwv	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-09 00:00:00	18:30	19:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.004	2026-06-06 06:29:47.927
cmq1z3y8t0039tuugliyckk8f	cmq1yej4q000atumcd43davwv	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-10 00:00:00	12:30	13:30	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.01	2026-06-06 06:29:47.933
cmq1z3y8z003btuugefb33ezu	cmq1yej4q000atumcd43davwv	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-11 00:00:00	12:30	14:00	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.016	2026-06-06 06:29:47.939
cmq1z3y9a003etuug76klq7qq	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-15 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.028	2026-06-06 06:29:47.95
cmq1z3y9f003gtuugo6rgpk84	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-16 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.034	2026-06-06 06:29:47.955
cmq1z3y9k003ituugrq4aweto	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-17 00:00:00	17:45	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.039	2026-06-06 06:29:47.96
cmq1z3y9q003ktuugxpwl1dlv	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-18 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.044	2026-06-06 06:29:47.966
cmq1z3y9w003mtuug00l3927h	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-19 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.05	2026-06-06 06:29:47.972
cmq1z3ya2003otuugzscl9j1x	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	SOL	STAGE	2026-06-15 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.055	2026-06-06 06:29:47.978
cmq1z3ya8003qtuug2oaequfu	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	SOL	STAGE	2026-06-16 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.06	2026-06-06 06:29:47.984
cmq1z3yad003stuug1dvpnr1a	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	SOL	STAGE	2026-06-17 00:00:00	16:45	17:30	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.065	2026-06-06 06:29:47.989
cmq1z3yai003utuugx8d9avq2	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	SOL	STAGE	2026-06-18 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.07	2026-06-06 06:29:47.994
cmq1z3yao003wtuugrv4xiu5t	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyb0000tuugkev5bo5l	SOL	STAGE	2026-06-19 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.076	2026-06-06 06:29:48
cmq1z3yat003ytuugw8gpbh28	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-15 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.081	2026-06-06 06:29:48.005
cmq1z3yax0040tuug2u910cxh	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-16 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.088	2026-06-06 06:29:48.009
cmq1z3yb20042tuugiavx8d9q	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-17 00:00:00	17:45	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.094	2026-06-06 06:29:48.014
cmq1z3yb80044tuugpkmizw9q	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-18 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.101	2026-06-06 06:29:48.02
cmq1z3ybc0046tuug4xm72ryu	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	GLACE	STAGE	2026-06-19 00:00:00	18:00	19:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.107	2026-06-06 06:29:48.025
cmq1z3ybi0048tuug0jknz4mg	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	SOL	STAGE	2026-06-15 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.114	2026-06-06 06:29:48.03
cmq1z3ybn004atuug15etgbju	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	SOL	STAGE	2026-06-16 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.12	2026-06-06 06:29:48.035
cmq1z3ybt004ctuugyfioutv8	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	SOL	STAGE	2026-06-17 00:00:00	16:45	17:30	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.125	2026-06-06 06:29:48.041
cmq1z3yby004etuugmp4cnncc	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	SOL	STAGE	2026-06-18 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.131	2026-06-06 06:29:48.046
cmq1z3yc4004gtuug5dzpf90g	cmq1yw7ch000ctuzjfvjuf8kx	cmq1z3xyv0001tuug51xvlktz	SOL	STAGE	2026-06-19 00:00:00	19:30	20:15	Salle Sol (stage)	cmq1yt61n0001tuba0or2tt4q	AN + AR	pdf-import	published	\N	2026-06-06 17:41:22.137	2026-06-06 06:29:48.052
cmq1z3yca004ituugskq4dpi4	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-15 00:00:00	19:30	20:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.143	2026-06-06 06:29:48.058
cmq1z3ych004ktuugfm0ly1y4	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-16 00:00:00	19:30	20:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.149	2026-06-06 06:29:48.065
cmq2n3jq5000ltuiavo66s18a	cmq1yej4q000atumcd43davwv	cmq1z3xyb0000tuugkev5bo5l	PPG	STAGE	2026-06-10 00:00:00	17:30	18:30	Salle Sol 2	cmq1yt61n0001tuba0or2tt4q	Préparation stage	manual	published	\N	2026-06-06 17:41:19.901	2026-06-06 17:41:19.901
cmq1z3y2n0014tuug285oe85m	cmq1ysohb0000tuzjo2e5lxw0	cmq1z3xyb0000tuugkev5bo5l	GLACE	STAGE	2026-06-03 00:00:00	13:15	14:15	Patinoire (stage)	cmq1yt61n0001tuba0or2tt4q	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.767	2026-06-06 06:29:47.711
cmq1z3y7i002ttuugscittmq3	cmq1yej4q000atumcd43davwv	cmq1yej490006tumceam3ly89	GLACE	STAGE	2026-06-09 00:00:00	17:15	18:30	Patinoire (stage)	cmq1yt5u30000tubaqhbd0g1t	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:21.96	2026-06-06 06:29:47.886
cmq1z3ycl004mtuugd03k2s04	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-17 00:00:00	12:45	14:15	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.155	2026-06-06 06:29:48.07
cmq1z3ycr004otuugfwtcxlmn	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-18 00:00:00	19:30	20:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.16	2026-06-06 06:29:48.075
cmq1z3ycw004qtuugyvq3rh6u	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-19 00:00:00	19:30	20:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.166	2026-06-06 06:29:48.08
cmq1z3yd1004stuugrpmo3c8t	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	GLACE	STAGE	2026-06-20 00:00:00	08:30	09:45	Patinoire (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.171	2026-06-06 06:29:48.085
cmq1z3yd6004utuugvrs5wyn4	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	SOL	STAGE	2026-06-15 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.176	2026-06-06 06:29:48.09
cmq1z3ydb004wtuug0ejriyfm	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	SOL	STAGE	2026-06-16 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.181	2026-06-06 06:29:48.095
cmq1z3ydg004ytuugjw9cm5rm	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	SOL	STAGE	2026-06-17 00:00:00	14:45	15:45	Salle Sol (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.187	2026-06-06 06:29:48.1
cmq1z3ydm0050tuugnby9bmw1	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	SOL	STAGE	2026-06-18 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.193	2026-06-06 06:29:48.106
cmq1z3yds0052tuug9py3h9mb	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	SOL	STAGE	2026-06-19 00:00:00	18:30	19:15	Salle Sol (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.198	2026-06-06 06:29:48.112
cmq1z3ydx0054tuugb5v81az7	cmq1yw7ch000ctuzjfvjuf8kx	cmq1yej420004tumcsqhvr6x2	SOL	STAGE	2026-06-20 00:00:00	10:00	11:00	Salle Sol (stage)	cmq1yt68h0002tuba92b17ydh	Import PDF stage été 2026 (mode strict)	pdf-import	published	\N	2026-06-06 17:41:22.204	2026-06-06 06:29:48.117
cmq2rdxc4000utuzj4vrfnqe1	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej3s0002tumczyu9ono0	GLACE	HEBDOMADAIRE	2026-06-07 00:00:00	18:00	19:30	Patinoire A	cmq1yt68h0002tuba92b17ydh	\N	manual	draft	cmq1yt5u30000tubaqhbd0g1t	2026-06-06 19:41:22.564	2026-06-06 19:41:22.564
cmq2rdmoa000rtuzjufj77gfx	cmq1ysohb0000tuzjo2e5lxw0	cmq1yej3s0002tumczyu9ono0	GLACE	HEBDOMADAIRE	2026-06-06 00:00:00	18:00	19:30	Patinoire A	cmq1yt68h0002tuba92b17ydh	\N	manual	draft	cmq1yt5u30000tubaqhbd0g1t	2026-06-06 19:46:40.131	2026-06-06 19:41:08.746
\.


--
-- Data for Name: TrainingAttendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TrainingAttendance" (id, "trainingId", "skaterId", status) FROM stdin;
\.


--
-- Data for Name: TrainingTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TrainingTemplate" (id, "sectionId", title, weekday, "startTime", "endTime", location, "coachId", "isActive") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, "passwordHash", role, "isActive", "createdAt", "updatedAt") FROM stdin;
cmq1yt5u30000tubaqhbd0g1t	Deborah Wattelier	deborah.wattelier@epwlm.local	$2b$10$bXOd64Lu2fYjz8qnanSg7u1uOM4d/p8.4izZgK9.YpopDc9aKYT2K	COACH	t	2026-06-06 06:21:24.555	2026-06-06 17:41:18.516
cmq1yt61n0001tuba0or2tt4q	Camille Zouita	camille.zouita@epwlm.local	$2b$10$3ZWk0U/VZkC1ZtNBbUZlHuGyjVS3hJueAFbOtq59lfpdr0v1lSqUm	COACH	t	2026-06-06 06:21:24.827	2026-06-06 17:41:18.958
cmq1yt68h0002tuba92b17ydh	Angela Tamburrino	angela.tamburrino@epwlm.local	$2b$10$JCyzDHflaBWrQRn.oAKEKuvzUjjEAOEYTxiRl6mioJ87ER.VMK9Gi	COACH	t	2026-06-06 06:21:25.073	2026-06-06 17:41:19.39
cmq1yej3m0001tumc7leu8kll	Admin Démo	admin@epwlm.local	$2b$10$DZ.QarkwD3954KsdxPqz2.RLqsdvyhQfyybAkwsAQqTNcNY3eG3Ve	ADMIN	t	2026-06-06 06:10:01.906	2026-06-06 17:41:19.799
\.


--
-- Data for Name: WeekProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WeekProfile" (id, "isoYear", "isoWeek", label, type, "isPublished", "createdAt", "updatedAt") FROM stdin;
cmq1ysohb0000tuzjo2e5lxw0	2026	23	Stage été 2026 - Semaine 1	STAGE	t	2026-06-06 06:21:02.046	2026-06-06 17:41:21.649
cmq1yej4q000atumcd43davwv	2026	24	Stage été 2026 - Semaine 2	STAGE	t	2026-06-06 06:10:01.947	2026-06-06 17:41:21.899
cmq1yw7ch000ctuzjfvjuf8kx	2026	25	Stage été 2026 - Semaine 3	STAGE	t	2026-06-06 06:23:46.481	2026-06-06 17:41:22.022
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e0ca813c-9f49-4e1a-914f-51b0fd6fd8b8	2ec1d6b3c872932a951acf3a063ef16071e07c2d77dcfd58ae6e19f3c8368b52	2026-06-06 06:09:59.438465+00	0001_init	\N	\N	2026-06-06 06:09:59.29047+00	1
5705c25d-0621-4ca6-b9fb-0202ab0bda10	5e87ec8a071562cb1f125924566e412aa603dc7cb424c7fbc7573cd8b8dbb112	2026-06-06 20:03:57.593779+00	20260606200357_add_skater_city	\N	\N	2026-06-06 20:03:57.584406+00	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Section Section_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_pkey" PRIMARY KEY (id);


--
-- Name: SkaterSection SkaterSection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SkaterSection"
    ADD CONSTRAINT "SkaterSection_pkey" PRIMARY KEY (id);


--
-- Name: Skater Skater_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Skater"
    ADD CONSTRAINT "Skater_pkey" PRIMARY KEY (id);


--
-- Name: TrainingAttendance TrainingAttendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingAttendance"
    ADD CONSTRAINT "TrainingAttendance_pkey" PRIMARY KEY (id);


--
-- Name: TrainingTemplate TrainingTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingTemplate"
    ADD CONSTRAINT "TrainingTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Training Training_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Training"
    ADD CONSTRAINT "Training_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeekProfile WeekProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeekProfile"
    ADD CONSTRAINT "WeekProfile_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: Notification_trainingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_trainingId_idx" ON public."Notification" USING btree ("trainingId");


--
-- Name: Section_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Section_code_key" ON public."Section" USING btree (code);


--
-- Name: SkaterSection_sectionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SkaterSection_sectionId_idx" ON public."SkaterSection" USING btree ("sectionId");


--
-- Name: SkaterSection_skaterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SkaterSection_skaterId_idx" ON public."SkaterSection" USING btree ("skaterId");


--
-- Name: TrainingAttendance_trainingId_skaterId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TrainingAttendance_trainingId_skaterId_key" ON public."TrainingAttendance" USING btree ("trainingId", "skaterId");


--
-- Name: Training_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Training_date_idx" ON public."Training" USING btree (date);


--
-- Name: Training_sectionId_date_startTime_endTime_location_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Training_sectionId_date_startTime_endTime_location_key" ON public."Training" USING btree ("sectionId", date, "startTime", "endTime", location);


--
-- Name: Training_sectionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Training_sectionId_idx" ON public."Training" USING btree ("sectionId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WeekProfile_isoYear_isoWeek_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WeekProfile_isoYear_isoWeek_key" ON public."WeekProfile" USING btree ("isoYear", "isoWeek");


--
-- Name: AuditLog AuditLog_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_trainingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES public."Training"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkaterSection SkaterSection_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SkaterSection"
    ADD CONSTRAINT "SkaterSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkaterSection SkaterSection_skaterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SkaterSection"
    ADD CONSTRAINT "SkaterSection_skaterId_fkey" FOREIGN KEY ("skaterId") REFERENCES public."Skater"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingAttendance TrainingAttendance_skaterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingAttendance"
    ADD CONSTRAINT "TrainingAttendance_skaterId_fkey" FOREIGN KEY ("skaterId") REFERENCES public."Skater"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingAttendance TrainingAttendance_trainingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingAttendance"
    ADD CONSTRAINT "TrainingAttendance_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES public."Training"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TrainingTemplate TrainingTemplate_coachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingTemplate"
    ADD CONSTRAINT "TrainingTemplate_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TrainingTemplate TrainingTemplate_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TrainingTemplate"
    ADD CONSTRAINT "TrainingTemplate_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Training Training_coachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Training"
    ADD CONSTRAINT "Training_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Training Training_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Training"
    ADD CONSTRAINT "Training_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Training Training_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Training"
    ADD CONSTRAINT "Training_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Training Training_weekProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Training"
    ADD CONSTRAINT "Training_weekProfileId_fkey" FOREIGN KEY ("weekProfileId") REFERENCES public."WeekProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict TvyViZhddb9lnfJyOa9M8gharj3bECtJrTDy0g9fVnUojt5yFgvEWRWkEZLULyV

