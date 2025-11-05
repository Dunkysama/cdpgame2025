-- Migration pour permettre plusieurs personnages par utilisateur
-- À exécuter manuellement sur une base déjà initialisée
-- Usage (PowerShell):
-- docker compose exec db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/02_migration_multi_personnages.sql

BEGIN;

-- 1) Ajouter une PK id_personnage à personnages s'il n'existe pas déjà
DO $$
DECLARE
  seq_exists bool;
  conname text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='personnages' AND column_name='id_personnage'
  ) THEN
    -- Supprimer toute FK dans themes référant la PK actuelle de personnages (id_utilisateur)
    FOR conname IN
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name='themes' AND tc.constraint_type='FOREIGN KEY' AND ccu.table_name='personnages'
    LOOP
      EXECUTE 'ALTER TABLE themes DROP CONSTRAINT ' || quote_ident(conname) || ' CASCADE';
    END LOOP;

    ALTER TABLE personnages ADD COLUMN id_personnage INTEGER;

    -- Créer la séquence si nécessaire
    PERFORM 1 FROM pg_class WHERE relname = 'personnages_id_personnage_seq';
    IF NOT FOUND THEN
      CREATE SEQUENCE personnages_id_personnage_seq;
      ALTER SEQUENCE personnages_id_personnage_seq OWNED BY personnages.id_personnage;
    END IF;

    -- Définir la valeur par défaut
    ALTER TABLE personnages ALTER COLUMN id_personnage SET DEFAULT nextval('personnages_id_personnage_seq');

    -- Peupler pour les lignes existantes
    UPDATE personnages SET id_personnage = nextval('personnages_id_personnage_seq') WHERE id_personnage IS NULL;

    -- Contrainte NOT NULL + PK
    ALTER TABLE personnages ALTER COLUMN id_personnage SET NOT NULL;
    -- Supprimer l'ancienne PK (sur id_utilisateur)
    SELECT tc.constraint_name INTO conname
    FROM information_schema.table_constraints tc
    WHERE tc.table_name='personnages' AND tc.constraint_type='PRIMARY KEY';
    IF conname IS NOT NULL THEN
      EXECUTE 'ALTER TABLE personnages DROP CONSTRAINT ' || quote_ident(conname);
    END IF;
    ALTER TABLE ONLY personnages ADD CONSTRAINT personnages_pkey PRIMARY KEY (id_personnage);
  END IF;
END $$;

-- 2) Migrer themes pour référencer id_personnage
DO $$
DECLARE
  conname text;
BEGIN
  -- Ajouter la colonne id_personnage si absente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='themes' AND column_name='id_personnage'
  ) THEN
    ALTER TABLE themes ADD COLUMN id_personnage INTEGER;
  END IF;

  -- Remplir id_personnage à partir de l'existant
  UPDATE themes t
  SET id_personnage = p.id_personnage
  FROM personnages p
  WHERE t.id_personnage IS NULL AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='themes' AND column_name='id_utilisateur'
  ) AND p.id_utilisateur = t.id_utilisateur;

  -- Supprimer l'ancienne FK et colonne id_utilisateur si présente
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='themes' AND column_name='id_utilisateur'
  ) THEN
    SELECT tc.constraint_name INTO conname
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name='themes' AND tc.constraint_type='FOREIGN KEY' AND ccu.column_name='id_utilisateur'
    LIMIT 1;
    IF conname IS NOT NULL THEN
      EXECUTE 'ALTER TABLE themes DROP CONSTRAINT ' || quote_ident(conname);
    END IF;
    ALTER TABLE themes DROP COLUMN id_utilisateur;
  END IF;

  -- Ajouter la nouvelle FK si absente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='themes' AND constraint_type='FOREIGN KEY'
  ) THEN
    ALTER TABLE themes
      ADD CONSTRAINT themes_id_personnage_fkey FOREIGN KEY (id_personnage) REFERENCES personnages(id_personnage) ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Seed utilisateurs (idempotent)
INSERT INTO utilisateurs (email, mot_de_passe, nom_utilisateur)
VALUES
  ('u0@example.com', 'SEED_PLACEHOLDER_HASH', 'user_zero'),
  ('u2@example.com', 'SEED_PLACEHOLDER_HASH', 'user_two'),
  ('u1@example.com', 'SEED_PLACEHOLDER_HASH', 'user_one'),
  ('u3@example.com', 'SEED_PLACEHOLDER_HASH', 'user_three')
ON CONFLICT (email) DO NOTHING;

-- 4) Seed personnages (idempotent approximatif sur couple (user,pseudo))
-- user_two (2 persos)
WITH u2 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u2@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar)
SELECT (SELECT id_utilisateur FROM u2), 'Elfette', '/asset/Elfe-femelle.png'
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u2 ON p.id_utilisateur=u2.id_utilisateur AND p.pseudo='Elfette'
);

WITH u2 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u2@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar)
SELECT (SELECT id_utilisateur FROM u2), 'NainBarbu', '/asset/Nain-male.png'
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u2 ON p.id_utilisateur=u2.id_utilisateur AND p.pseudo='NainBarbu'
);

-- user_one (1 perso)
WITH u1 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u1@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar)
SELECT (SELECT id_utilisateur FROM u1), 'Humana', '/asset/Humain-femelle.png'
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u1 ON p.id_utilisateur=u1.id_utilisateur AND p.pseudo='Humana'
);

-- user_three (3 persos)
WITH u3 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u3@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar)
SELECT (SELECT id_utilisateur FROM u3), 'Elfo', '/asset/Elfe-male.png'
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u3 ON p.id_utilisateur=u3.id_utilisateur AND p.pseudo='Elfo'
);

WITH u3 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u3@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar)
SELECT (SELECT id_utilisateur FROM u3), 'Naina', '/asset/Nain-femelle.png'
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u3 ON p.id_utilisateur=u3.id_utilisateur AND p.pseudo='Naina'
);

WITH u3 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u3@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar)
SELECT (SELECT id_utilisateur FROM u3), 'GobMarchand', '/asset/gobelin-marchand.png'
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u3 ON p.id_utilisateur=u3.id_utilisateur AND p.pseudo='GobMarchand'
);

COMMIT;
