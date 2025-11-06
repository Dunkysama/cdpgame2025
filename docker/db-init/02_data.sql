-- Seed utilisateurs (idempotent)
-- Mots de passe hashés (bcrypt cost 12) pour: mdp0, mdp1, mdp2, mdp3
-- mdp0 -> $2b$12$6XHmOH2NluC7iSGqlPiJS.nXzd.vy/HCqxr/XFojXBrKNcYIO5/ya
-- mdp1 -> $2b$12$F5pt/SWXNsquUTBZBRVsZOYdF8hX3zoPS8K34AUGV2xkrRs4e2l7e
-- mdp2 -> $2b$12$FENDnbin/FbZ9w7Ao7.J2.o6Sy5SjY/EnRXt9sy4pu627Ym/fk4Zy
-- mdp3 -> $2b$12$00Hbp10pmV2541VkbqqxlehmovM.siMh0M0yVEZSBZPnwTyyP2wjC
INSERT INTO utilisateurs (email, mot_de_passe, nom_utilisateur)
VALUES
  ('u0@example.com', '$2b$12$6XHmOH2NluC7iSGqlPiJS.nXzd.vy/HCqxr/XFojXBrKNcYIO5/ya', 'user_zero'),
  ('u1@example.com', '$2b$12$F5pt/SWXNsquUTBZBRVsZOYdF8hX3zoPS8K34AUGV2xkrRs4e2l7e', 'user_one'),
  ('u2@example.com', '$2b$12$FENDnbin/FbZ9w7Ao7.J2.o6Sy5SjY/EnRXt9sy4pu627Ym/fk4Zy', 'user_two'),
  ('u3@example.com', '$2b$12$00Hbp10pmV2541VkbqqxlehmovM.siMh0M0yVEZSBZPnwTyyP2wjC', 'user_three')
ON CONFLICT (email) DO NOTHING;

-- 4) Seed personnages
-- user_two (2 persos)
WITH u2 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u2@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar, race, sexe, temps_de_jeu)
SELECT (SELECT id_utilisateur FROM u2), 'Elfette', '/asset/Elfe-femelle.png', 'Elfe', 'Femme', 0
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u2 ON p.id_utilisateur=u2.id_utilisateur AND p.pseudo='Elfette'
);

WITH u2 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u2@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar, race, sexe, temps_de_jeu)
SELECT (SELECT id_utilisateur FROM u2), 'NainBarbu', '/asset/Nain-male.png', 'Nain', 'Homme', 25
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u2 ON p.id_utilisateur=u2.id_utilisateur AND p.pseudo='NainBarbu'
);

-- user_one (1 perso)
WITH u1 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u1@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar, race, sexe, temps_de_jeu)
SELECT (SELECT id_utilisateur FROM u1), 'Humana', '/asset/Humain-femelle.png', 'Humain', 'Femme', 156
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u1 ON p.id_utilisateur=u1.id_utilisateur AND p.pseudo='Humana'
);

-- user_three (3 persos)
WITH u3 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u3@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar, race, sexe, temps_de_jeu)
SELECT (SELECT id_utilisateur FROM u3), 'Elfo', '/asset/Elfe-male.png', 'Elfe', 'Homme', 42
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u3 ON p.id_utilisateur=u3.id_utilisateur AND p.pseudo='Elfo'
);

WITH u3 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u3@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar, race, sexe, temps_de_jeu)
SELECT (SELECT id_utilisateur FROM u3), 'Naina', '/asset/Nain-femelle.png', 'Nain', 'Femme', 89
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u3 ON p.id_utilisateur=u3.id_utilisateur AND p.pseudo='Naina'
);

WITH u3 AS (SELECT id_utilisateur FROM utilisateurs WHERE email='u3@example.com')
INSERT INTO personnages (id_utilisateur, pseudo, chemin_avatar, race, sexe, temps_de_jeu)
SELECT (SELECT id_utilisateur FROM u3), 'Le singe', '/asset/Humain-male.png', 'Humain', 'Homme', 77
WHERE NOT EXISTS (
  SELECT 1 FROM personnages p JOIN u3 ON p.id_utilisateur=u3.id_utilisateur AND p.pseudo='Le singe'
);

COMMIT;
