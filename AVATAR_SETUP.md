# Avatar Setup Instruktioner

## Fal.ai Integration

For at få avatar generering til at virke, skal du tilføje din Fal.ai API nøgle til `.env.local` filen.

### Trin 1: Få en Fal.ai API nøgle
1. Gå til [fal.ai](https://fal.ai)
2. Opret en konto eller log ind
3. Gå til API Keys sektionen
4. Opret en ny API nøgle

### Trin 2: Tilføj API nøglen til .env.local
Åbn `.env.local` filen i projektets rod og tilføj:

```bash
FAL_KEY=din_fal_ai_api_nøgle_her
```

**VIGTIGT:** Erstat `din_fal_ai_api_nøgle_her` med din rigtige API nøgle.

### Trin 3: Genstart udviklingsserveren
Efter du har tilføjet API nøglen, skal du genstarte udviklingsserveren:

```bash
npm run dev
```

## Funktioner

### Mulighed 1: Custom Avatar
- Vælg hårfarve, skæg, briller osv.
- AI genererer en avatar baseret på dine valg
- Bruger FLUX.1 [schnell] model for hurtig generering
- Tekst-til-billede generering

### Mulighed 2: Foto-baseret Avatar
- Tag et billede med kameraet
- Upload et billede fra din enhed
- AI stiliserer billedet til en cartoon avatar
- Bruger FLUX.1 model for image-to-image generering
- Billedet uploades automatisk til fal.ai storage

### Fallback
Hvis avatar generering fejler, bruges automatisk de statiske avatars baseret på køn.

## Tekniske Detaljer

- **Custom Avatar**: FLUX.1 [schnell] - 4 inference steps, guidance scale 3.5
- **Foto Avatar**: FLUX.1 - 6 inference steps, guidance scale 4.0, strength 0.5
- **Output**: 1024x1024 PNG billeder
- **Safety Checker**: Aktiveret for alle genereringer

## Fejlfinding

Hvis du får fejl:
1. Tjek at `FAL_KEY` er korrekt sat i `.env.local`
2. Tjek at du har internetforbindelse
3. Tjek at din Fal.ai konto har kreditter tilbage
4. Prøv at genstarte udviklingsserveren
5. Tjek browser console for detaljerede fejlmeddelelser

## Krav

- HTTPS connection (krævet for kamera API)
- Moderne browser med WebRTC support
- Fal.ai konto med tilstrækkelige kreditter
