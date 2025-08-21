# Toodl - Interaktive Børnehistorier med AI

## Projektoversigt

**Koncept:** Webapplikation til at skabe interaktive, personaliserede børnehistorier på dansk med AI-genereret tekst, billeder og oplæsning.

**Målgruppe:** Forældre, lærere og pædagoger

**Platform:** Cursor med Supabase backend

## Teknologi Stack

### Backend & Database
- **Database:** Supabase (PostgreSQL med RLS)
- **Auth:** Supabase Auth (OAuth + email/password)
- **Storage:** Supabase Storage (billeder, lyd, exports)

### AI Services
- **Tekstgenerering:** ChatGPT-5 Nano (dansk)
- **Billedgenerering:** Flux-1 Schnell via fal.ai
- **Oplæsning:** ElevenLabs (dansk TTS)

### Frontend
- Cursor-baseret udvikling
- Mobil-first, responsive design
- Tilgængelighed (WCAG AA)

## Datamodel

### Core Tables
```sql
-- Administreres af Supabase Auth
users (via Supabase Auth)

-- Brugerprofildata
user_profiles:
  - id, user_id, display_name, gender, interests[], marketing_consent
  - created_at, updated_at

-- Børneprofiler
children:
  - id, user_id, name, age, gender, interests[], reading_level, avatar_key
  - created_at, updated_at

-- Historier
stories:
  - id, user_id, child_id, title, target_age, genre, theme, difficulty
  - status (draft/published), language (da), created_at, updated_at

-- Historie-noder (scener og valg)
story_nodes:
  - id, story_id, type (scene/choice), text, scene_index
  - parent_node_id, choice_key

-- Valgmuligheder
choices:
  - id, story_id, node_id, label, next_node_id

-- Mediefiler
media_assets:
  - id, story_id, node_id, type (image/audio), storage_path
  - provider, metadata, created_at

-- TTS spor
tts_tracks:
  - id, story_id, node_id, voice_id, language (da-DK)
  - storage_path, duration_ms

-- Generering jobs
generation_jobs:
  - id, story_id, job_type (text/image/tts), provider
  - status (queued/running/succeeded/failed), payload_summary
  - error_message, created_at

-- Læsefremdrift
reading_progress:
  - id, user_id, story_id, current_node_id, path_history[]
  - updated_at

-- Deling
story_shares:
  - id, user_id, story_id, share_token, expires_at
  - permissions (view-only), created_at

-- Audit log
audit_logs:
  - id, user_id, action, target_type, target_id, timestamp
```

## App-sider og Flow

### 1. Sign-up & Onboarding (FOKUS)
**Formål:** Oprette brugerprofil og børneprofiler

**Felter:**
- Bruger: navn, email, adgangskode, alder (valgfri), køn (valgfri), interesser
- Samtykke: vilkår & privatlivspolitik, marketing (valgfri)
- Børneprofiler: navn, alder, køn, interesser, læseniveau, avatar

**Flow:**
1. Opret konto (email + password eller OAuth)
2. Udfyld profiloplysninger
3. Accepter vilkår/privatliv
4. Opret mindst én børneprofil
5. Landing på hjemmeskærm

### 2. Hjemmeskærm
- Stor "Start ny historie"-knap
- Anbefalede historier
- Seneste historier
- Navigation til Bibliotek/Profil

### 3. Story Builder (Step-by-step)
1. Vælg barn
2. Vælg genre
3. Tilpas tema/sværhedsgrad
4. Generér historie

### 4. Story Player
- Scene-for-scene visning
- Tekst + billeder + oplæsning
- Interaktive valg
- Navigation frem/tilbage

### 5. Bibliotek
- Liste over gemte historier
- Sortering/filtrering
- Åbn/slet/del funktioner

### 6. Profil
- Personlige oplysninger
- Børneprofiler
- Sikkerhedsindstillinger
- Aktivitetsstatistik

## RLS Politikker

**Grundprincip:** Brugere kan kun se og administrere deres eget indhold

```sql
-- For alle brugerdata tabeller:
INSERT: kun for authenticated bruger hvor user_id = auth.uid()
SELECT/UPDATE/DELETE: kun hvor row.user_id = auth.uid()

-- Storage: kun signerede URLs via autoriserede endpoints
```

## AI Integration Specs

### Tekstgenerering (ChatGPT-5 Nano)
**Input:** barn_profil, genre, tema, antal_scener, læseniveau
**Output:** strukturerede scener med valg
**Sprog:** Dansk, børnevenlig tone

### Billedgenerering (Flux-1 Schnell via fal.ai)
**Input:** scene_resumé, visuelle_nøgleord, stil
**Output:** 1 billede pr. scene (kvadratisk/4:3)
**Krav:** Konsistent stil, ingen tekst i billeder

### TTS (ElevenLabs)
**Input:** dansk_tekst, stemme_id, hastighed
**Output:** lydfil pr. scene (mp3/ogg)
**Krav:** Naturlig dansk stemme, metadata med varighed

## Performance Krav

- **Generering:** 60-120 sekunder fra "Generér" til afspilning
- **Tilgængelighed:** WCAG AA compliance
- **Sikkerhed:** RLS, signerede URLs, rate limiting
- **Mobile-first:** Responsive design

## Development Priorities

### MVP Fase 1: Onboarding (CURRENT)
- [ ] Supabase setup og RLS politikker
- [ ] User registration/login
- [ ] Profiloprettelse
- [ ] Børneprofil management
- [ ] Email verifikation

### MVP Fase 2: Core Functionality
- [ ] Story Builder flow
- [ ] AI integration (tekst/billeder/TTS)
- [ ] Story Player
- [ ] Basic bibliotek

### MVP Fase 3: Polish
- [ ] Deling funktionalitet
- [ ] Profil management
- [ ] Performance optimering
- [ ] Tilgængelighed audit

## Security & Privacy

### GDPR Compliance
- Samtykke registrering
- Data portabilitet
- Ret til sletning
- Data minimering

### Børnesikkerhed
- Ingen personhenførbare oplysninger i delte versioner
- Indholdsfiltre for børnevenligt indhold
- Sikre delingslinks (tidsbegrænsede, view-only)

### Technical Security
- RLS på alle tabeller
- Signerede storage URLs
- Rate limiting på AI calls
- Input validation og sanitering

## Environment Variables (til senere)


## Success Metrics

### "I Win" Moment
Bruger har genereret, afspillet og gemt sin første interaktive historie med billeder og oplæsning.

### Key Metrics
- Tid fra registrering til første historie
- Gennemførelsesrate for onboarding
- Antal genererede historier pr. bruger
- Delingsrate
- Retention (tilbage inden for 7 dage)

---

*Dette dokument opdateres løbende under udvikling*