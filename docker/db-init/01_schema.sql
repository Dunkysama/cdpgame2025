-- Schéma initial pour cdpgame2025
-- Création de la table Utilisateurs utilisée par l'application

CREATE TABLE Utilisateurs(
   id_utilisateur SERIAL,
   email VARCHAR(128)  NOT NULL,
   mot_de_passe VARCHAR(128)  NOT NULL,
   nom_utilisateur VARCHAR(128)  NOT NULL,
   date_inscription TIMESTAMP,
   PRIMARY KEY(id_utilisateur),
   UNIQUE(email)
);

CREATE TABLE Badges(
   id_badge SERIAL,
   nom_badge VARCHAR(64)  NOT NULL,
   PRIMARY KEY(id_badge)
);

CREATE TABLE Personnages(
   id_utilisateur INTEGER,
   pseudo VARCHAR(50)  NOT NULL,
   chemin_avatar TEXT NOT NULL,
   PRIMARY KEY(id_utilisateur),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateurs(id_utilisateur)
);

CREATE TABLE Themes(
   id_theme SERIAL,
   nom_theme VARCHAR(64)  NOT NULL,
   id_utilisateur INTEGER,
   PRIMARY KEY(id_theme),
   FOREIGN KEY(id_utilisateur) REFERENCES Personnages(id_utilisateur)
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
