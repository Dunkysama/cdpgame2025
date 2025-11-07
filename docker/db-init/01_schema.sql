-- Schéma initial pour cdpgame2025
-- Création de la table Utilisateurs utilisée par l'application

CREATE TABLE Utilisateurs(
   id_utilisateur SERIAL,
   email VARCHAR(128)  NOT NULL,
   mot_de_passe VARCHAR(128)  NOT NULL,
   nom_utilisateur VARCHAR(128)  NOT NULL,
   date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY(id_utilisateur),
   UNIQUE(email)
);

CREATE TABLE Badges(
   id_badge SERIAL,
   nom_badge VARCHAR(64)  NOT NULL,
   PRIMARY KEY(id_badge)
);

CREATE TABLE Personnages(
   id_personnage SERIAL,
   pseudo VARCHAR(50)  NOT NULL,
   chemin_avatar TEXT NOT NULL,
   race VARCHAR(16)  NOT NULL,
   sexe VARCHAR(16)  NOT NULL,
   temps_de_jeu INTEGER,
   date_suppression TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   id_utilisateur INTEGER NOT NULL,
   PRIMARY KEY(id_personnage),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateurs(id_utilisateur)
);

CREATE TABLE Themes(
   id_theme SERIAL,
   nom_theme VARCHAR(64)  NOT NULL,
   PRIMARY KEY(id_theme)
);

CREATE TABLE Questions(
   id_question SERIAL,
   question VARCHAR(256) ,
   id_theme INTEGER NOT NULL,
   PRIMARY KEY(id_question),
   FOREIGN KEY(id_theme) REFERENCES Themes(id_theme)
);

CREATE TABLE posseder(
   id_utilisateur INTEGER,
   id_badge INTEGER,
   PRIMARY KEY(id_utilisateur, id_badge),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateurs(id_utilisateur),
   FOREIGN KEY(id_badge) REFERENCES Badges(id_badge)
);

CREATE TABLE reussir(
   id_personnage INTEGER,
   id_theme INTEGER,
   PRIMARY KEY(id_personnage, id_theme),
   FOREIGN KEY(id_personnage) REFERENCES Personnages(id_personnage),
   FOREIGN KEY(id_theme) REFERENCES Themes(id_theme)
);
